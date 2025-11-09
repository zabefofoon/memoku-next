import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const fileId = url.searchParams.get('fileId') ?? ''
  const todoId = url.searchParams.get('id') ?? ''

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

  const idsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: fileId,
    range: `todo2!A2:A`,
    majorDimension: 'ROWS',
  })

  const index = idsRes.data.values?.flatMap((value) => value).findIndex((id) => id === todoId) ?? -1
  if (index < 0) return NextResponse.json({ ok: true, todo: undefined })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: fileId,
    range: `todo2!A${index + 2}:Z${index + 2}`,
    majorDimension: 'ROWS',
  })
  let todo

  const row = res.data.values?.[0] as string[]
  if (row) {
    todo = {
      id: row[0],
      description: row[1],
      tagId: row[2],
      created: Number(row[3]),
      modified: Number(row[4]),
      images: row[5]?.split(',').filter((item) => item),
      status: row[6],
      parentId: row[7],
      childId: row[8],
      start: Number(row[9]),
      end: Number(row[10]),
      days: row[11]?.split(',').filter((item) => item),
    }
  }
  return NextResponse.json({ ok: true, todo })
}
