import { create } from 'zustand'

/** savedScroll 예시
{
    "/": [
        { el: undefined, value: 0 },
        { el: undefined, value: 0 },
    ],
}
*/

export interface SavedScrollTarget {
  elId?: string
  scrollTop: number
}

interface ScrollStore {
  savedScroll: Map<string, SavedScrollTarget[]>
  saveScroll: (pathname: string, targets: SavedScrollTarget[]) => void
  deleteScroll: (pathname: string) => void
}

export const useScrollStore = create<ScrollStore>((set) => {
  return {
    savedScroll: new Map<string, SavedScrollTarget[]>(),
    saveScroll(pathname: string, targets: SavedScrollTarget[]) {
      set((state) => {
        const savedScroll = new Map(state.savedScroll).set(pathname, targets)
        return { savedScroll }
      })
    },
    deleteScroll(pathname: string) {
      set((state) => {
        const savedScroll = new Map(state.savedScroll)
        savedScroll.delete(pathname)
        return { savedScroll }
      })
    },
  }
})
