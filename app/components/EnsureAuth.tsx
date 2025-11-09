'use client'

import { PropsWithChildren, useEffect, useState } from 'react'
import { useAuthStore } from '../stores/auth.store'
import { useSheetStore } from '../stores/sheet.store'
import { useTodosStore } from '../stores/todos.store'
import UISpinner from './UISpinner'

interface Props {
  accessToken: string
  refreshToken: string
}

export default function EnsureAuth(props: PropsWithChildren<Props>) {
  const authStore = useAuthStore()
  const sheetStore = useSheetStore()
  const todosStore = useTodosStore()

  const [isAuthed, setIsAuthed] = useState<boolean>(false)

  const loadGoogleMe = async (): Promise<void> => {
    const res = await fetch(`/api/auth/google/me`, {
      method: 'GET',
      credentials: 'include',
    })
    const result = await res.json()
    if (result.ok) authStore.setMemberInfo(result)
  }

  const loadSheetId = async (): Promise<void> => {
    const res = await fetch(`/api/sheet/google/sheetId`, {
      method: 'GET',
      credentials: 'include',
    })
    const result = await res.json()
    if (result.ok) sheetStore.setFileId(result.fileId)
  }

  const pushDirties = async (): Promise<void> => {
    const todos = await todosStore.getAllDirtyTodos()
    if (todos.length === 0) return

    const res = await fetch('/api/sheet/google/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId: sheetStore.fileId, todos }),
    })

    if (res.ok) {
      const ids = todos.map(({ id }) => id).filter((id): id is string => Boolean(id))
      todosStore.updateDirties(ids, false)
    }
  }

  useEffect(() => {
    if (!props.refreshToken) setIsAuthed(true)
    else
      loadGoogleMe()
        .then(() => loadSheetId().then(() => setIsAuthed(true)))
        .then(pushDirties)
  }, [])

  if (!isAuthed)
    return (
      <div className='w-full h-full | flex items-center justify-center'>
        <div className='flex flex-col items-center'>
          <UISpinner />
          <p>MEMOKU</p>
        </div>
      </div>
    )

  return (
    <div
      style={{
        display: isAuthed ? 'block' : 'hidden',
      }}>
      {props.children}
    </div>
  )
}
