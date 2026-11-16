import type { Member, Visit } from './data/mock'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`)
  return data as T
}

export type MemberInput = Omit<Member, 'id' | 'avatar'>

export const api = {
  members: () => req<Member[]>('/api/members'),
  addMember: (m: MemberInput) => req<Member>('/api/members', { method: 'POST', body: JSON.stringify(m) }),
  updateMember: (id: string, m: MemberInput) => req<Member>(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(m) }),
  attendance: () => req<Visit[]>('/api/attendance'),
  checkIn: (memberId: string, method: 'Manual' | 'QR' = 'Manual') =>
    req<Visit>('/api/attendance/checkin', { method: 'POST', body: JSON.stringify({ memberId, method }) }),
  checkOut: (id: string) => req<{ ok: true }>(`/api/attendance/${id}/checkout`, { method: 'POST' }),
}
