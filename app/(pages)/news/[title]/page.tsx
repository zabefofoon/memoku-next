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
    <article className='w-full h-[calc(100dvh-4px)] overflow-hidden | flex flex-col'>
      <div className='p-[16px] sm:p-0'>
        <BackButton title={entry.title} />
      </div>
      <div className='px-[16px] pb-[32px] sm:p-0 sm:mt-[24px] | h-full flex-1 overflow-hidden'>
        <div className='emboss-sheet | p-[16px] pr-[8px] | w-full h-full'>
          <section className='pr-[8px] pb-[40px] | h-full max-w-full overflow-y-scroll | prose prose-sm dark:prose-invert'>
            <MDXRemote source={entry.content} />
          </section>
        </div>
      </div>
    </article>
  )
}
