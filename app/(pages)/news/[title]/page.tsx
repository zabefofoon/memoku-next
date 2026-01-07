import 'server-only'

import { notFound } from 'next/navigation'

import { BackButton } from '@/app/components/BackButton'
import { getNewsBySlug } from '@/lib/news'
import { MDXRemote } from 'next-mdx-remote/rsc'

type PageProps = {
  params: {
    title: string
  }
}

export const runtime = 'nodejs'

export async function generateMetadata({ params }: PageProps) {
  const { title } = await params

  const entry = await getNewsBySlug(decodeURIComponent(title), 'ko')
  return !entry
    ? {}
    : {
        title: entry.title,
        description: entry.summary,
        openGraph: {
          title: entry.title,
          description: entry.summary,
          images: [
            {
              url: entry.cover,
              alt: entry.title,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: entry.title,
          description: entry.summary,
          images: [entry.cover],
        },
      }
}

export default async function NewsDetail({ params }: PageProps) {
  const { title } = await params

  const entry = await getNewsBySlug(decodeURIComponent(title), 'ko')
  if (!entry) notFound()
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
          <MDXRemote source={entry.content} />
        </div>
      </section>
    </article>
  )
}
