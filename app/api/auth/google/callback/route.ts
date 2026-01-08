import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  if (!code)
    return NextResponse.redirect(`${process.env.APP_ORIGIN}/?err=no_code`, {
      status: 303,
    })

  const isProd = process.env.NODE_ENV === 'production'
  const headerCookies = await cookies()

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID!,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    `${process.env.APP_ORIGIN}/api/auth/google/callback`
  )

  try {
    const res = await oauth2.getToken(code)
    oauth2.setCredentials(res.tokens)

    if (res.tokens.refresh_token) {
      headerCookies.set('x-google-refresh-token', res.tokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 3650, // ~10년
      })
    }
    if (res.tokens.access_token) {
      headerCookies.set('x-google-access-token', res.tokens.access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 6, // 6h
      })
    }
    if (res.tokens.id_token) {
      try {
        const payload = JSON.parse(
          Buffer.from(res.tokens.id_token.split('.')[1], 'base64').toString()
        )

        if (payload?.email) {
          headerCookies.set('x-google-email', payload.email, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1년
          })
        }
      } catch {}
    }

    return NextResponse.redirect(`${process.env.APP_ORIGIN}/app`, { status: 303 })
  } catch {
    return NextResponse.redirect(
      `${process.env.APP_ORIGIN}/app/?err=${encodeURIComponent('oauth_error')}`,
      { status: 303 }
    )
  }
}
