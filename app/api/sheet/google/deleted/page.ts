import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const fileId = url.searchParams.get('fileId') ?? ''
  const start = Number(url.searchParams.get('start') ?? '2')
  const end = Number(url.searchParams.get('end') ?? start + 999)

  if (!fileId) return NextResponse.json({ ok: false })

  const headerCookies = await cookies()
  const access = headerCookies.get('x-google-access-token')?.value
  const refresh = headerCookies.get('x-google-refresh-token')?.value

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID!,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    `${process.env.APP_ORIGIN}/api/auth/google/callback`
  )
  oauth2.setCredentials({ access_token: access, refresh_token: refresh })

  const sheets = google.sheets({ version: 'v4', auth: oauth2 })

  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: fileId,
    ranges: [
      `todo2!A${start}:A${end}`, // id
      `todo2!M${start}:M${end}`, // deleted
    ],
    valueRenderOption: 'UNFORMATTED_VALUE',
  })

  const [colA, colM] = res.data.valueRanges ?? []

  const metas =
    colA?.values
      ?.map((value, index) => {
        const id = value[0]
        const deletedRaw = colM?.values?.[index]?.[0]
        const isDeleted = [true, 'true', 'TRUE', 1].includes(deletedRaw)
        return isDeleted ? undefined : { id }
      })
      .filter((meta): meta is { id: string; index: number } => meta != null) ?? []

  return NextResponse.json({ ok: true, metas })
}
