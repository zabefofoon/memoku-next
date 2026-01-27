'use client'

import { COOKIE_TUTORIAL } from '@/const'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { toast } from 'sonner'
import { tagsDB } from '../lib/tags.db'
import { todosDB } from '../lib/todos.db'
import { useTutorialStore } from '../stores/tutorial.store'
import { AppTutorialConfirm } from './AppTutorialConfirm'

export function AppTutorialDetector() {
  const [cookies, setCookies] = useCookies()
  const [isShowTutorialConfirm, setIsShowTutorialConfirm] = useState<boolean>(false)
  const tutorialStep = useTutorialStore((s) => s.tutorialStep)
  const setTutorialStep = useTutorialStore((s) => s.setTutorialStep)

  const dismissTutorial = () => {
    setIsShowTutorialConfirm(false)
    setCookies(COOKIE_TUTORIAL, true, { maxAge: 60 * 60 * 24 * 365 })
  }

  useEffect(() => {
    tagsDB.getAllTagsCount().then((tagCount) => {
      todosDB.getTodosCount().then((count) => {
        if (count === 0 && tagCount === 0) setIsShowTutorialConfirm(!cookies[COOKIE_TUTORIAL])
      })
    })
  }, [cookies])

  useEffect(() => {
    if (tutorialStep === 7) {
      setCookies(COOKIE_TUTORIAL, true, { maxAge: 60 * 60 * 24 * 365 })
      toast.success('튜토리얼을 완료했습니다.')
    }
  }, [tutorialStep, setCookies])

  return (
    <>
      <AppTutorialConfirm
        isShow={isShowTutorialConfirm}
        done={() => {
          setIsShowTutorialConfirm(false)
          setTutorialStep(0)
        }}
        close={dismissTutorial}
      />
    </>
  )
}
