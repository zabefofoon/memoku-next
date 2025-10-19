'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from './Icon'

export default function FloatingButtons() {
  const pathname = usePathname()

  if (pathname.match(/\/todos\//gi)) return null

  return (
    <div className='sm:hidden | fixed right-[16px] bottom-[92px] z-[50]'>
      <Link
        className='w-[48px] aspect-square | flex items-center justify-center | bg-violet-500 rounded-full | text-white'
        href='/todos/new'>
        <Icon
          name='plus'
          className='text-[24px]'
        />
      </Link>
    </div>
  )
}
