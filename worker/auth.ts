// Admin authentication: single admin, password kept in a Cloudflare secret (ADMIN_PASSWORD).
// Session = signed cookie "expiry.signature" (HMAC-SHA256). Stateless, HttpOnly, SameSite=Strict.

export interface AuthEnv {
  ADMIN_USERNAME?: string
  ADMIN_PASSWORD?: string
  SUPABASE_SECRET_KEY?: string
}

const COOKIE = 'fz_session'
const SESSION_SECONDS = 60 * 60 * 24 * 7 // 7 days
const enc = new TextEncoder()

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
const sha256 = async (s: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)))

// Constant-time comparison of two strings (compares fixed-length hashes).
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([sha256(a), sha256(b)])
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}

async function hmac(env: AuthEnv, data: string): Promise<string> {
  // Key depends on the password, so changing ADMIN_PASSWORD logs everyone out.
  const keyMaterial = `${env.ADMIN_PASSWORD}|${env.SUPABASE_SECRET_KEY ?? ''}|fitzone-session-v1`
  const key = await crypto.subtle.importKey('raw', enc.encode(keyMaterial), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(data)))
}

export const authConfigured = (env: AuthEnv) => !!env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length >= 8

export async function checkCredentials(env: AuthEnv, username: string, password: string): Promise<boolean> {
  const okUser = await safeEqual(username.trim().toLowerCase(), (env.ADMIN_USERNAME || 'admin').toLowerCase())
  const okPass = await safeEqual(password, env.ADMIN_PASSWORD || '')
  return okUser && okPass // both always evaluated
}

export async function sessionCookie(env: AuthEnv, secure: boolean): Promise<string> {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS)
  const sig = await hmac(env, exp)
  return `${COOKIE}=${exp}.${sig}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`
}

export const clearCookie = (secure: boolean) => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`

export async function isAuthenticated(env: AuthEnv, req: Request): Promise<boolean> {
  if (!authConfigured(env)) return false
  const raw = req.headers.get('Cookie') || ''
  const m = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([0-9]+)\\.([0-9a-f]{64})`))
  if (!m) return false
  const [, exp, sig] = m
  if (Number(exp) < Date.now() / 1000) return false
  return safeEqual(sig, await hmac(env, exp))
}

// Block cross-site writes (defence in depth on top of SameSite=Strict).
export function sameOrigin(req: Request, url: URL): boolean {
  if (req.method === 'GET' || req.method === 'HEAD') return true
  const origin = req.headers.get('Origin')
  return !origin || origin === url.origin
}
