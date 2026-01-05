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
    <article className='w-full h-full | px-[16px] sm:px-0 mt-[16px] sm:mt-0 flex flex-col items-start gap-[16px]'>
      <BackButton title='News' />

      <section className='max-w-full prose prose-sm dark:prose-invert'>
        <MDXRemote source={entry.content} />
      </section>
    </article>
  )
}
