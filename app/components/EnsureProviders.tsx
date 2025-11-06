'use client'

import { useTagsStore } from '@/app/stores/tags.store'
import { PropsWithChildren, useEffect } from 'react'
import { CookiesProvider } from 'react-cookie'
import { googleApi } from '../lib/googleApi'
import { Todo } from '../models/Todo'
import { useAuthStore } from '../stores/auth.store'
import { useSheetStore } from '../stores/sheet.store'
import { useThemeStore } from '../stores/theme.store'
import { useTodosStore } from '../stores/todos.store'

interface Props extends PropsWithChildren {
  isDarkMode: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers: any
}

export function EnsureProviders(props: Props) {
  const tagsStore = useTagsStore()
  const themeStore = useThemeStore()
  const sheetStore = useSheetStore()
  const authStore = useAuthStore((s) => s)
  const todosStore = useTodosStore()

  useEffect(() => {
    tagsStore.initTags()
    themeStore.setIsDarkMode(props.isDarkMode)
    // if (authStore.memberInfo) checkHasMemokuFile().then((fileId) => pushDirties(fileId))
  }, [])

  const checkHasMemokuFile = async (): Promise<string | undefined> => {
    if (!authStore.memberInfo?.ok) return

    const res = await googleApi.getSheetId(props.headers)
    if (res.fileId) sheetStore.setFileId(res.fileId)
    return res.fileId
  }

  const pushDirties = async (fileId?: string): Promise<void> => {
    const todos = await todosStore.getAllDirtyTodos()
    const res = await fetch('/api/sheet/google/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, todos }),
    })
    if (res.ok) {
      const ids = todos.map(({ id }) => id).filter((id): id is string => Boolean(id))
      todosStore.updateDirties(ids, false)

      const res = await fetch(`/api/sheet/google/bulk?fileId=${fileId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const result = (await res.json()) as { todos: Todo[] }
        const allTodos = await todosStore.getAllTodos()
        const allTodosIds = allTodos.map(({ id }) => id)
        const notExistTodosInLocalDB = result.todos.filter((todo) => !allTodosIds.includes(todo.id))
        todosStore.addNewTodoBulk(notExistTodosInLocalDB)
      }
    }
  }

  return <CookiesProvider>{props.children}</CookiesProvider>
}
