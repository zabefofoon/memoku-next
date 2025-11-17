import etcUtil from '@/app/utils/etc.util'
import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Readable } from 'stream'

export async function POST(req: Request) {
  const formData = await req.formData()
  const headerCookies = await cookies()

  const images = formData.getAll('images') as Blob[]
  if (images.length === 0) return NextResponse.json({ ok: false, message: 'no images' })

  const access = headerCookies.get('x-google-access-token')?.value
  const refresh = headerCookies.get('x-google-refresh-token')?.value

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID!,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    `${process.env.APP_ORIGIN}/api/auth/google/callback`
  )
  oauth2.setCredentials({ access_token: access, refresh_token: refresh })

  const drive = google.drive({ version: 'v3', auth: oauth2 })

  const folderSearch = await drive.files.list({
    q: `name='MEMOKU_IMAGES' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  })

  let folderId: string

  if (folderSearch.data.files?.length) folderId = folderSearch.data.files[0].id!
  else {
    const created = await drive.files.create({
      requestBody: {
        name: 'MEMOKU_IMAGES',
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    })
    folderId = created.data.id!
  }

  const urls = await Promise.all(
    images.map(async (image) => {
      const upload = await drive.files.create({
        requestBody: {
          name: etcUtil.generateUniqueId(),
          parents: [folderId],
          mimeType: image.type,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        media: { mimeType: image.type, body: Readable.from(image.stream() as any) },
        fields: 'id',
      })

      await drive.permissions.create({
        fileId: upload.data.id!,
        requestBody: { role: 'reader', type: 'anyone' },
      })

      return `https://lh3.googleusercontent.com/d/${upload.data.id!}?p=w1280&authuser=0`
    })
  )

  return NextResponse.json({ ok: true, urls })
}

export async function DELETE(req: Request) {
  const url = new URL(req.url)
  const idsParam = url.searchParams.get('image_ids')

  if (!idsParam) return NextResponse.json({ ok: false, status: 400 })

  const imageIds = idsParam
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0)

  if (imageIds.length === 0) {
    return NextResponse.json({ ok: false, status: 400 })
  }

  const headerCookies = await cookies()
  const access = headerCookies.get('x-google-access-token')?.value
  const refresh = headerCookies.get('x-google-refresh-token')?.value

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID!,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    `${process.env.APP_ORIGIN}/api/auth/google/callback`
  )

  oauth2.setCredentials({
    access_token: access,
    refresh_token: refresh,
  })

  const drive = google.drive({ version: 'v3', auth: oauth2 })

  await Promise.all(imageIds.map((fileId) => drive.files.delete({ fileId })))

  return NextResponse.json({ ok: true })
}
