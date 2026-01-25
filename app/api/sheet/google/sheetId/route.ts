import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const TODO2_HEADERS = [
  'id',
  'description',
  'tagId',
  'created',
  'modified',
  'images',
  'status',
  'parentId',
  'childId',
  'start',
  'end',
  'days',
  'deleted',
]

const TAGS_HEADERS = ['id', 'color', 'label', 'modified', 'removed']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function transformTodoSheet(auth: any, spreadsheetId: string) {
  const sheets = google.sheets({ version: 'v4', auth })
  const getRes = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties(sheetId,title)',
  })
  const prevTodos = getRes.data.sheets?.find((s) => s.properties?.title === 'todos')
  const currentTodos = getRes.data.sheets?.find((s) => s.properties?.title === 'todo2')

  if (!prevTodos) {
    if (!currentTodos)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `todo2!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [TODO2_HEADERS],
        },
      })
  } else {
    if (!currentTodos) {
      const dup = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              duplicateSheet: {
                sourceSheetId: prevTodos.properties?.sheetId,
                insertSheetIndex: 0,
                newSheetName: 'todo2',
              },
            },
          ],
        },
      })

      const newSheetId = dup.data.replies?.[0]?.duplicateSheet?.properties?.sheetId

      const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `todos!A1:Z`,
        majorDimension: 'ROWS',
      })
      const rows = getRes.data.values ?? []
      const header = rows[0]

      const idx = (name: string) => header.findIndex((h) => (h || '').toLowerCase() === name)

      const iId = idx('id')
      const iDesc = idx('description')
      const iTagId = idx('tagid')
      const iCreated = idx('created')
      const iModified = idx('modified')
      const iImages = idx('images')
      const iDone = idx('done')

      const values: string[][] = [TODO2_HEADERS]

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r] || []

        const id = iId >= 0 ? (row[iId] ?? '') : ''
        const description = iDesc >= 0 ? (row[iDesc] ?? '') : ''
        const tagId = iTagId >= 0 ? (row[iTagId] ?? '') : ''
        const created = iCreated >= 0 ? Number(row[iCreated] ?? '') : ''
        const modified = iModified >= 0 ? Number(row[iModified] ?? '') : ''
        const images = iImages >= 0 ? (row[iImages] ?? '') : ''

        let status = ''
        if (iDone >= 0) {
          const v = (row[iDone] ?? '').toString().trim().toLowerCase()
          if (v === 'true') status = 'done'
        }

        const parentId = ''
        const childId = ''
        const start = ''
        const end = ''
        const days = undefined

        values.push([
          id,
          description,
          tagId,
          created,
          modified,
          images,
          status,
          parentId,
          childId,
          start,
          end,
          days,
        ])
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `todo2!A1`,
        valueInputOption: 'RAW',
        requestBody: { values },
      })

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              sortRange: {
                range: {
                  sheetId: newSheetId,
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
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureTagsSheet(auth: any, spreadsheetId: string): Promise<void> {
  const sheets = google.sheets({ version: 'v4', auth })

  // 시트 메타 정보 조회
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties(sheetId,title)',
  })

  const tagsSheet = meta.data.sheets?.find((s) => s.properties?.title === 'tags')
  let tagsId = tagsSheet?.properties?.sheetId

  if (!tagsId) {
    // tags 시트가 없으면 추가
    const addRes = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: 'tags' } } }] },
    })

    tagsId = addRes.data.replies?.[0]?.addSheet?.properties?.sheetId
    sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'tags!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [TAGS_HEADERS],
      },
    })
  } else {
    sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'tags!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [TAGS_HEADERS] },
    })
  }
}

export async function GET() {
  const fileName = 'MEMOKU_DATA'

  const headerCookies = await cookies()
  const access = headerCookies.get('x-google-access-token')?.value
  const refresh = headerCookies.get('x-google-refresh-token')?.value
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID!,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    `${process.env.APP_ORIGIN}/api/auth/google/callback`
  )
  oauth2.setCredentials({ access_token: access, refresh_token: refresh })
  const res = await google.drive({ version: 'v3', auth: oauth2 }).files.list({
    q: `name='${fileName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    pageSize: 1,
    fields: 'files(id)',
    spaces: 'drive',
  })
  const fileId = res.data.files && res.data.files.length > 0 ? res.data.files[0].id : undefined
  if (fileId) {
    await Promise.all([transformTodoSheet(oauth2, fileId), ensureTagsSheet(oauth2, fileId)])

    return NextResponse.json({ ok: true, fileId })
  } else {
    const sheets = google.sheets({ version: 'v4', auth: oauth2 })
    const createRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: 'MEMOKU_DATA', locale: 'en' },
        sheets: [{ properties: { title: 'todo2' } }, { properties: { title: 'tags' } }],
      },
    })

    const spreadsheetId = createRes.data.spreadsheetId!
    await google.sheets({ version: 'v4', auth: oauth2 }).spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        data: [
          { range: 'todo2!A1', values: [TODO2_HEADERS] },
          { range: 'tags!A1', values: [TAGS_HEADERS] },
        ],
        valueInputOption: 'USER_ENTERED',
      },
    })

    return NextResponse.json({ ok: true, fileId: spreadsheetId })
  }
}
