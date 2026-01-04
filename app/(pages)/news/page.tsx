import { Link } from '@/app/components/Link'
import { getNewsList } from '@/lib/news'

export default async function News() {
  const newsList = await getNewsList({ locale: 'ko' })

  return (
    <div className='h-full | flex flex-col'>
      <div className='px-[16px] sm:px-0 mt-[16px] sm:mt-0 '>
        <h1 className='text-[20px] opacity-80'>News</h1>
        <p className='text-[16px] opacity-50'>Check the latest updates from Memoku.</p>
      </div>
      <div className='mt-[16px] px-[16px] sm:px-0 | grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-[12px] gap-y-[16px]'>
        {newsList.map((item) => {
          const href = `/news/${encodeURI(item.slug)}`
          const cover = item.cover

          return (
            <figure
              key={item.slug}
              className='emboss-sheet | p-[12px] | w-full | flex flex-col'>
              <Link
                href={href}
                className='flex flex-col'>
                <img
                  className='rounded-xl | aspect-square'
                  src={cover}
                  alt={item.title}
                />
                <div className='my-[12px]'>
                  <p className='truncate text-[14px] tracking-tight'>{item.title}</p>
                  {item.summary ? (
                    <p className='line-2 mt-[6px] | text-[12px] tracking-tight opacity-60'>
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
