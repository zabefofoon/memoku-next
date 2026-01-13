import { Icon } from '@/app/components/Icon'
import LanguageDropdown from '@/app/components/LanguageDropdown'
import { Link } from '@/app/components/Link'
import UICarousel, { UICarouselSlide } from '@/app/components/UICarousel'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Memoku',
  }
}

export default async function Intro() {
  const t = await getTranslations()

  const topImages = [
    { pc: '/images/landing/home.webp', mo: '/images/landing/home_mo.webp' },
    { pc: '/images/landing/todos.webp', mo: '/images/landing/todos_mo.webp' },
    { pc: '/images/landing/calendar.webp', mo: '/images/landing/calendar_mo.webp' },
    { pc: '/images/landing/settings.webp', mo: '/images/landing/settings_mo.webp' },
    { pc: '/images/landing/guides.webp', mo: '/images/landing/guides_mo.webp' },
  ]

  const features = [
    {
      icon: 'tag-active',
      title: 'Landing.FeatureTagsTitle',
      description: 'Landing.FeatureTagsDesc',
      items: 'Landing.FeatureTagsItems',
    },
    {
      icon: 'alarm',
      title: 'Landing.FeatureAlarmTitle',
      description: 'Landing.FeatureAlarmsDesc',
      items: 'Landing.FeatureAlarmItems',
    },
    {
      icon: 'link',
      title: 'Landing.FeatureLinkTitle',
      description: 'Landing.FeatureLinkDesc',
      items: 'Landing.FeatureLinkItems',
    },
    {
      icon: 'moon-active',
      title: 'Landing.FeatureDarkTitle',
      description: 'Landing.FeatureDarkDesc',
      items: 'Landing.FeatureDarkItems',
    },
  ]

  return (
    <div className='min-h-full flex flex-col'>
      <header className='sticky top-0 z-10 | bg-white | p-[16px] lg:p-[24px] mx-auto | w-full max-w-[1920px] h-[52px] | flex items-center'>
        <Link
          href='/'
          className='flex items-center gap-[6px]'>
          <Icon
            name='logo'
            className='text-[24px] my-[8px]'
          />
          <span className='text-[18px] font-[700]'>MEMOKU</span>
        </Link>
        <div className='ml-auto | flex items-center gap-[8px] lg:gap-[16px] lg:gap-[12px] | text-[14px]'>
          <LanguageDropdown />
          <Link
            href='/app/guides'
            className='text-[14px] lg:text-[15px]'>
            {t('Menu.Guide')}
          </Link>
          <Link
            className='hidden lg:block | bg-indigo-600 text-white | py-[4px] px-[16px] | rounded-full'
            href='/app'>
            {t('Landing.Start')}
          </Link>
        </div>
      </header>
      <main className='relative overflow-hidden | bg-gray-50 | flex-1 | mx-auto w-full max-w-[1920px] | py-[40px] lg:py-[80px]'>
        <img
          className='absolute top-0 right-0 translate-x-[50%] translate-y-[-50%]'
          src='/images/blob.webp'
          alt=''
        />
        <img
          className='absolute bottom-0 left-0 translate-x-[-80%] translate-y-[60%]'
          src='/images/blob.webp'
          alt=''
        />
        <img
          className='absolute bottom-0 right-0 translate-x-[80%] translate-y-[60%]'
          src='/images/blob.webp'
          alt=''
        />
        <section className='flex flex-col items-center | pointer-events-none'>
          <div className='w-[calc(100%-36px)] max-w-[320px] lg:w-[1080px] lg:max-w-full | mb-[24px]'>
            <h1 className='mb-[8px] | text-[48px] font-[700]'>MEMOKU</h1>
            <p className='text-[20px] whitespace-pre-line'>{t('Landing.TopDesc')}</p>
          </div>
          <div className='relative'>
            <UICarousel
              loop
              autoplay
              hideDots
              className='shadow-xl !absolute z-[1] lg:z-[0] bottom-[-16px] right-[-24px] lg:bottom-unset lg:right-0 lg:!relative | w-[calc(100%-36px)] max-w-[320px] lg:w-[1080px] lg:max-w-full | rounded-lg overflow-hidden | border-[4px]'>
              {topImages.map((image, index) => (
                <UICarouselSlide
                  key={index}
                  className='rounded-lg overflow-hidden'>
                  <img
                    src={image.pc}
                    alt=''
                  />
                </UICarouselSlide>
              ))}
            </UICarousel>
            <UICarousel
              loop
              autoplay
              hideDots
              className='shadow-xl | mx-auto lg:!absolute lg:bottom-[24px] lg:right-[-60px] | w-[calc(100%-36px)] max-w-[320px] lg:w-[1080px] lg:w-[200px] | rounded-lg overflow-hidden'>
              {topImages.map((image, index) => (
                <UICarouselSlide key={index}>
                  <img
                    src={image.mo}
                    alt=''
                  />
                </UICarouselSlide>
              ))}
            </UICarousel>
          </div>
        </section>
        <section className='flex flex-col items-center | my-[80px]'>
          <div className='w-[calc(100%-36px)] max-w-[320px] lg:w-[1080px] lg:max-w-full | grid grid-cols-1 lg:grid-cols-2 gap-[12px]'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='border border-gray-200 | lg:aspect-[6/2] | flex items-start gap-[12px] | rounded-lg | p-[16px]'>
                <div className='w-[40px] aspect-square rounded-full | flex items-center justify-center | bg-indigo-500 | text-white'>
                  <Icon
                    name={feature.icon}
                    className='text-[18px]'
                  />
                </div>
                <div>
                  <p className='lg:text-[18px] font-[600]'>{t(feature.title)}</p>
                  <p className='text-[14px] lg:text-[15px] | mt-[2px]'>{t(feature.description)}</p>
                  <ul className='list-inside list-disc | text-[13px] lg:text-[14px] | mt-[16px]'>
                    {(t.raw(feature.items) as string[]).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className='bg-zinc-900 | pt-[80px]'>
          <div className='w-[calc(100%-36px)] max-w-[320px] lg:max-w-full mx-auto | flex flex-col items-center justify-center text-white'>
            <Icon
              name='home-active'
              className='text-[24px] | translate-y-[-1px]'
            />
            <p className='text-[20px] lg:text-[24px] font-[700] | mt-[12px]'>
              {t('Landing.HomeTitle')}
            </p>
            <p className='text-[14px] lg:text-[18px] text-center | mt-[12px] whitespace-pre-line'>
              {t('Landing.HomeDesc')}
            </p>
            <div className='mt-[32px] p-[6px] pb-0 | w-full max-w-[300px] aspect-square | shadow-xl shadow-zinc-200 bg-black rounded-t-2xl'>
              <div className='flex items-center justify-center | w-full h-full | rounded-t-lg bg-white'>
                <Icon
                  name='logo'
                  className='text-[120px] text-zinc-900'
                />
              </div>
            </div>
          </div>
        </section>
        <section className='flex flex-col items-center justify-center | py-[120px]'>
          <p className='text-[20px] lg:text-[24px] font-[600]'>{t('Landing.CTATitle')}</p>
          <p className='text-[14px] lg:text-[18px]'>{t('Landing.CTADesc')}</p>
          <Link
            href='/app'
            className='mt-[20px] | bg-indigo-600 | text-white | py-[8px] px-[24px] | rounded-full'>
            {t('Landing.CTAButton')}
          </Link>
        </section>
      </main>
      <footer className='lg:h-[300px] | bg-zinc-950 | text-[15px] text-white/95 | px-[16px] py-[40px] lg:p-[40px]'>
        <div className='w-full max-w-[1920px] h-full | flex flex-col | mx-auto'>
          <div className=''>
            <p className='text-[18px] lg:text-[20px]'>MEMOKU</p>
            <p className='mt-[4px] | text-[13px]'>{t('Landing.PageDesc')}</p>
          </div>
          <div className='w-full | mt-[24px] flex flex-col lg:flex-row lg:gap-[48px] lg:justify-between'>
            <div>
              <p className='text-[18px] text-[20px]'>Menus</p>
              <div className='flex flex-wrap gap-[12px] mt-[4px] | text-[13px] underline'>
                <Link href='/app'>{t('Menu.Home')}</Link>
                <Link href='/app/todos'>{t('Menu.Todos')}</Link>
                <Link href='/app/calendar'>{t('Menu.Calendar')}</Link>
                <Link href='/app/guides'>{t('Menu.Guide')}</Link>
                <Link href='/app/settings'>{t('Menu.Settings')}</Link>
              </div>
            </div>
            <div className='mt-[24px] lg:mt-0'>
              <p className='text-[18px] text-[20px]'>Socials</p>
              <div className='flex gap-[12px] mt-[4px] | text-[13px] underline'>
                <Link
                  href='https://x.com/zabefofoon'
                  target='_blank'>
                  <Icon
                    className='text-[20px]'
                    name='x'
                  />
                </Link>
                <Link
                  href='https://www.threads.com/@sangwwooo'
                  target='_blank'>
                  <Icon
                    className='text-[20px]'
                    name='thread'
                  />
                </Link>
              </div>
            </div>
          </div>
          <p className='mt-auto | text-[14px] text-center'> © 2025 poorkimchiking</p>
        </div>
      </footer>
    </div>
  )
}
