import { create } from 'zustand'

interface TagsStore {
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
  initDarkMode: () => void
}

export const useThemeStore = create<TagsStore>((set) => {
  const isDarkMode = false

  const setIsDarkMode = (value: boolean): void => {
    set({ isDarkMode: value })
  }

  const initDarkMode = (): void => {}

  return {
    isDarkMode,
    setIsDarkMode,
    initDarkMode,
  }
})
