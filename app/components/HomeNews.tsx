import { Link } from '@/app/components/Link'
import { getNewsList } from '@/lib/news'
import { getLocale, getTranslations } from 'next-intl/server'
import { Icon } from './Icon'
import UICarousel, { UICarouselSlide } from './UICarousel'

export default async function HomeNews() {
  const locale = await getLocale()
  const newsList = await getNewsList({ locale })
  const t = await getTranslations('Home')

  return (
    <div className='order-2 sm:order-0 | aspect-square flex-1 min-w-[260px] shrink-0 | flex flex-col gap-[12px]'>
      <div className='emboss-sheet | w-full h-full'>
        <UICarousel
          loop
          autoplay>
          {newsList.map((item) => (
            <UICarouselSlide key={item.title}>
              <Link
                href={`/app/guides/${encodeURI(item.slug)}`}
                className='relative rounded-lg overflow-hidden | w-full h-full'>
                <img
                  className='w-full aspect-square object-cover'
                  src={item.cover}
                  alt=''
                />
                <div className='w-full | absolute bottom-0 text-white bg-black/30 | p-[12px]'>
                  <p className='text-[14px]'>{item.title}</p>
                  <p className='text-[12px] opacity-80 | mt-[4px]'>{item.summary}</p>
                  <p className='text-[12px] opacity-80 | mt-[4px] | flex items-center'>
                    <span className='underline'>{t('HomeNewsMore')}</span>
                    <Icon
                      name='chevron-right'
                      className='text-[16px]'
                    />
                  </p>
                </div>
              </Link>
            </UICarouselSlide>
          ))}
        </UICarousel>
      </div>
    </div>
  )
}
