import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  const fileId = String(body.fileId ?? '')
  if (!fileId) return NextResponse.json({ ok: false })

  const id = String(body.id ?? '')
  const created = String(body.created ?? '')
  const modified = String(body.modified ?? '')
  const parent = String(body.parent ?? '')
  const tag = String(body.tag ?? '')

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
    range: 'todo2',
    requestBody: {
      values: [[id, '', tag, +created, +modified, '', 'created', parent.replace('undefined', '')]],
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
  const body = await req.json().catch(() => ({}))

  const fileId = String(body.fileId ?? '')
  const index = String(body.index ?? '')
  if (!fileId || !index) return NextResponse.json({ ok: false })

  const description = String(body.description ?? '')
  const tag = String(body.tag ?? '')
  const start = String(body.start ?? '')
  const end = String(body.end ?? '')
  const images = String(body.images ?? '')
  const status = String(body.status ?? '')
  const childId = String(body.child ?? '')
  const parentId = String(body.parent ?? '')
  const deleted = String(body.deleted ?? '')
  const modified = String(body.modified ?? '')
  const daysParam = String(body.days ?? '')
  const days = daysParam ? daysParam.split(',') : undefined

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

  if (deleted) data.push({ range: `todo2!M${index}:M${index}`, values: [[true]] })
  if (description) data.push({ range: `todo2!B${index}:B${index}`, values: [[description]] })
  if (tag) data.push({ range: `todo2!C${index}:C${index}`, values: [[tag]] })
  if (images)
    data.push({ range: `todo2!F${index}:F${index}`, values: [[images.replace('undefined', '')]] })
  if (status) data.push({ range: `todo2!G${index}:G${index}`, values: [[status]] })
  if (childId || parentId)
    data.push({
      range: `todo2!H${index}:I${index}`,
      values: [[parentId.replace('undefined', ''), childId.replace('undefined', '')]],
    })

  if (start || end || daysParam) {
    data.push({
      range: `todo2!J${index}:L${index}`,
      values: [
        [
          start.replace('undefined', '') || '',
          end.replace('undefined', '') || '',
          days ? days.join(',') : '',
        ],
      ],
    })
  }

  data.push({ range: `todo2!E${index}:E${index}`, values: [[modified]] })

  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: fileId,
    requestBody: {
      valueInputOption: 'RAW',
      data,
    },
  })

  return NextResponse.json({ ok: res.status === 200 })
}
