import { authConfigured, checkCredentials, clearCookie, isAuthenticated, sameOrigin, sessionCookie } from './auth'

// FitZone API — Cloudflare Worker -> Supabase (Postgres via PostgREST).
// Serves /api/*; everything else is the static React app.

interface Env {
  ASSETS: { fetch(r: Request): Promise<Response> }
  SUPABASE_URL: string
  SUPABASE_SECRET_KEY: string // set as a Cloudflare secret, never in code
  TIMEZONE?: string
  ADMIN_USERNAME?: string
  ADMIN_PASSWORD?: string // Cloudflare secret
}

const STATUSES = ['Active', 'Expiring', 'Expired', 'Inactive']
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
const fail = (error: string, status = 400) => json({ error }, status)

class HttpError extends Error { constructor(public status: number, message: string) { super(message) } }

// ---- Supabase REST helper ----
async function sb<T>(env: Env, path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  const key = env.SUPABASE_SECRET_KEY
  const headers: Record<string, string> = { apikey: key, 'Content-Type': 'application/json' }
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}` // legacy JWT-style service_role key
  if (init.prefer) headers.Prefer = init.prefer
  const res = await fetch(`${env.SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/${path}`, { ...init, headers })
  const text = await res.text()
  const body = text ? JSON.parse(text) : null
  if (!res.ok) {
    if (body?.code === '23505') throw new HttpError(409, 'This member is already checked in.')
    if (body?.code === '42P01') throw new HttpError(500, 'Database tables are missing. Run supabase.sql in the Supabase SQL Editor.')
    throw new HttpError(500, body?.message || `Database error (${res.status})`)
  }
  return body as T
}

// ---- helpers ----
const tzOf = (env: Env) => env.TIMEZONE || 'Asia/Kolkata'
const todayIn = (tz: string, d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d) // YYYY-MM-DD
const timeIn = (tz: string, iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).toUpperCase()
const displayDate = (tz: string, d = new Date()) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: tz, day: '2-digit', month: 'short', year: 'numeric' }).format(d)
const addMonths = (tz: string, n: number) => { const d = new Date(); d.setMonth(d.getMonth() + n); return displayDate(tz, d) }
const initials = (name: string) => name.split(/\s+/).filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
const clean = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const safeId = (v: string) => /^[A-Za-z0-9_-]+$/.test(v)

type MemberRow = { id: string; name: string; email: string; phone: string; gender: string; plan: string; joined: string; expiry: string; status: string }
const memberOut = (m: MemberRow) => ({ id: m.id, name: m.name, email: m.email, phone: m.phone, gender: m.gender, plan: m.plan, joined: m.joined, expiry: m.expiry, status: m.status, avatar: initials(m.name) })
const MEMBER_COLS = 'id,name,email,phone,gender,plan,joined,expiry,status'

type VisitRow = { id: string; member_id: string; check_in_at: string; check_out_at: string | null; method: string; members: { name: string } | null }
const visitOut = (v: VisitRow, tz: string) => ({
  id: v.id, memberId: v.member_id, member: v.members?.name ?? v.member_id,
  time: timeIn(tz, v.check_in_at),
  checkOut: v.check_out_at ? timeIn(tz, v.check_out_at) : '—',
  method: v.method, status: v.check_out_at ? 'Checked out' : 'Checked in',
})
const VISIT_COLS = 'id,member_id,check_in_at,check_out_at,method,members(name)'

async function readBody(req: Request): Promise<Record<string, unknown>> {
  try { const b = await req.json(); return b && typeof b === 'object' ? (b as Record<string, unknown>) : {} } catch { return {} }
}
function memberFields(b: Record<string, unknown>, tz: string) {
  const status = clean(b.status) || 'Active'
  return {
    name: clean(b.name), email: clean(b.email, 200), phone: clean(b.phone, 40),
    gender: clean(b.gender, 20) || 'Male', plan: clean(b.plan) || 'Monthly Flex',
    joined: clean(b.joined, 30) || displayDate(tz), expiry: clean(b.expiry, 30) || addMonths(tz, 1),
    status: STATUSES.includes(status) ? status : 'Active',
  }
}

// ---- routes ----
async function handleApi(req: Request, env: Env, url: URL): Promise<Response> {
  const tz = tzOf(env)
  const path = url.pathname.replace(/\/+$/, '')
  const method = req.method

  // Members
  if (path === '/api/members' && method === 'GET') {
    const rows = await sb<MemberRow[]>(env, `members?select=${MEMBER_COLS}&order=seq.desc`)
    return json(rows.map(memberOut))
  }
  if (path === '/api/members' && method === 'POST') {
    const f = memberFields(await readBody(req), tz)
    if (!f.name) return fail('Member name is required.')
    const rows = await sb<MemberRow[]>(env, `members?select=${MEMBER_COLS}`, { method: 'POST', body: JSON.stringify(f), prefer: 'return=representation' })
    return json(memberOut(rows[0]), 201)
  }
  const memberMatch = path.match(/^\/api\/members\/([A-Za-z0-9_-]+)$/)
  if (memberMatch && method === 'PUT') {
    const f = memberFields(await readBody(req), tz)
    if (!f.name) return fail('Member name is required.')
    const rows = await sb<MemberRow[]>(env, `members?id=eq.${memberMatch[1]}&select=${MEMBER_COLS}`, { method: 'PATCH', body: JSON.stringify(f), prefer: 'return=representation' })
    if (!rows.length) return fail('Member not found.', 404)
    return json(memberOut(rows[0]))
  }

  // Attendance
  if (path === '/api/attendance' && method === 'GET') {
    const date = url.searchParams.get('date') || todayIn(tz)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail('Invalid date. Use YYYY-MM-DD.')
    const rows = await sb<VisitRow[]>(env, `attendance?select=${VISIT_COLS}&work_date=eq.${date}&order=check_in_at.desc`)
    return json(rows.map(v => visitOut(v, tz)))
  }
  if (path === '/api/attendance/checkin' && method === 'POST') {
    const b = await readBody(req)
    const memberId = clean(b.memberId, 40)
    const via = b.method === 'QR' ? 'QR' : 'Manual'
    if (!memberId || !safeId(memberId)) return fail('A valid memberId is required.')
    const found = await sb<{ id: string; name: string; status: string }[]>(env, `members?id=eq.${memberId}&select=id,name,status`)
    if (!found.length) return fail('Member not found.', 404)
    if (found[0].status === 'Expired' || found[0].status === 'Inactive') return fail('This member is not currently eligible for check-in.', 403)
    const rows = await sb<VisitRow[]>(env, `attendance?select=${VISIT_COLS}`, {
      method: 'POST', prefer: 'return=representation',
      body: JSON.stringify({ member_id: memberId, work_date: todayIn(tz), method: via }),
    })
    return json(visitOut(rows[0], tz), 201)
  }
  const outMatch = path.match(/^\/api\/attendance\/([A-Za-z0-9_-]+)\/checkout$/)
  if (outMatch && method === 'POST') {
    const rows = await sb<VisitRow[]>(env, `attendance?id=eq.${outMatch[1]}&check_out_at=is.null&select=${VISIT_COLS}`, {
      method: 'PATCH', prefer: 'return=representation', body: JSON.stringify({ check_out_at: new Date().toISOString() }),
    })
    if (!rows.length) return fail('Visit not found or already checked out.', 404)
    return json({ ok: true, checkOut: timeIn(tz, rows[0].check_out_at!) })
  }

  return fail('Not found.', 404)
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function handleAuth(req: Request, env: Env, url: URL): Promise<Response | null> {
  const secure = url.protocol === 'https:'
  if (url.pathname === '/api/auth/me' && req.method === 'GET')
    return json({ authenticated: await isAuthenticated(env, req), configured: authConfigured(env) })
  if (url.pathname === '/api/auth/logout' && req.method === 'POST')
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearCookie(secure) } })
  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    if (!authConfigured(env)) return fail('Admin login is not set up yet. Add the ADMIN_PASSWORD secret (at least 8 characters).', 503)
    const b = await readBody(req)
    const ok = await checkCredentials(env, clean(b.username, 100), typeof b.password === 'string' ? b.password.slice(0, 200) : '')
    if (!ok) { await sleep(700); return fail('Incorrect username or password.', 401) }
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Set-Cookie': await sessionCookie(env, secure) } })
  }
  return null
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req)
    if (!sameOrigin(req, url)) return fail('Cross-site request blocked.', 403)
    try {
      if (url.pathname === '/api/health') return json({ ok: true, database: !!env.SUPABASE_URL && !!env.SUPABASE_SECRET_KEY, login: authConfigured(env) })
      const authRes = await handleAuth(req, env, url)
      if (authRes) return authRes
      // Everything below requires an admin session.
      if (!(await isAuthenticated(env, req))) return fail('Please sign in.', 401)
      if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY)
        return fail('Database not connected: set SUPABASE_URL and SUPABASE_SECRET_KEY (see README).', 500)
      return await handleApi(req, env, url)
    } catch (e) {
      if (e instanceof HttpError) return fail(e.message, e.status)
      console.error(e); return fail('Server error. Please try again.', 500)
    }
  },
}
