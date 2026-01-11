'use client'

import { PropsWithChildren, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { todosDB } from '../lib/todos.db'
import { Tag, Todo } from '../models/Todo'
import { useAuthStore } from '../stores/auth.store'
import { useSheetStore } from '../stores/sheet.store'
import { useTagsStore } from '../stores/tags.store'
import UISpinner from './UISpinner'

interface Props {
  refreshToken: string
}

export default function EnsureAuth({ refreshToken, children }: PropsWithChildren<Props>) {
  const [isAuthed, setIsAuthed] = useState<boolean>(false)

  useEffect(() => {
    const { setMemberInfo } = useAuthStore.getState()
    const { setImageFolderId, setFileId } = useSheetStore.getState()
    const {
      updateIndex,
      updateDirties,
      initTags,
      addNewTagBulk,
      deleteTags,
      getMetas,
      getAllDirtyTags,
    } = useTagsStore.getState()

    const loadGoogleMe = async (): Promise<void> => {
      const res = await api.getAuthGoogleMe()
      const result = await res.json()
      if (result.ok) setMemberInfo(result)
    }

    const loadSheetId = async (): Promise<string> => {
      const res = await api.getSheetGoogleSheetId()
      const result = await res.json()
      if (result.ok) setFileId(result.fileId)

      return result.fileId
    }

    const loadLocalMetaRows = async (): Promise<{ id: string; modified?: number }[]> => {
      return await todosDB.getMetas()
    }

    const loadLocalMetaTagRows = async (): Promise<{ id: string; modified?: number }[]> => {
      return await getMetas()
    }

    const pushDirtyTags = async (fileId: string) => {
      const tags = await getAllDirtyTags()
      if (tags.length === 0) return
      const res = await api.postSheetGoogleBulkTags(fileId, tags)
      const result = await res.json()
      if (res.ok) {
        const ids = tags.map(({ id }) => id).filter((id): id is string => Boolean(id))
        ids.forEach(
          (id, index) => result.indexes?.[index] && updateIndex(id, result.indexes[index])
        )
        updateDirties(ids, false)
      }
    }

    const pushDirties = async (fileId: string): Promise<void> => {
      const todos = await todosDB.getAllDirtyTodos()

      if (todos.length === 0) return

      const chunkSize = 200
      for (let i = 0; i < todos.length; i += chunkSize) {
        const chunk = todos.slice(i, i + chunkSize)
        const res = await api.postSheetGoogleBulk(fileId, chunk)
        const result = await res.json()
        if (res.ok) {
          const ids = chunk.map(({ id }) => id).filter((id): id is string => Boolean(id))
          ids.forEach(
            (id, index) => result.indexes?.[index] && todosDB.updateIndex(id, result.indexes[index])
          )
          todosDB.updateDirties(ids, false)
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
        const res = await api.getSheetGoogleMeta(fileId, start, end)
        const result = await res.json()

        if (!result.metas?.length) break

        allMetas.push(...result.metas)

        // 더 이상 데이터가 없으면 종료
        if (result.metas.length < chunkSize) break
        start += chunkSize
      }

      return allMetas
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
        const res = await api.postSheetGoogleMeta(fileId, chunk)
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
      const res = await api.getUploadGoogleImage()
      const result = await res.json()
      return result.folderId
    }

    const loadRemoteMetaTagRows = async (
      fileId: string
    ): Promise<{ id: string; modified: number; index: number; deleted?: string }[]> => {
      const res = await api.getSheetGoogleMetaTags(fileId)
      const result = await res.json()
      return result.metas
    }

    const loadNewOrUpdatedTags = async (
      fileId: string,
      meta: { id: string; index: number }[]
    ): Promise<Tag[]> => {
      if (meta.length === 0) return []
      const res = await api.postSheetGoogleMetaTags(fileId, meta)
      const result = await res.json()
      return result.tags?.map((tag: Tag) => ({ ...tag, dirty: false })) ?? []
    }

    if (!refreshToken) setIsAuthed(true)
    else {
      loadGoogleMe().then(() =>
        loadSheetId().then((fileId) => {
          if (fileId) {
            loadImageFoderId().then((folderId) => setImageFolderId(folderId))

            pushDirtyTags(fileId).then(() => {
              loadRemoteMetaTagRows(fileId).then((remoteMeta) => {
                loadLocalMetaTagRows().then((localMeta) => {
                  const localMap = new Map(localMeta.map((l) => [l.id, l.modified]))
                  const deletedRows = remoteMeta.filter((row) => row.deleted).map(({ id }) => id)
                  deleteTags(deletedRows)
                  const remoteNewOrUpdated = remoteMeta
                    .filter(
                      (row) =>
                        !row.deleted &&
                        (!localMap.has(row.id) || (row.modified ?? 0) > (localMap.get(row.id) ?? 0))
                    )
                    .map(({ id, index }) => ({ id, index }))
                  loadNewOrUpdatedTags(fileId, remoteNewOrUpdated).then((tags) => {
                    addNewTagBulk(tags)
                    initTags()
                  })
                })
              })
            })

            pushDirties(fileId).then(() => {
              loadRemoteMetaRows(fileId).then((remoteMeta) => {
                loadLocalMetaRows().then((localMeta) => {
                  const localMap = new Map(localMeta.map((l) => [l.id, l.modified]))

                  const deletedRows = remoteMeta.filter((row) => row.deleted).map(({ id }) => id)
                  todosDB.deleteTodos(deletedRows)

                  const remoteNewOrUpdated = remoteMeta
                    .filter(
                      (row) =>
                        !row.deleted &&
                        (!localMap.has(row.id) || row.modified > (localMap.get(row.id) ?? 0))
                    )
                    .map(({ id, index }) => ({ id, index }))
                  loadNewOrUpdated(fileId, remoteNewOrUpdated).then((todos) => {
                    todosDB.addNewTodoBulk(todos)
                    setIsAuthed(true)
                  })
                })
              })
            })
          }
        })
      )
    }
  }, [refreshToken])

  if (!isAuthed)
    return (
      <div className='w-full h-full | flex items-center justify-center'>
        <div className='flex flex-col items-center'>
          <UISpinner />
          <p>MEMOKU</p>
        </div>
      </div>
    )

  return <div className='h-full'>{children}</div>
}
