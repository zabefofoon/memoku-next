import { create } from 'zustand'

interface TransitionsStore {
  isLoaded: boolean
  setIsLoaded: (isLoaded: boolean) => void
}

export const useTranstionsStore = create<TransitionsStore>((set) => ({
  isLoaded: false,
  setIsLoaded(isLoaded: boolean) {
    set({ isLoaded })
  },
}))
