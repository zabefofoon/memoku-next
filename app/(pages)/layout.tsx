import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'

import '@/app/assets/styles/globals.scss'
import EnsureAuth from '@/app/components/EnsureAuth'
import { EnsureProviders } from '@/app/components/EnsureProviders'
import { PermissionNotificationDetector } from '@/app/components/PermissionNotificationDetector'
import ScrollRestorer from '@/app/components/ScrollRestorer'
import { ViewTransitions } from '@/app/components/ViewTransitions'
import etcUtil from '@/app/utils/etc.util'
import { COOKIE_THEME } from '@/const'
import { cookies } from 'next/headers'

const notoSansKr = Noto_Sans_KR({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    template: 'Memoku | %s',
    default: 'Memoku',
  },
  description: '심플한 할 일 관리',
}

export default async function RootLayout({ children }: LayoutProps<'/app'>) {
  const cookieStore = await cookies()
  const isDarkMode = cookieStore.get(COOKIE_THEME)?.value === 'dark'
  const refreshToken = cookieStore.get('x-google-refresh-token')?.value ?? ''

  return (
    <ViewTransitions
      rootPages={['/app/', '/app/todos', '/app/calendar', '/app/guides', '/app/settings']}>
      <ScrollRestorer />
      <html
        lang='en'
        className={etcUtil.classNames(['h-full', { dark: isDarkMode }])}>
        <head>
          <meta
            name='theme-color'
            content='transparent'
          />
          <meta
            name='mobile-web-app-capable'
            content='yes'></meta>
          <meta
            name='apple-mobile-web-app-status-bar-style'
            content='black-translucent'></meta>
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1, viewport-fit=cover'></meta>
        </head>
        <body
          className={`${notoSansKr.className} antialiased | h-full | text-slate-800 dark:text-white/95 | bg-white dark:bg-zinc-900`}>
          <EnsureAuth refreshToken={refreshToken}>
            <EnsureProviders isDarkMode={isDarkMode}>
              <PermissionNotificationDetector />
              {children}
            </EnsureProviders>
          </EnsureAuth>
          <GoogleAnalytics gaId='G-R5C8GX5QQN' />
        </body>
      </html>
    </ViewTransitions>
  )
}
