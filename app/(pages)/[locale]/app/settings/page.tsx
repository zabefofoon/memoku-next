import SettingsLanguage from '@/app/components/SettingsLanguage'
import SettingsNotification from '@/app/components/SettingsNotification'
import SettingsSync from '@/app/components/SettingsSync'
import SettingsTags from '@/app/components/SettingsTags'
import SettingsTheme from '@/app/components/SettingsTheme'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/app/settings'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return {
    title: t('Menu.Settings'),
    description: t('Menu.Settings'),
  }
}

export default async function Settings() {
  const t = await getTranslations()
  return (
    <div className='flex-1 | flex flex-col | px-[16px] mt-[16px] mb-[24px] sm:my-0 sm:p-0'>
      <div className='mb-[24px]'>
        <h1 className='text-[20px] opacity-80'>{t('Settings.PageTitle')}</h1>
        <p className='text-[16px] opacity-50'>{t('Settings.PageDesc')}</p>
      </div>

      <div className='flex flex-col gap-[4px]'>
        <SettingsTags />
        <SettingsTheme />
        <SettingsNotification />
        <SettingsSync />
        <SettingsLanguage />
      </div>
    </div>
  )
}
