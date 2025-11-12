'use client'

import { PropsWithChildren, useEffect, useState } from 'react'
import { Todo } from '../models/Todo'
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

  const loadSheetId = async (): Promise<string> => {
    const res = await fetch(`/api/sheet/google/sheetId`, {
      method: 'GET',
      credentials: 'include',
    })
    const result = await res.json()
    if (result.ok) sheetStore.setFileId(result.fileId)

    return result.fileId
  }

  const pushDirties = async (fileId: string): Promise<void> => {
    const todos = await todosStore.getAllDirtyTodos()
    if (todos.length === 0) return

    const res = await fetch('/api/sheet/google/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, todos }),
    })

    if (res.ok) {
      const ids = todos.map(({ id }) => id).filter((id): id is string => Boolean(id))
      todosStore.updateDirties(ids, false)
    }
  }

  const loadRemoteMetaRows = async (
    fileId: string
  ): Promise<{ id: string; modified: number; index: number }[]> => {
    const res = await fetch(`/api/sheet/google/meta?fileId=${fileId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await res.json()
    return result.metas
  }

  const loadLocalMetaRows = async (): Promise<{ id: string; modified?: number }[]> => {
    return await todosStore.getMetas()
  }

  const loadNewOrUpdated = async (
    fileId: string,
    meta: { id: string; index: number }[]
  ): Promise<Todo[]> => {
    if (meta.length === 0) return []
    const res = await fetch(`/api/sheet/google/meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, meta }),
    })
    const result = await res.json()
    return result.todos
  }

  useEffect(() => {
    if (!props.refreshToken) setIsAuthed(true)
    else
      loadGoogleMe().then(() =>
        loadSheetId().then((fileId) => {
          setIsAuthed(true)
          if (fileId)
            pushDirties(fileId).then(() =>
              loadRemoteMetaRows(fileId).then((remoteMeta) => {
                loadLocalMetaRows().then((localMeta) => {
                  const localMap = new Map(localMeta.map((l) => [l.id, l.modified]))
                  const remoteNewOrUpdated = remoteMeta
                    .filter((r) => !localMap.has(r.id) || r.modified > (localMap.get(r.id) ?? 0))
                    .map(({ id, index }) => ({ id, index }))
                  loadNewOrUpdated(fileId, remoteNewOrUpdated).then((todos) => {
                    todosStore.addNewTodoBulk(todos)
                  })
                })
              })
            )
        })
      )
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
      className='h-full'
      style={{
        display: isAuthed ? 'block' : 'hidden',
      }}>
      {props.children}
    </div>
  )
}
