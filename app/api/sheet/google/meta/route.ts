import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const fileId = url.searchParams.get('fileId') ?? ''

  if (fileId == null) return NextResponse.json({ ok: false })

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
    ranges: ['todo2!A2:A', 'todo2!E2:E'],
    valueRenderOption: 'UNFORMATTED_VALUE',
  })

  const [colA, colB] = res.data.valueRanges!
  return NextResponse.json({
    ok: res.ok,
    metas: colA.values!.map((value, index) => {
      return {
        id: value[0],
        modified: colB.values![index][0],
        index: index + 2,
      }
    }),
  })
}

export async function POST(req: Request) {
  const body = await req.json()

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
    spreadsheetId: body.fileId ?? '',
    ranges: body.meta.map(({ index }) => `todo2!A${index}:L${index}`),
    valueRenderOption: 'UNFORMATTED_VALUE',
  })
  if (res.ok) {
    const todos = res.data.valueRanges
      ?.flatMap(({ values }) => values)
      .map((row) => {
        const _row = row!

        return {
          id: _row[0],
          description: _row[1],
          tagId: _row[2],
          created: _row[3],
          modified: _row[4],
          images: _row[5] ? _row[5]?.split(',') : undefined,
          status: _row[6],
          parentId: _row[7],
          childId: _row[8],
          start: _row[9],
          end: _row[10],
          days: _row[11]?.split(','),
        }
      })
    return NextResponse.json({ ok: res.ok, todos })
  } else return NextResponse.json({ ok: res.ok, todos: undefined })
}
