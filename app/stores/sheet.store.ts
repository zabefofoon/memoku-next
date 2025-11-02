import { create } from 'zustand'

interface SheetStore {
  fileId: string
  setFileId: (fileId: string) => void
}

export const useSheetStore = create<SheetStore>((set) => {
  const fileId: string = ''

  const setFileId = (fileId: string): void => {
    set({ fileId })
  }

  return {
    fileId,
    setFileId,
  }
})
