import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'node:crypto'

export async function GET() {
  const headerCookies = await cookies()
  const refresh_token = headerCookies.get('x-google-refresh-token')?.value
  const isProd = process.env.NODE_ENV === 'production'

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    `${process.env.APP_ORIGIN}/api/auth/google/callback`
  )

  if (refresh_token) {
    oauth2.setCredentials({ refresh_token })

    const res = await oauth2.getAccessToken().catch(() => undefined)

    if (res?.token) {
      headerCookies.set('x-google-access-token', res?.token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 6,
      })
      return NextResponse.redirect(`${process.env.APP_ORIGIN}/oauth`, { status: 303 })
    }
  }

  const url = oauth2.generateAuthUrl({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    redirect_uri: `${process.env.APP_ORIGIN}/api/auth/google/callback`,
    response_type: 'code',
    access_type: 'offline',
    include_granted_scopes: true,
    login_hint: headerCookies.get('x-google-email')?.value,
    prompt: 'consent',
    scope: [
      'openid',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    state: crypto.randomBytes(32).toString('hex'),
  })

  return NextResponse.redirect(url, { status: 302 })
}
