import 'server-only'

import { MDXRemote } from 'next-mdx-remote/rsc'
import { notFound } from 'next/navigation'

import GuidesDetailContent from '@/app/components/GuidesDetailContent'
import { getNewsBySlug } from '@/lib/news'

type PageProps = {
  params: {
    locale: string
    title: string
  }
}

export const runtime = 'nodejs'

export async function generateMetadata({ params }: PageProps) {
  const { title, locale } = await params

  const entry = await getNewsBySlug(decodeURIComponent(title), locale)
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
  const { title, locale } = await params

  const entry = await getNewsBySlug(decodeURIComponent(title), locale)
  if (!entry) notFound()
  return (
    <GuidesDetailContent entry={entry}>
      <MDXRemote source={entry.content} />
    </GuidesDetailContent>
  )
}
