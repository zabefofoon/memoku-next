'use client'

import { AGE_1_YEAR, COOKIE_DEVICE_ID, COOKIE_PUSH_SUBSCRIBED } from '@/const'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useTransitionRouter } from '../hooks/useTransitionRouter'
import { api } from '../lib/api'
import { useThemeStore } from '../stores/theme.store'
import etcUtil from '../utils/etc.util'

export function PermissionNotificationDetector() {
  const [cookies, setCookie] = useCookies()
  const params = useSearchParams()
  const router = useTransitionRouter()

  const setNotificationPermission = useThemeStore((s) => s.setNotificationPermission)
  const setIsSubscribedPush = useThemeStore((state) => state.setIsSubscribedPush)
  const deviceId = cookies[COOKIE_DEVICE_ID] || etcUtil.generateUniqueId()

  useEffect(() => {
    navigator.serviceWorker?.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(async (state) => {
        if (state === 'granted') {
          const registrations = await navigator.serviceWorker.getRegistrations()
          for (const registration of registrations) {
            const pushSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            })

            setCookie(COOKIE_PUSH_SUBSCRIBED, true, { maxAge: AGE_1_YEAR })
            setIsSubscribedPush(true)

            try {
              await api.postAlarmSubscribe(pushSubscription, deviceId)
              setCookie(COOKIE_DEVICE_ID, deviceId, { maxAge: AGE_1_YEAR })
            } catch {
              setCookie(COOKIE_PUSH_SUBSCRIBED, false, { maxAge: AGE_1_YEAR })
              setIsSubscribedPush(false)
            }
          }
        }
      })
    }

    let status: PermissionStatus
    const permissionChangeHandler = (): void => {
      setNotificationPermission(Notification.permission)
    }

    const handleVisibilitychange = async (): Promise<void> => {
      if (document.hidden) return
      permissionChangeHandler()
    }

    permissionChangeHandler()
    navigator.permissions.query({ name: 'notifications' as PermissionName }).then((result) => {
      status = result
      status?.addEventListener('change', permissionChangeHandler)
      document.addEventListener('visibilitychange', handleVisibilitychange)
    })

    return () => {
      status?.removeEventListener('change', permissionChangeHandler)
      document.removeEventListener('visibilitychange', handleVisibilitychange)
    }
  }, [deviceId, setCookie, setIsSubscribedPush, setNotificationPermission])

  useEffect(() => {
    const value = cookies[COOKIE_PUSH_SUBSCRIBED] ?? false
    setIsSubscribedPush(value)
  }, [cookies, setIsSubscribedPush])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // waiting 상태면 skipWaiting 요청
              reg.waiting?.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
      })

      // 컨트롤러가 바뀌면(=새 SW가 적용되면) 페이지 리로드
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (confirm('새 버전이 업데이트 되었습니다. 바로 적용하시겠습니까?'))
          window.location.reload()
      })
    }
  }, [])

  useEffect(() => {
    const moveToQuery = params.get('move-to')
    if (moveToQuery) {
      router.replace('/', { scroll: false })
      etcUtil.sleep(300).then(() => router.push(moveToQuery, { scroll: false }))
    }

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE' && typeof event.data.path === 'string') {
        router.push(event.data.path, { scroll: false })
      }
    }

    navigator.serviceWorker?.addEventListener('message', handler)
    return () => navigator.serviceWorker?.removeEventListener('message', handler)
  }, [params, router])
  return null
}
