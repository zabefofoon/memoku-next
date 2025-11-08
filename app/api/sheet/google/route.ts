import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const fileId = url.searchParams.get('fileId') ?? ''
  const page = Number(url.searchParams.get('page') ?? '1')

  const tagFilter = url.searchParams.get('tags')
    ? url.searchParams.get('tags')!.split(',')
    : undefined
  const statusFilter = url.searchParams.get('status')
  const searchFilter = url.searchParams.get('search')

  const headerCookies = await cookies()
  const access = headerCookies.get('x-google-access-token')?.value
  const refresh = headerCookies.get('x-google-refresh-token')?.value

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID!,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    `${process.env.APP_ORIGIN}/api/auth/google/callback`
  )
  oauth2.setCredentials({ access_token: access, refresh_token: refresh })

  const meta = await google.sheets({ version: 'v4', auth: oauth2 }).spreadsheets.get({
    spreadsheetId: fileId,
    fields: 'sheets(properties(title,sheetId))',
  })
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === 'todo2')
  if (!sheet?.properties?.sheetId) {
    throw new Error('sheetId를 찾을 수 없습니다: "todo2"')
  }
  const sheetId = sheet.properties.sheetId
  await google.sheets({ version: 'v4', auth: oauth2 }).spreadsheets.batchUpdate({
    spreadsheetId: fileId,
    requestBody: {
      requests: [
        {
          sortRange: {
            range: {
              sheetId,
              startRowIndex: 1,
              startColumnIndex: 0,
            },
            sortSpecs: [{ dimensionIndex: 4, sortOrder: 'DESCENDING' }],
          },
        },
      ],
    },
  })

  if (!tagFilter && !statusFilter && !searchFilter) {
    // const pageSize = 20
    // const start = page * pageSize + 1 // 1행은 header라 +2
    // const end = start + pageSize - 1
    // const range = `todo2!A${start}:Z${end}`

    const res = await google.sheets({ version: 'v4', auth: oauth2 }).spreadsheets.values.batchGet({
      spreadsheetId: fileId,
      ranges: ['todo2!A2:A', 'todo2!H2:H'],
    })
    if (!res.ok) return NextResponse.json({ ok: res.ok, todos: undefined })
    const [colA, colH] = res.data.valueRanges ?? []
    const ids = colA.values ?? []
    const parentIds = colH.values ?? []

    let allTodos = ids.map((_, i) => ({
      id: ids[i]?.[0] ?? '',
      parentId: parentIds[i] ?? '',
      index: i + 2,
    }))

    const pageSize = 20
    const start = page * pageSize
    const end = start + pageSize
    allTodos = allTodos.filter((todo) => !todo.parentId)
    allTodos = allTodos.slice(start, end)

    const ranges = allTodos.map(({ index }) => `todo2!A${index}:Z${index}`)

    const filteredRes = await google
      .sheets({ version: 'v4', auth: oauth2 })
      .spreadsheets.values.batchGet({
        spreadsheetId: fileId,
        ranges,
      })

    if (res.ok) {
      const todos = filteredRes.data.valueRanges
        ?.flatMap(({ values }) => values)
        .map((row) => {
          const _row = row!
          return {
            id: _row[0],
            description: _row[1],
            tagId: _row[2],
            created: Number(_row[3]),
            modified: Number(_row[4]),
            images: _row[5]?.split(','),
            status: _row[6],
            parentId: _row[7],
            childId: _row[8],
            start: Number(_row[9]),
            end: Number(_row[10]),
            days: _row[11]?.split(','),
          }
        })
      return NextResponse.json({ ok: res.ok, todos })
    } else return NextResponse.json({ ok: res.ok, todos: undefined })
  } else {
    const res = await google.sheets({ version: 'v4', auth: oauth2 }).spreadsheets.values.batchGet({
      spreadsheetId: fileId,
      ranges: ['todo2!A2:A', 'todo2!B2:B', 'todo2!C2:C', 'todo2!G2:G'],
    })

    if (!res.ok) return NextResponse.json({ ok: res.ok, todos: undefined })

    const [colA, colB, colC, colG] = res.data.valueRanges ?? []

    const ids = colA.values ?? []
    const descriptions = colB.values ?? []
    const tagIds = (colC.values ?? []) as unknown as string[]
    const statuses = colG.values ?? []

    let allTodos = ids.map((_, i) => ({
      id: ids[i]?.[0] ?? '',
      description: descriptions[i]?.[0] ?? '',
      tagId: tagIds[i] ?? '',
      status: statuses[i]?.[0] ?? '',
      index: i + 2,
    }))

    const pageSize = 20
    const start = page * pageSize
    const end = start + pageSize

    if (searchFilter) allTodos = allTodos.filter((todo) => todo.description.includes(searchFilter))
    if (tagFilter?.length) allTodos = allTodos.filter((todo) => tagFilter?.includes(todo.tagId))
    if (statusFilter) allTodos = allTodos.filter((todo) => todo.status === statusFilter)

    allTodos = allTodos.slice(start, end)

    const ranges = allTodos.map(({ index }) => `todo2!A${index}:Z${index}`)

    const filteredRes = await google
      .sheets({ version: 'v4', auth: oauth2 })
      .spreadsheets.values.batchGet({
        spreadsheetId: fileId,
        ranges,
      })

    if (res.ok) {
      const todos = filteredRes.data.valueRanges
        ?.flatMap(({ values }) => values)
        .map((row) => {
          const _row = row!
          return {
            id: _row[0],
            description: _row[1],
            tagId: _row[2],
            created: Number(_row[3]),
            modified: Number(_row[4]),
            images: _row[5]?.split(','),
            status: _row[6],
            parentId: _row[7],
            childId: _row[8],
            start: Number(_row[9]),
            end: Number(_row[10]),
            days: _row[11]?.split(','),
          }
        })
      return NextResponse.json({ ok: res.ok, todos })
    } else return NextResponse.json({ ok: res.ok, todos: undefined })
  }
}
