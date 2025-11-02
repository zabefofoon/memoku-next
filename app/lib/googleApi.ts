import { CheckFileResponse } from '../models/Sheet'

function getBaseUrl(h: Headers) {
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

export const googleApi = {
  async getAuthGoogleMe(headers: Headers) {
    const h = new Headers(headers)
    const base = getBaseUrl(h)
    const cookieHeader = h.get('cookie') ?? ''

    const response = await fetch(`${base}/api/auth/google/me`, {
      method: 'GET',
      credentials: 'include',
      headers: { cookie: cookieHeader },
    })

    return await response.json()
  },

  async getSheetId(headers: Headers): Promise<CheckFileResponse> {
    const h = new Headers(headers)
    const base = getBaseUrl(h)
    const cookieHeader = h.get('cookie') ?? ''

    const response = await fetch(`${base}/api/sheet/google/sheetId`, {
      method: 'GET',
      credentials: 'include',
      headers: { cookie: cookieHeader },
    })
    return await response.json()
  },
}
