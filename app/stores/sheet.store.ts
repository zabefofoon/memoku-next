import { create } from 'zustand'

interface SheetStore {
  fileId: string
  imageFolderId: string
  setFileId: (fileId: string) => void
  setImageFolderId: (fileId: string) => void
}

export const useSheetStore = create<SheetStore>((set) => {
  const fileId: string = ''
  const imageFolderId: string = ''

  const setFileId = (fileId: string): void => {
    set({ fileId })
  }

  const setImageFolderId = (imageFolderId: string): void => {
    set({ imageFolderId })
  }

  return {
    fileId,
    setFileId,
    imageFolderId,
    setImageFolderId,
  }
})
