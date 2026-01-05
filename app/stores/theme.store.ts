import { create } from 'zustand'

interface TagsStore {
  screenSize: 'mobile' | 'desktop'
  isDarkMode: boolean
  notificationPermission?: NotificationPermission
  isSubscribedPush: boolean
  savedTodosQueries: string | undefined

  saveTodosQuries: (savedTodosQueries?: string) => void
  setIsDarkMode: (value: boolean) => void
  setScreenSize: (screenSize: 'mobile' | 'desktop') => void
  setNotificationPermission: (notificationPermission: NotificationPermission) => void
  setIsSubscribedPush: (isSubscribedPush: boolean) => void
}

export const useThemeStore = create<TagsStore>((set) => {
  return {
    screenSize: 'mobile',
    isDarkMode: false,
    permission: undefined,
    isSubscribedPush: false,
    savedTodosQueries: undefined,
    saveTodosQuries: (savedTodosQueries?: string): void => {
      set({ savedTodosQueries })
    },
    setIsDarkMode: (isDarkMode: boolean): void => {
      set({ isDarkMode })
    },
    setScreenSize: (screenSize: TagsStore['screenSize']): void => {
      set({ screenSize })
    },
    setNotificationPermission: (notificationPermission: NotificationPermission): void => {
      set({ notificationPermission })
    },
    setIsSubscribedPush: (isSubscribedPush: boolean): void => {
      set({ isSubscribedPush })
    },
  }
})
