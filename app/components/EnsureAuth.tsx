'use client'

import { PropsWithChildren, useEffect, useState } from 'react'
import { Tag, Todo } from '../models/Todo'
import { useAuthStore } from '../stores/auth.store'
import { useSheetStore } from '../stores/sheet.store'
import { useTagsStore } from '../stores/tags.store'
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
  const tagsStore = useTagsStore()

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

    const chunkSize = 200
    for (let i = 0; i < todos.length; i += chunkSize) {
      const chunk = todos.slice(i, i + chunkSize)

      const res = await fetch('/api/sheet/google/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, todos: chunk }),
      })
      const result = await res.json()
      if (res.ok) {
        const ids = chunk.map(({ id }) => id).filter((id): id is string => Boolean(id))
        ids.forEach(
          (id, index) =>
            result.indexes?.[index] && todosStore.updateIndex(id, result.indexes[index])
        )
        todosStore.updateDirties(ids, false)
      } else break
    }
  }

  const loadRemoteMetaRows = async (
    fileId: string
  ): Promise<{ id: string; modified: number; index: number; deleted?: string }[]> => {
    const chunkSize = 1000
    let start = 2
    const allMetas: { id: string; modified: number; index: number }[] = []

    while (true) {
      const end = start + chunkSize - 1
      const res = await fetch(`/api/sheet/google/meta?fileId=${fileId}&start=${start}&end=${end}`, {
        method: 'GET',
      })
      const result = await res.json()

      if (!result.metas?.length) break

      allMetas.push(...result.metas)

      // 더 이상 데이터가 없으면 종료
      if (result.metas.length < chunkSize) break
      start += chunkSize
    }

    return allMetas
  }

  const loadLocalMetaRows = async (): Promise<{ id: string; modified?: number }[]> => {
    return await todosStore.getMetas()
  }

  const loadNewOrUpdated = async (
    fileId: string,
    meta: { id: string; index: number }[]
  ): Promise<Todo[]> => {
    if (meta.length === 0) return []

    const chunkSize = 200
    const allTodos: Todo[] = []

    for (let i = 0; i < meta.length; i += chunkSize) {
      const chunk = meta.slice(i, i + chunkSize)

      const res = await fetch(`/api/sheet/google/meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, meta: chunk }),
      })

      const result = await res.json()
      if (result.ok && result.todos?.length) {
        allTodos.push(...result.todos.map((todo: Todo) => ({ ...todo, dirty: false })))
      } else {
        console.warn(`Chunk ${i / chunkSize + 1} failed`)
        break
      }
    }

    return allTodos
  }

  const loadImageFoderId = async (): Promise<string> => {
    const res = await fetch('/api/upload/google/image')
    const result = await res.json()
    return result.folderId
  }

  const pushDirtyTags = async (fileId: string) => {
    const tags = await tagsStore.getAllDirtyTags()
    if (tags.length === 0) return

    const res = await fetch('/api/sheet/google/bulk/tags', {
      method: 'POST',
      body: JSON.stringify({ fileId, tags }),
    })
    const result = await res.json()
    if (res.ok) {
      const ids = tags.map(({ id }) => id).filter((id): id is string => Boolean(id))
      ids.forEach(
        (id, index) => result.indexes?.[index] && tagsStore.updateIndex(id, result.indexes[index])
      )
      tagsStore.updateDirties(ids, false)
    }
  }

  const loadRemoteMetaTagRows = async (
    fileId: string
  ): Promise<{ id: string; modified: number; index: number; deleted?: string }[]> => {
    const res = await fetch(`/api/sheet/google/meta/tags?fileId=${fileId}`, {
      method: 'GET',
    })
    const result = await res.json()
    return result.metas
  }

  const loadLocalMetaTagRows = async (): Promise<{ id: string; modified?: number }[]> => {
    return await tagsStore.getMetas()
  }

  const loadNewOrUpdatedTags = async (
    fileId: string,
    meta: { id: string; index: number }[]
  ): Promise<Tag[]> => {
    if (meta.length === 0) return []

    const res = await fetch(`/api/sheet/google/meta/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, meta }),
    })

    const result = await res.json()
    return result.tags?.map((todo: Todo) => ({ ...todo, dirty: false })) ?? []
  }

  useEffect(() => {
    if (!props.refreshToken) setIsAuthed(true)
    else {
      loadGoogleMe().then(() =>
        loadSheetId().then((fileId) => {
          if (fileId) {
            loadImageFoderId().then((folderId) => sheetStore.setImageFolderId(folderId) ?? '')

            pushDirtyTags(fileId).then(() => {
              loadRemoteMetaTagRows(fileId).then((remoteMeta) => {
                loadLocalMetaTagRows().then((localMeta) => {
                  const localMap = new Map(localMeta.map((l) => [l.id, l.modified]))
                  const deletedRows = remoteMeta.filter((row) => row.deleted).map(({ id }) => id)
                  tagsStore.deleteTags(deletedRows)
                  const remoteNewOrUpdated = remoteMeta
                    .filter(
                      (row) =>
                        !row.deleted &&
                        (!localMap.has(row.id) || (row.modified ?? 0) > (localMap.get(row.id) ?? 0))
                    )
                    .map(({ id, index }) => ({ id, index }))
                  loadNewOrUpdatedTags(fileId, remoteNewOrUpdated).then((tags) => {
                    tagsStore.addNewTagBulk(tags)
                    tagsStore.initTags()
                  })
                })
              })
            })

            pushDirties(fileId).then(() => {
              loadRemoteMetaRows(fileId).then((remoteMeta) => {
                loadLocalMetaRows().then((localMeta) => {
                  const localMap = new Map(localMeta.map((l) => [l.id, l.modified]))

                  const deletedRows = remoteMeta.filter((row) => row.deleted).map(({ id }) => id)
                  todosStore.deleteTodos(deletedRows)

                  const remoteNewOrUpdated = remoteMeta
                    .filter(
                      (row) =>
                        !row.deleted &&
                        (!localMap.has(row.id) || row.modified > (localMap.get(row.id) ?? 0))
                    )
                    .map(({ id, index }) => ({ id, index }))
                  loadNewOrUpdated(fileId, remoteNewOrUpdated).then((todos) => {
                    todosStore.addNewTodoBulk(todos)
                    setIsAuthed(true)
                  })
                })
              })
            })
          }
        })
      )
    }
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
