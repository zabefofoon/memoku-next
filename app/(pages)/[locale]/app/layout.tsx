import '@/app/assets/styles/globals.scss'
import { AppAside } from '@/app/components/AppAside'
import AppBottomAppBar from '@/app/components/AppBottomAppBar'
import { cookies } from 'next/headers'

export default async function RootLayout(props: LayoutProps<'/[locale]/app'>) {
  const cookieStore = await cookies()

  const isExpandAside = cookieStore.get('x-expand-aside')?.value === 'true'

  return (
    <div className='relative | h-full | bg-gray-100 dark:bg-zinc-900 | flex flex-col sm:flex-row sm:gap-[36px] | sm:p-[24px] sm:pr-[0]'>
      <AppAside isExpand={isExpandAside} />
      <main
        id='scroll-el'
        className='relative z-[1] | flex flex-col | w-full h-full overflow-y-scroll flex-1 sm:pr-[24px] pb-[4px]'>
        <div className='sm:h-full | flex flex-col | flex-1'>{props.children}</div>

        <AppBottomAppBar />
      </main>
    </div>
  )
}
