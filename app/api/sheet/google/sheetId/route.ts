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
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function transformTodoSheet(auth: any, spreadsheetId: string) {
  const sheets = google.sheets({ version: 'v4', auth })

  const getRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `todo!A1:Z`,
    majorDimension: 'ROWS',
  })
  const rows = getRes.data.values ?? []

  if (rows.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `todo2!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [TODO2_HEADERS],
      },
    })
  } else {
    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties',
    })
    const found = meta.data.sheets?.find((s) => s.properties?.title === 'todo2')
    if (!found?.properties?.sheetId) {
      const todo = meta.data.sheets?.find((s) => s.properties?.title === 'todo')
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              duplicateSheet: {
                sourceSheetId: todo?.properties?.sheetId,
                insertSheetIndex: 0,
                newSheetName: 'todo2',
              },
            },
          ],
        },
      })

      const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `todo!A1:Z`,
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

      const out: string[][] = [TODO2_HEADERS]

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r] || []

        const id = iId >= 0 ? `9999${r}` : ''
        const description = iDesc >= 0 ? (row[iDesc] ?? '') : ''
        const tagId = iTagId >= 0 ? (row[iTagId] ?? '') : ''
        const created = iCreated >= 0 ? (row[iCreated] ?? '') : ''
        const modified = iModified >= 0 ? (row[iModified] ?? '') : ''
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

        out.push([
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
        requestBody: { values: out },
      })
    }
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
    fields: 'files(id, name)',
    spaces: 'drive',
  })

  const fileId = res.data.files && res.data.files.length > 0 ? res.data.files[0].id : undefined
  if (fileId) {
    await transformTodoSheet(oauth2, fileId)
    return NextResponse.json({ ok: true, fileId })
  } else {
    const sheets = google.sheets({ version: 'v4', auth: oauth2 })
    const createRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: 'MEMOKU_DATA', locale: 'en' },
        sheets: [{ properties: { title: 'todo2' } }],
      },
    })

    const spreadsheetId = createRes.data.spreadsheetId!
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      valueInputOption: 'RAW',
      range: 'todo2',
      requestBody: {
        values: [TODO2_HEADERS],
      },
    })

    return NextResponse.json({ ok: true, fileId: res.data.spreadsheetId })
  }
}
