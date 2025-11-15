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
      `todo2!E${start}:E${end}`, // modified
      `todo2!M${start}:M${end}`, // deleted
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
        return { id, modified, index: start + index, deleted }
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
    ranges: body.meta.map(({ index }) => `todo2!A${index}:L${index}`),
    valueRenderOption: 'UNFORMATTED_VALUE',
  })

  const valueRanges = res.data.valueRanges ?? []

  const todos = valueRanges
    .map(({ values }, i) => {
      const row = values?.[0]
      if (!row) return null

      const meta = body.meta[i]

      const images = row[5]
        ? String(row[5])
            .split(',')
            .map((v: string) => v.trim())
            .filter(Boolean)
        : undefined

      return {
        // 여기서 index 같이 내려줌
        index: meta.index,

        id: row[0],
        description: row[1],
        tagId: row[2],
        created: row[3],
        modified: row[4],
        images,
        status: row[6],
        parentId: row[7],
        childId: row[8],
        start: row[9],
        end: row[10],
        days: row[11] ? String(row[11]).split(',') : undefined,
      }
    })
    .filter((todo): todo is NonNullable<typeof todo> => todo !== null)

  return NextResponse.json({ ok: true, todos })
}
