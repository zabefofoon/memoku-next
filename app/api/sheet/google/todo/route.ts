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
      index,
    }
  }
  return NextResponse.json({ ok: true, todo })
}

export async function PATCH(req: Request) {
  const url = new URL(req.url)

  const fileId = url.searchParams.get('fileId') ?? ''
  const todoId = url.searchParams.get('id') ?? ''
  const index = url.searchParams.get('index') ?? ''

  const description = url.searchParams.get('description') ?? ''
  const tag = url.searchParams.get('tag') ?? ''
  const start = url.searchParams.get('start') ?? ''
  const end = url.searchParams.get('end') ?? ''
  const images = url.searchParams.get('images') ?? ''
  const status = url.searchParams.get('status') ?? ''
  const days = url.searchParams.get('days') ? url.searchParams.get('days')?.split(',') : ''

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

  let targetData
  if (description) targetData = { range: `todo2!B${index}:B${index}`, values: [[description]] }
  if (tag) targetData = { range: `todo2!C${index}:C${index}`, values: [[tag]] }
  if (images) targetData = { range: `todo2!F${index}:F${index}`, values: [[images]] }
  if (status) targetData = { range: `todo2!G${index}:G${index}`, values: [[status]] }
  if (days) targetData = { range: `todo2!L${index}:L${index}`, values: [[days]] }

  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: fileId,
    requestBody: {
      valueInputOption: 'RAW',
      data: [targetData ?? {}, { range: `todo2!E${index}:E${index}`, values: [[Date.now()]] }],
    },
  })
  return NextResponse.json({ ok: res.ok })
}
