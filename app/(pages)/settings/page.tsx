import SettingsTags from '@/app/components/SettingsTags'
import SettingsTheme from '@/app/components/SettingsTheme'

export default async function Settings() {
  return (
    <div className='flex-1 | flex flex-col'>
      <div className='mb-[24px]'>
        <h1 className='text-[20px] opacity-80'>설정</h1>
        <p className='text-[16px] opacity-50'>앱 설정을 해보세요.</p>
      </div>
      <div className='flex flex-col gap-[24px]'>
        <SettingsTags />
        <SettingsTheme />
      </div>
    </div>
  )
}
