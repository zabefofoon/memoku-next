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

  if (body?.fileId == null || body?.todos == null) NextResponse.json({ ok: false })

  const spreadsheet = google.sheets({ version: 'v4', auth: oauth2 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todosWithIndex = body.todos.filter((t: any) => t.index != null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todosWithoutIndex = body.todos.filter((t: any) => t.index == null)

  if (todosWithIndex.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = todosWithIndex.map((todo: any) => ({
      range: `todo2!A${todo.index}`,
      values: [todoToRow(todo)],
    }))

    await spreadsheet.spreadsheets.values.batchUpdate({
      spreadsheetId: body.fileId,
      requestBody: { valueInputOption: 'RAW', data },
    })
  }

  // 3) index 없는 애들은 append
  let appendStartIndex: number | null = null

  if (todosWithoutIndex.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values = todosWithoutIndex.map((todo: any) => todoToRow(todo))

    const res = await spreadsheet.spreadsheets.values.append({
      spreadsheetId: body.fileId,
      valueInputOption: 'RAW',
      range: 'todo2',
      requestBody: { values },
    })

    const updatedRange = res.data.updates?.updatedRange
    // 예: 'todo2!A10:K12' → 10 추출
    if (updatedRange) {
      const match = updatedRange.match(/![A-Z]+(\d+):/)
      if (match?.[1]) appendStartIndex = Number(match[1])
    }
  }

  // 4) 응답용 indexes 배열 구성
  //    - index 있던 애들은 그대로
  //    - 없던 애들은 appendStartIndex 기준으로 순서대로 부여
  let appendOffset = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indexes = body.todos.map((todo: any) => {
    if (todo.index != null) return todo.index

    if (appendStartIndex == null) return null // append 실패 시 안전장치

    const rowIndex = appendStartIndex + appendOffset
    appendOffset += 1
    return rowIndex
  })

  return NextResponse.json({ ok: true, indexes })
}
