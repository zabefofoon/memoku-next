import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const fileId = url.searchParams.get('fileId') ?? ''

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
      `tags!A2:A999`, // id
      `tags!E2:E999`, // modified
      `tags!D2:D999`, // deleted
    ],
    valueRenderOption: 'UNFORMATTED_VALUE',
  })
  const [colA, colE, colM] = res.data.valueRanges ?? []

  const metas =
    colA?.values
      ?.map((value, index) => {
        const id = value[0]
        const modified = colE?.values?.[index]?.[0]
        const deleted = colM?.values?.[index]?.[0]
        return { id, modified, index: 2 + index, deleted }
      })
      .filter(
        (meta): meta is { id: string; modified: unknown; index: number; deleted: string } =>
          meta != null
      ) ?? []

  return NextResponse.json({ ok: true, metas })
}

export async function POST(req: Request) {
  const body = (await req.json()) as { fileId: string; meta: { id: string; index: number }[] }

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
    ranges: body.meta.map(({ index }) => `tags!A${index}:L${index}`),
    valueRenderOption: 'UNFORMATTED_VALUE',
  })

  const valueRanges = res.data.valueRanges ?? []

  const tags = valueRanges
    .map(({ values }, i) => {
      const row = values?.[0]
      if (!row) return null

      const meta = body.meta[i]

      return {
        index: meta.index,
        id: row[0],
        color: row[1],
        label: row[2],
        deleted: row[3],
        modified: row[4],
      }
    })
    .filter((tag): tag is NonNullable<typeof tag> => tag !== null)

  return NextResponse.json({ ok: true, tags })
}
