import { create } from 'zustand'

interface TagsStore {
  screenSize: 'mobile' | 'desktop'
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
  setScreenSize: (screenSize: 'mobile' | 'desktop') => void
}

export const useThemeStore = create<TagsStore>((set) => {
  return {
    screenSize: 'mobile',
    isDarkMode: false,
    setIsDarkMode: (isDarkMode: boolean): void => {
      set({ isDarkMode })
    },
    setScreenSize: (screenSize: TagsStore['screenSize']): void => {
      set({ screenSize })
    },
  }
})
