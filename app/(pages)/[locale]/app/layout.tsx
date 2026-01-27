'use client'

import '@/app/assets/styles/globals.scss'
import { AppAside } from '@/app/components/AppAside'
import AppBottomAppBar from '@/app/components/AppBottomAppBar'
import { AppTutorialDetector } from '@/app/components/AppTutorialDetector'
import { useTutorialStore } from '@/app/stores/tutorial.store'
import etcUtil from '@/app/utils/etc.util'
import { COOKIE_EXPAND } from '@/const'
import { useCookies } from 'react-cookie'

export default function RootLayout(props: LayoutProps<'/[locale]/app'>) {
  const [cookies] = useCookies()

  const tutorialStep = useTutorialStore((s) => s.tutorialStep)

  return (
    <div className='relative | h-full | text-slate-800 dark:text-white/95 | bg-gray-100 dark:bg-zinc-900 | flex flex-col sm:flex-row sm:gap-[36px] | sm:p-[24px] sm:pr-[0]'>
      <AppAside isExpand={cookies[COOKIE_EXPAND] === true} />
      <AppTutorialDetector />
      <main
        id='scroll-el'
        className={etcUtil.classNames([
          tutorialStep !== undefined
            ? 'z-[10] overflow-hidden sm:overflow-visible'
            : 'z-[1] overflow-y-scroll',
          'relative  | flex flex-col | w-full h-full flex-1 sm:pr-[24px] pb-[4px]',
        ])}>
        <div className='sm:h-full | flex flex-col | flex-1'>{props.children}</div>

        <AppBottomAppBar />
      </main>
    </div>
  )
}
