import { Todo } from '@/app/models/Todo'
import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const todoToRow = (todo: Todo) => [
  todo.id,
  todo.description,
  todo.tagId,
  todo.created,
  todo.modified,
  todo.images?.join(','),
  todo.status ?? 'created',
  todo.parentId,
  todo.childId,
  todo.start,
  todo.end,
  todo.days?.join(','),
]

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

  if (body?.fileId == null) return NextResponse.json({ ok: false })
  if (body?.todos == null) return NextResponse.json({ ok: false })

  const spreadsheet = google.sheets({ version: 'v4', auth: oauth2 })
  if (body?.todos.length) {
    const values = body.todos.map(todoToRow)

    await spreadsheet.spreadsheets.values.append({
      spreadsheetId: body.fileId,
      valueInputOption: 'RAW',
      range: 'todo2',
      requestBody: { values },
    })
  }

  return NextResponse.json({ ok: true })
}
