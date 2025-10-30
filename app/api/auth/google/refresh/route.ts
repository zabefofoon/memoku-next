import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const headerCookies = await cookies()
  const refresh = headerCookies.get('x-google-refresh-token')?.value
  if (!refresh) return NextResponse.json({ ok: false, error: 'NO_REFRESH' }, { status: 401 })

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      refresh_token: refresh,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) return NextResponse.json({ ok: false }, { status: 401 })
  const data = (await res.json()) as {
    access_token?: string
    expires_in?: number
  }

  if (!data.access_token) return NextResponse.json({ ok: false }, { status: 401 })

  const isProd = process.env.NODE_ENV === 'production'
  headerCookies.set('x-google-access-token', data.access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 6,
  })

  return NextResponse.json({ ok: true })
}
