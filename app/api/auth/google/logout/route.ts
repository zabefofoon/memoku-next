import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const headerCookies = await cookies()

  //   const refresh = jar.get('x-google-refresh-token')?.value
  //   const access = jar.get('x-google-access-token')?.value

  //   const oauth2 = new google.auth.OAuth2(
  //     process.env.GOOGLE_CLIENT_ID,
  //     process.env.GOOGLE_CLIENT_SECRET,
  //     `${process.env.APP_ORIGIN}/api/auth/google/callback`
  //   )

  //   try {
  //     if (refresh) {
  //       await oauth2.revokeToken(refresh)
  //     } else if (access) {
  //       await oauth2.revokeToken(access)
  //     }
  //   } catch (e) {
  //     console.error('revoke error', e)
  //   }

  const NAMES = ['x-google-access-token', 'x-google-refresh-token', 'x-google-email']
  for (const name of NAMES) headerCookies.delete(name)

  return NextResponse.json({ ok: true })
}
