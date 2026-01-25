import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const url = new URL(req.url)

  const fileId = url.searchParams.get('fileId') ?? ''
  if (!fileId) return NextResponse.json({ ok: false })

  const id = url.searchParams.get('id') ?? ''
  const color = url.searchParams.get('color') ?? ''
  const label = url.searchParams.get('label') ?? ''
  const modified = url.searchParams.get('now') ?? ''

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
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: fileId,
    valueInputOption: 'RAW',
    range: 'tags',
    requestBody: {
      values: [[id, color, label, modified, '']],
    },
  })

  let index: number | undefined
  const updatedRange = res.data.updates?.updatedRange

  if (updatedRange) {
    const match = updatedRange.match(/![A-Z]+(\d+):/)
    if (match?.[1]) index = Number(match[1])
  }

  return NextResponse.json({ ok: res.status === 200, index })
}

export async function PATCH(req: Request) {
  const url = new URL(req.url)

  const fileId = url.searchParams.get('fileId') ?? ''
  const index = url.searchParams.get('index') ?? ''
  if (!fileId || !index) return NextResponse.json({ ok: false })

  const color = url.searchParams.get('color') ?? ''
  const label = url.searchParams.get('label') ?? ''
  const modified = url.searchParams.get('now') ?? ''
  const deleted = url.searchParams.get('deleted') ?? ''

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: { range: string; values: any[][] }[] = []

  if (color) data.push({ range: `tags!B${index}:B${index}`, values: [[color]] })
  if (label) data.push({ range: `tags!C${index}:C${index}`, values: [[label]] })
  if (deleted) data.push({ range: `tags!E${index}:E${index}`, values: [[true]] })
  data.push({ range: `tags!D${index}:D${index}`, values: [[modified]] })

  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: fileId,
    requestBody: { valueInputOption: 'RAW', data },
  })

  return NextResponse.json({ ok: res.status === 200 })
}
