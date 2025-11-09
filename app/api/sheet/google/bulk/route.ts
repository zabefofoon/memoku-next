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

export async function GET(req: Request) {
  const url = new URL(req.url)
  const fileId = url.searchParams.get('fileId') ?? ''

  const headerCookies = await cookies()
  const access = headerCookies.get('x-google-access-token')?.value
  const refresh = headerCookies.get('x-google-refresh-token')?.value

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID!,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    `${process.env.APP_ORIGIN}/api/auth/google/callback`
  )
  oauth2.setCredentials({ access_token: access, refresh_token: refresh })

  const res = await google.sheets({ version: 'v4', auth: oauth2 }).spreadsheets.values.get({
    spreadsheetId: fileId,
    range: 'todo2',
  })

  if (res.ok) {
    const [_, ...rows] = res.data.values as string[][]
    const todos = rows.map((row) => {
      return {
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
    })
    return NextResponse.json({ ok: res.ok, todos })
  } else {
    return NextResponse.json({ ok: res.ok, todos: undefined })
  }
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

  if (body?.fileId == null) return NextResponse.json({ ok: false })
  if (body?.todos == null) return NextResponse.json({ ok: false })

  const values = body.todos.map(todoToRow)

  const spreadsheet = google.sheets({ version: 'v4', auth: oauth2 })

  if (body?.todos.length) {
    await spreadsheet.spreadsheets.values.append({
      spreadsheetId: body.fileId,
      valueInputOption: 'RAW',
      range: 'todo2',
      requestBody: { values },
    })

    const meta = await spreadsheet.spreadsheets.get({
      spreadsheetId: body.fileId,
      fields: 'sheets(properties(title,sheetId))',
    })
    const sheet = meta.data.sheets?.find((s) => s.properties?.title === 'todo2')
    await spreadsheet.spreadsheets.batchUpdate({
      spreadsheetId: body.fileId,
      requestBody: {
        requests: [
          {
            sortRange: {
              range: {
                sheetId: sheet?.properties?.sheetId,
                startRowIndex: 1,
                startColumnIndex: 0,
              },
              sortSpecs: [{ dimensionIndex: 4, sortOrder: 'DESCENDING' }],
            },
          },
        ],
      },
    })
  }

  return NextResponse.json({ ok: true })
}
