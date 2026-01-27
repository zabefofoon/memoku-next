import { create } from 'zustand'

interface TutorialStore {
  tutorialStep?: number
  setTutorialStep: (tutorialStep?: number) => void
}

export const useTutorialStore = create<TutorialStore>((set) => ({
  tutorialStep: undefined,
  setTutorialStep(tutorialStep?: number) {
    set({ tutorialStep })
  },
}))
