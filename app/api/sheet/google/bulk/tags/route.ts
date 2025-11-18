import { Tag } from '@/app/models/Todo'
import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const tagToRow = (tag: Tag) => [tag.id, tag.color, tag.label, tag.modified]

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

  if (body?.fileId == null || body?.tags == null) NextResponse.json({ ok: false })

  const spreadsheet = google.sheets({ version: 'v4', auth: oauth2 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagsWithIndex = body.tags.filter((t: any) => t.index != null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagsWithoutIndex = body.tags.filter((t: any) => t.index == null)

  if (tagsWithIndex.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = tagsWithIndex.map((tag: any) => ({
      range: `tags!A${tag.index}`,
      values: [tagToRow(tag)],
    }))

    await spreadsheet.spreadsheets.values.batchUpdate({
      spreadsheetId: body.fileId,
      requestBody: { valueInputOption: 'RAW', data },
    })
  }

  let appendStartIndex: number
  if (tagsWithoutIndex.length > 0) {
    const values = tagsWithoutIndex.map(tagToRow)

    const res = await spreadsheet.spreadsheets.values.append({
      spreadsheetId: body.fileId,
      valueInputOption: 'RAW',
      range: 'tags',
      requestBody: { values },
    })

    const updatedRange = res.data.updates?.updatedRange
    if (updatedRange) {
      const match = updatedRange.match(/![A-Z]+(\d+):/)
      if (match?.[1]) appendStartIndex = Number(match[1])
    }
  }

  let appendOffset = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indexes = body.tags.map((tag: any) => {
    if (tag.index != null) return tag.index

    if (appendStartIndex == null) return null // append 실패 시 안전장치

    const rowIndex = appendStartIndex + appendOffset
    appendOffset += 1
    return rowIndex
  })

  return NextResponse.json({ ok: true, indexes })
}
