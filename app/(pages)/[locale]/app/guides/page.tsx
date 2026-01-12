import { DarkModeButton } from '@/app/components/DarkModeButton'
import { Link } from '@/app/components/Link'
import { COOKIE_LANGUAGE } from '@/const'
import { getNewsList } from '@/lib/news'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/app/guides'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return {
    title: t('Guide.PageTitle'),
    description: t('Guide.PageDesc'),
  }
}

export default async function News() {
  const cookieStore = await cookies()
  const newsList = await getNewsList({ locale: cookieStore.get(COOKIE_LANGUAGE)?.value ?? 'en' })
  const t = await getTranslations()
  return (
    <div className='h-full | flex flex-col'>
      <div className='flex justify-between items-start | px-[16px] sm:px-0 mt-[16px] sm:mt-0'>
        <div>
          <h1 className='text-[20px] opacity-80'>{t('Guide.PageTitle')}</h1>
          <p className='text-[16px] opacity-50'>{t('Guide.PageDesc')}</p>
        </div>
        <div>
          <DarkModeButton />
        </div>
      </div>
      <div className='mt-[16px] px-[16px] sm:px-0 | grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-[6px] gap-y-[12px]'>
        {newsList.map((item) => {
          return (
            <figure
              key={item.slug}
              className='emboss-sheet | p-[10px] | w-full | flex flex-col'>
              <Link
                href={`/app/guides/${encodeURI(item.slug)}`}
                className='flex flex-col'>
                <img
                  className='rounded-xl | aspect-square'
                  src={item.cover}
                  alt={item.title}
                />
                <div className='mt-[12px]'>
                  <p className='truncate text-[13px] sm:text-[14px] tracking-tight'>{item.title}</p>
                  {item.summary ? (
                    <p className='line-2 mt-[6px] | text-[11px] sm:text-[12px] tracking-tight opacity-60'>
                      {item.summary}
                    </p>
                  ) : null}
                </div>
              </Link>
            </figure>
          )
        })}
      </div>
    </div>
  )
}
