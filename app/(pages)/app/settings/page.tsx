import SettingsNotification from '@/app/components/SettingsNotification'
import SettingsSync from '@/app/components/SettingsSync'
import SettingsTags from '@/app/components/SettingsTags'
import SettingsTheme from '@/app/components/SettingsTheme'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '설정',
}

export default async function Settings() {
  return (
    <div className='flex-1 | flex flex-col | px-[16px] mt-[16px] mb-[24px] sm:my-0 sm:p-0'>
      <div className='mb-[24px]'>
        <h1 className='text-[20px] opacity-80'>설정</h1>
        <p className='text-[16px] opacity-50'>앱 설정을 해보세요.</p>
      </div>
      <div className='flex flex-col gap-[4px]'>
        <SettingsTags />
        <SettingsTheme />
        <SettingsNotification />
        <SettingsSync />
      </div>
    </div>
  )
}
