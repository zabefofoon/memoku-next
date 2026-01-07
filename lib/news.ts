import matter from 'gray-matter'
import fs from 'node:fs/promises'
import path from 'node:path'

export type NewsMeta = {
  title: string
  slug: string
  date?: number
  summary?: string
  cover?: string
  locale?: string
  top?: string
}

export type NewsEntry = NewsMeta & {
  content: string
}

const newsRoot = path.join(process.cwd(), 'content', 'news')

const slugifyTitle = (title: string) => title.trim().replace(/\s+/g, '+')

const ensureTitle = (title: unknown, fallback: string) => {
  if (typeof title === 'string' && title.trim().length > 0) {
    return title.trim()
  }
  return fallback
}

const normalizeMeta = (
  data: Record<string, unknown>,
  filename: string,
  locale?: string
): NewsMeta => {
  const fileSlug = path.basename(filename, path.extname(filename))
  const title = ensureTitle(data.title, fileSlug)
  const slug =
    typeof data.slug === 'string' && data.slug.trim().length > 0
      ? data.slug.trim()
      : slugifyTitle(title)

  return {
    title,
    slug,
    date: new Date(data.date as Date).getTime(),
    summary: typeof data.summary === 'string' ? data.summary : undefined,
    cover: typeof data.cover === 'string' ? data.cover : undefined,
    locale,
    top: typeof data.top === 'string' ? data.top : undefined,
  }
}

const resolveNewsDir = async (locale?: string) => {
  if (!locale) {
    return newsRoot
  }
  const localizedDir = path.join(newsRoot, locale)
  try {
    await fs.access(localizedDir)
    return localizedDir
  } catch {
    return newsRoot
  }
}

const readNewsEntries = async (locale?: string) => {
  const dir = await resolveNewsDir(locale)
  const files = await fs.readdir(dir)
  const mdxFiles = files.filter((file) => file.endsWith('.mdx'))
  return { dir, files: mdxFiles, locale: dir === newsRoot ? undefined : locale }
}

export const getNewsList = async (options?: { locale?: string }) => {
  const { dir, files, locale } = await readNewsEntries(options?.locale)

  const list = await Promise.all(
    files.map(async (filename) => {
      const fullPath = path.join(dir, filename)
      const raw = await fs.readFile(fullPath, 'utf8')
      const { data } = matter(raw)
      return normalizeMeta(data, filename, locale)
    })
  )

  return list.sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0
    const bTime = b.date ? new Date(b.date).getTime() : 0
    return bTime - aTime
  })
}

export const getNewsBySlug = async (slug: string, locale?: string) => {
  const { dir, files, locale: resolvedLocale } = await readNewsEntries(locale)

  for (const filename of files) {
    const fullPath = path.join(dir, filename)
    const raw = await fs.readFile(fullPath, 'utf8')
    const { data, content } = matter(raw)
    const meta = normalizeMeta(data, filename, resolvedLocale)

    if (meta.slug === slug) {
      return { ...meta, content } satisfies NewsEntry
    }
  }

  return null
}
