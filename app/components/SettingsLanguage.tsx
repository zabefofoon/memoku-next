import { getTranslations } from 'next-intl/server'
import LanguageDropdown from './LanguageDropdown'

export default async function SettingsLanguage() {
  const t = await getTranslations()

  return (
    <div className='emboss-sheet | p-[16px]'>
      <div className='flex items-center justify-between sm:justify-start gap-[12px] lg:gap-[24px]'>
        <p className='truncate text-[14px] font-[700] | shrink-0 | lg:py-[8px] | sm:w-[100px]'>
          {t('Settings.Language')}
        </p>
        <LanguageDropdown />
      </div>
    </div>
  )
}
