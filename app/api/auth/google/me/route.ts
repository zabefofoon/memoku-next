import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const headerCookies = await cookies()
  const access = headerCookies.get('x-google-access-token')?.value
  const refresh = headerCookies.get('x-google-refresh-token')?.value
  const isProd = process.env.NODE_ENV === 'production'

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID!,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    `${process.env.APP_ORIGIN}/api/auth/google/callback`
  )
  oauth2.setCredentials({ access_token: access, refresh_token: refresh })

  oauth2.on('tokens', (tokens) => {
    if (tokens.access_token) {
      headerCookies.set('x-google-access-token', tokens.access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 6,
      })
    }
    if (tokens.refresh_token) {
      headerCookies.set('x-google-refresh-token', tokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 3650,
      })
    }
  })

  try {
    const res = await google.oauth2({ version: 'v2', auth: oauth2 }).userinfo.get()

    if (res.data?.id || res.data?.email) {
      return NextResponse.json({
        ok: true,
        id: res.data.id,
        email: res.data.email,
        email_verified: res.data.verified_email,
        picture: res.data.picture,
        name: res.data.name,
      })
    }
    return NextResponse.json({ ok: false }, { status: 401 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'USERINFO_FAILED' }, { status: 401 })
  }
}
