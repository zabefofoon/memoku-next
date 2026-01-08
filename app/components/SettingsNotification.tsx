'use client'

import { AGE_1_YEAR, COOKIE_DEVICE_ID, COOKIE_PUSH_SUBSCRIBED } from '@/const'
import { useCookies } from 'react-cookie'
import { api } from '../lib/api'
import { useThemeStore } from '../stores/theme.store'
import etcUtil from '../utils/etc.util'
import UIToggle from './UIToggle'

export default function SettingsTags() {
  const [cookies, setCookie] = useCookies()
  const notificationPermission = useThemeStore((state) => state.notificationPermission)
  const isSubscribedPush = useThemeStore((state) => state.isSubscribedPush)
  const setIsSubscribedPush = useThemeStore((state) => state.setIsSubscribedPush)

  const toggleNotifications = async (value: boolean): Promise<void> => {
    if (value) {
      if (notificationPermission === 'denied') return alert('브라우저의 알림권한을 켜주세요.')
      else if (notificationPermission === 'default') {
        const state = await Notification.requestPermission()
        if (state === 'denied') return alert('브라우저의 알림권한을 켜주세요.')
      }

      const deviceId = cookies[COOKIE_DEVICE_ID] || etcUtil.generateUniqueId()

      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        const pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })

        setCookie(COOKIE_PUSH_SUBSCRIBED, true, { maxAge: AGE_1_YEAR, path: '/' })
        setIsSubscribedPush(true)

        try {
          await api.postAlarmSubscribe(pushSubscription, deviceId)
          setCookie(COOKIE_DEVICE_ID, deviceId, { maxAge: AGE_1_YEAR, path: '/' })
        } catch {
          setCookie(COOKIE_PUSH_SUBSCRIBED, false, { maxAge: AGE_1_YEAR, path: '/' })
          setIsSubscribedPush(false)
        }
      }
    } else {
      setCookie(COOKIE_PUSH_SUBSCRIBED, false, { maxAge: AGE_1_YEAR, path: '/' })
      setIsSubscribedPush(false)
      try {
        await api.deleteAlarmSubscribe(cookies[COOKIE_DEVICE_ID])
      } catch {
        setCookie(COOKIE_PUSH_SUBSCRIBED, true, { maxAge: AGE_1_YEAR, path: '/' })
        setIsSubscribedPush(true)
      }
    }
  }

  return (
    <div className='emboss-sheet | p-[16px]'>
      <div className='flex items-center sm:items-start justify-between sm:justify-start gap-[12px] lg:gap-[24px]'>
        <p className='text-[14px] font-[700] | shrink-0 | lg:py-[8px] | w-[100px]'>알림설정</p>
        <div className='flex items-center gap-[6px] flex-wrap'>
          <UIToggle
            id='알림설정'
            onIcon='notification'
            offIcon='notification'
            checked={isSubscribedPush && notificationPermission === 'granted'}
            toggle={toggleNotifications}
            trackClass='dark:!bg-zinc-950'
          />
        </div>
      </div>
    </div>
  )
}
