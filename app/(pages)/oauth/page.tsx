import OauthHandler from '@/app/components/OauthHandler'
import { googleApi } from '@/app/lib/googleApi'
import { cookies, headers } from 'next/headers'

export default async function Oauth() {
  const cookieStore = await cookies()
  const requestHeaders = await headers()

  const memberInfo = cookieStore.get('x-google-access-token')
    ? await googleApi.getAuthGoogleMe(requestHeaders)
    : undefined

  return (
    <div>
      <OauthHandler memberInfo={memberInfo} />
    </div>
  )
}
