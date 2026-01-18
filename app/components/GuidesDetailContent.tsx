'use client'

import { NewsEntry } from '@/lib/news'
import { PropsWithChildren, useLayoutEffect } from 'react'
import { useTranstionsStore } from '../stores/transitions.store'
import { BackButton } from './BackButton'

interface Props {
  entry: NewsEntry
}

export default function GuidesDetailContent({ entry, children }: PropsWithChildren<Props>) {
  const setIsLoaded = useTranstionsStore((s) => s.setIsLoaded)

  useLayoutEffect(() => {
    setIsLoaded(true)
  }, [setIsLoaded])

  return (
    <article className='h-[calc(100dvh-4px)] sm:h-full | rounded-xl | flex flex-col'>
      <div className='p-[16px] sm:p-0'>
        <BackButton title={entry.title} />
      </div>
      <section className='flex-1 overflow-y-scroll | px-[16px] sm:p-0 sm:mt-[24px] | flex flex-col'>
        <div className='shrink-0 w-full min-h-[300px] max-h-[400px] | flex justify-center overflow-hidden'>
          <img
            className='w-full h-full object-cover object-center rounded-lg | aspect-[16/5]'
            src={entry.top}
            alt={entry.title}
          />
        </div>
        <div className='mt-[24px] mb-[40px] | mx-auto | prose prose-sm dark:prose-invert'>
          {children}
        </div>
      </section>
    </article>
  )
}
