import dayjs from 'dayjs'
import { produce } from 'immer'
import type { DebouncedFunc } from 'lodash'
import debounce from 'lodash.debounce'
import { create } from 'zustand'
import { api } from '../lib/api'
import { todosDB } from '../lib/todos.db'
import { ImageRow, Tag, Todo } from '../models/Todo'
import etcUtil from '../utils/etc.util'
import { useImagesStore } from './images.store'
import { useSheetStore } from './sheet.store'
import { useThemeStore } from './theme.store'
import { useTodosPageStore } from './todosPage.store'

interface TodosDetailStore {
  isLoading: boolean
  todo?: Todo
  parentTodo?: Todo
  childTodo?: Todo
  text: string
  images?: ImageRow[]
  setIsLoading: (isLoading: boolean) => void
  setTodo: (todo?: Todo) => void
  setParentTodo: (todo?: Todo) => void
  setChildTodo: (todo?: Todo) => void
  syncText: DebouncedFunc<(text: string, modified: number) => Promise<void>>
  saveText: DebouncedFunc<(text: string) => void>
  setImages: (updater: ImageRow[] | ((prev?: ImageRow[]) => ImageRow[] | undefined)) => void
  changeTag: (tag: Tag, cb?: () => void) => void
  updateStatus: (status: Todo['status'], cb?: () => void) => Promise<void>
  updateTime: (
    values: {
      start: Todo['start']
      end: Todo['end']
      days?: Todo['days']
    },
    device_id?: string
  ) => Promise<void>

  addChildren: (cb?: (newTodoId: string) => void) => Promise<void>
  loadImages: (todo: Todo) => Promise<void>
  deleteImageAll: () => Promise<void>
  deleteImage(image: string, cb?: () => void): Promise<void>
  addImages(files: Blob[]): Promise<void>
  deleteTodo(cb?: () => void): Promise<void>
  loadTodo(id: string): Promise<Todo>
}

export const useTodosDetailStore = create<TodosDetailStore>((set, get) => ({
  todo: undefined,
  parentTodo: undefined,
  childTodo: undefined,
  isLoading: false,
  text: '',
  images: undefined,

  setIsLoading(isLoading): void {
    set({ isLoading })
  },
  setTodo(todo) {
    set({ todo })
  },
  setParentTodo(parentTodo?: Todo) {
    set({ parentTodo })
  },
  setChildTodo(childTodo?: Todo) {
    set({ childTodo })
  },
  setImages: (updater: ImageRow[] | ((prev?: ImageRow[]) => ImageRow[] | undefined)) =>
    set((state) => ({
      images: typeof updater === 'function' ? updater(state.images) : updater,
    })),

  changeTag: async (tag: Tag, cb?: () => void) => {
    const { todo } = get()
    const { setTodos, setTodayTodos, setThisWeekTodos, setNextWeekTodos, setChildren } =
      useTodosPageStore.getState()

    if (todo == null) return

    const { fileId } = useSheetStore.getState()
    const modified = await todosDB.updateTag(todo.id, tag.id)

    if (fileId)
      api
        .patchSheetGoogleTodo(fileId, {
          index: todo.index,
          tag: tag.id,
          modified,
        })
        .then((res) => {
          if (res.ok) todosDB.updateDirties([todo.id], false)
        })

    set(
      produce<TodosDetailStore>(({ todo }) => {
        if (todo) todo.tagId = tag.id
      })
    )

    setTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.tagId = tag.id
      })
    )

    setTodayTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.tagId = tag.id
      })
    )

    setThisWeekTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.tagId = tag.id
      })
    )

    setNextWeekTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.tagId = tag.id
      })
    )

    setChildren((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.tagId = tag.id
      })
    )

    cb?.()
  },
  updateStatus: async (status: Todo['status'], cb?: () => void) => {
    const { todo } = get()
    const { setTodos, setTodayTodos, setThisWeekTodos, setNextWeekTodos, setChildren } =
      useTodosPageStore.getState()

    if (todo == null) return

    const { fileId } = useSheetStore.getState()

    const modified = await todosDB.updateStatus(todo.id, status)
    if (fileId)
      api.patchSheetGoogleTodo(fileId, { index: todo.index, status, modified }).then((res) => {
        if (res.ok) todosDB.updateDirties([todo.id], false)
      })

    set(
      produce<TodosDetailStore>(({ todo }) => {
        if (todo) todo.status = status
      })
    )

    setTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.status = status
      })
    )

    setTodayTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.status = status
      })
    )

    setThisWeekTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.status = status
      })
    )

    setNextWeekTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.status = status
      })
    )

    setChildren((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.status = status
      })
    )

    cb?.()
  },
  updateTime: async (values, device_id?: string) => {
    const { todo } = get()
    const { setTodos, setTodayTodos, setThisWeekTodos, setNextWeekTodos, setChildren } =
      useTodosPageStore.getState()
    const { isSubscribedPush } = useThemeStore.getState()

    if (todo == null) return

    const { fileId } = useSheetStore.getState()

    const modified = await todosDB.updateTimes(todo.id, values)

    if (fileId)
      api
        .patchSheetGoogleTodo(fileId, {
          index: todo.index,
          start: values.start,
          end: values.end,
          days: values.days ? values.days.join(',') : '',
          modified,
        })
        .then((res) => {
          if (res.ok) todosDB.updateDirties([todo.id], false)
        })

    set(
      produce<TodosDetailStore>(({ todo }) => {
        if (todo) Object.assign(todo, values)
      })
    )

    setTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) Object.assign(found, values)
      })
    )

    setTodayTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) Object.assign(found, values)
      })
    )

    setThisWeekTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) Object.assign(found, values)
      })
    )

    setNextWeekTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) Object.assign(found, values)
      })
    )

    setChildren((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) Object.assign(found, values)
      })
    )

    if (isSubscribedPush && device_id)
      api.registAlarm({
        device_id,
        todo_id: todo.id,
        text: todo.description?.slice(0, 40)?.split(/\n/)[0],
        start: values.start,
        end: values.days?.length ? dayjs(values.end).add(100, 'year').valueOf() : values.end,
        days: values.days,
      })
  },

  syncText: debounce(async (text: string, modified: number) => {
    const { todo } = get()
    if (!todo) return

    const { fileId } = useSheetStore.getState()

    if (fileId)
      api
        .patchSheetGoogleTodo(fileId, {
          index: todo.index,
          description: encodeURIComponent(text),
          modified,
        })
        .then((res) => {
          if (res.ok) todosDB.updateDirties([todo.id], false)
        })
  }, 2000),

  saveText: debounce(async (text) => {
    const { todo, syncText } = get()
    const { setTodos, setTodayTodos, setThisWeekTodos, setNextWeekTodos, setChildren } =
      useTodosPageStore.getState()

    if (!todo) return

    set({ text })
    const modified = await todosDB.updateDescription(todo.id, text) // modified 반환
    set(
      produce<TodosDetailStore>((s) => {
        if (s.todo) s.todo.modified = modified
      })
    )

    setTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.description = text
      })
    )

    setTodayTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.description = text
      })
    )

    setThisWeekTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.description = text
      })
    )

    setNextWeekTodos((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.description = text
      })
    )

    setChildren((prev) =>
      produce(prev, (todos) => {
        const found = todos?.find(({ id }) => id === todo.id)
        if (found) found.description = text
      })
    )

    syncText(text, modified)
  }, 250),

  addChildren: async (cb?: (newTodoId: string) => void): Promise<void> => {
    const { todo } = get()
    const { setTodos, setTodayTodos, setThisWeekTodos, setNextWeekTodos, setChildren } =
      useTodosPageStore.getState()

    if (!todo) return
    const { fileId } = useSheetStore.getState()

    await todosDB.updateDirties([todo.id], true)

    const newTodo = await todosDB.addNewTodo({
      id: etcUtil.generateUniqueId(),
      description: '',
      parentId: todo?.id,
      tagId: todo?.tagId,
      status: 'created',
    })

    if (fileId) {
      api
        .patchSheetGoogleTodo(fileId, {
          index: todo.index,
          parent: todo.parentId,
          child: newTodo.id,
          modified: Date.now(),
        })
        .then((res) => {
          if (res.ok) todosDB.updateDirties([todo.id], false)
        })
      api
        .postSheetGoogleTodo(fileId, {
          id: newTodo.id,
          created: newTodo.created,
          modified: newTodo.modified,
          parent: todo.id,
        })
        .then((res) => {
          if (res.ok) {
            todosDB.updateDirties([newTodo.id], false)
            res.json().then((result) => todosDB.updateIndex(newTodo.id, result.index))
          }
        })
    }

    setTodos(undefined)
    setTodayTodos(undefined)
    setThisWeekTodos(undefined)
    setNextWeekTodos(undefined)
    setChildren(undefined)

    cb?.(newTodo.id)
  },
  async loadImages(todo: Todo): Promise<void> {
    const { fileId } = useSheetStore.getState()
    const { getImages, deleteImages } = useImagesStore.getState()
    const { setImages } = get()

    if (todo.images?.length) {
      setImages(
        todo.images?.map((image) => ({
          id: 'images',
          image: image.toString(),
          todoId: todo.id,
        })) ?? []
      )
    } else {
      const res = await getImages(todo.id)

      const imageData: ImageRow[] = []
      for (const key in res) {
        const data = {
          id: res[key].id,
          image: await etcUtil.blobToBase64(res[key].image as Blob),
          todoId: res[key].todoId,
        }
        imageData.push(data)
      }

      setImages(imageData)

      if (fileId) {
        const localSavedImages = imageData.filter(
          ({ image }) => typeof image === 'string' && image.startsWith('data:')
        )
        if (localSavedImages.length > 0) {
          // id 기준으로 res에서 blob 찾아서 formData 구성
          const formData = new FormData()
          const uploadBlobs: Blob[] = []

          localSavedImages.forEach(({ id }) => {
            const item = Object.values(res).find((img) => img.id === id)
            if (item?.image instanceof Blob) uploadBlobs.push(item.image)
          })

          if (uploadBlobs.length > 0) {
            uploadBlobs.forEach((blob) => formData.append('images', blob))

            // 구글 드라이브로 업로드
            const uploadRes = await api.postUploadGoogleImage(formData)
            const uploadResult = await uploadRes.json()
            const uploadedUrls: string[] = uploadResult.urls ?? []

            const alreadyRemoteUrls = imageData
              .filter(({ image }) => !(image instanceof Blob) && !image.startsWith('data:'))
              .map(({ image }) => image)

            const nextImages = [...uploadedUrls, ...alreadyRemoteUrls]

            // todosStore에 images 배열을 URL로 업데이트
            const modified = await todosDB.updateImages(todo.id, nextImages)

            api
              .patchSheetGoogleTodo(fileId, {
                index: todo.index,
                images: encodeURIComponent(nextImages.join(',')),
                modified,
              })
              .then((res) => {
                if (res.ok) todosDB.updateDirties([todo.id], false)
              })

            await deleteImages(localSavedImages.map(({ id }) => id))

            setImages(nextImages.map((url) => ({ id: 'uploaded', image: url, todoId: todo.id })))
          }
        }
      }
    }
  },
  async deleteImage(image: string, cb?: () => void): Promise<void> {
    const { images, todo, setImages } = get()
    const { fileId } = useSheetStore.getState()
    const { deleteImages } = useImagesStore.getState()

    if (images == null) return
    if (todo == null) return

    const index = +image

    if (fileId) {
      const remaineds = images.filter((_, i) => i !== index)
      const deleteImages = images.filter((_, i) => i === index).map(({ image }) => image)
      const ids = deleteImages.map((url) => new URL(url.toString()).pathname.split('/').at(-1))
      const now = await todosDB.updateImages(
        todo.id,
        remaineds.map(({ image }) => image)
      )
      api.deleteUploadGoogleImage(encodeURIComponent(ids.join(',')))
      const deleteQueris = remaineds.map(({ image }) => image).join(',') || 'undefined'
      api
        .patchSheetGoogleTodo(fileId, {
          index: todo.index,
          images: encodeURIComponent(deleteQueris),
          modified: now,
        })
        .then((res) => {
          if (res.ok) todosDB.updateDirties([todo.id], false)
          setImages((prev) => prev?.filter((_, i) => i !== index))
        })
    } else {
      if (images[index].id === 'images')
        await todosDB.updateImages(
          todo.id,
          todo.images?.filter((image) => image !== images[index].image) ?? []
        )
      else await deleteImages([images[index].id])
      setImages((prev) => prev?.filter((_, i) => i !== index))
    }
    cb?.()
  },
  async deleteImageAll(): Promise<void> {
    const { images, todo } = get()
    const { deleteImages } = useImagesStore.getState()
    const { fileId } = useSheetStore.getState()

    if (images == null) return
    if (todo == null) return

    if (!fileId) deleteImages(images.map(({ id }) => id))
    else {
      const deleteImages = images.map(({ image }) => image)
      const ids = deleteImages.map((url) => new URL(url.toString()).pathname.split('/').at(-1))
      api.deleteUploadGoogleImage(encodeURIComponent(ids.join(',')))
    }
  },
  async addImages(files: Blob[]): Promise<void> {
    const { postImages } = useImagesStore.getState()
    const { fileId, imageFolderId } = useSheetStore.getState()
    const { images, todo, setImages } = get()
    if (todo == null) return

    if (images && files.length + images.length > 5) {
      alert('이미지는 5개까지만 등록 가능합니다.')
      return
    }

    todosDB.updateDirties([todo.id], true)
    const transformed = files.map((file) => etcUtil.fileToWebp(file))
    const res = await Promise.all(transformed)
    const blobs = res.map(([blob]) => blob)
    const base64s = res.map(([_, base64]) => base64)

    if (fileId) {
      setImages([
        ...base64s.map((item) => ({ id: 'uploading', image: item, todoId: todo.id ?? '' })),
        ...(images ?? []),
      ])

      const formData = new FormData()
      blobs.forEach((file) => formData.append('images', file))
      formData.append('folderId', imageFolderId)
      const res = await api.postUploadGoogleImage(formData)
      const result = await res.json()
      const newImages = [...result.urls, ...(images?.map(({ image }) => image) ?? [])]
      const now = await todosDB.updateImages(todo.id, newImages)

      api
        .patchSheetGoogleTodo(fileId, {
          index: todo.index,
          images: encodeURIComponent(newImages.join(',')),
          modified: now,
        })
        .then((res) => {
          if (res.ok) todosDB.updateDirties([todo.id], false)
          setImages(
            (prev) =>
              prev?.map((item, index) => {
                return item.id === 'uploading'
                  ? { ...item, id: 'uploaded', image: result.urls[index] }
                  : item
              }) ?? []
          )
        })
    } else {
      const ress = await postImages(todo.id, blobs)
      setImages((prev) => [
        ...ress.map((item, index) => ({ ...item, image: base64s[index] })),
        ...(prev ?? []),
      ])
    }
  },
  async deleteTodo(cb?: () => void): Promise<void> {
    const { fileId } = useSheetStore.getState()
    const { setTodos, setTodayTodos, setThisWeekTodos, setNextWeekTodos, setChildren } =
      useTodosPageStore.getState()

    const { todo, deleteImageAll } = get()
    if (todo == null) return

    if (fileId) {
      api
        .patchSheetGoogleTodo(fileId, {
          index: todo.index,
          deleted: true,
        })
        .then((res) => {
          if (res.ok) todosDB.updateDirties([todo.id], false)
        })
      const now = Date.now()
      if (todo.parentId) {
        const parentTodo = await todosDB.getTodo(todo.parentId as string)
        if (parentTodo == null) return
        api
          .patchSheetGoogleTodo(fileId, {
            index: parentTodo.index,
            parent: parentTodo.parentId,
            child: todo.childId,
            modified: now,
          })
          .then((res) => {
            if (res.ok) todosDB.updateDirties([todo.id], false)
          })
      }
    }

    if (todo.childId) {
      const childTodo = await todosDB.getTodo(todo.childId as string)
      if (childTodo == null) return

      if (fileId) {
        const now = Date.now()
        api
          .patchSheetGoogleTodo(fileId, {
            index: childTodo.index,
            parent: todo.parentId,
            child: childTodo.childId,
            modified: now,
          })
          .then((res) => {
            if (res.ok) todosDB.updateDirties([todo.id], false)
          })
      }
    }

    deleteImageAll()
    await todosDB.deleteTodo(todo.id)

    setTodos(undefined)
    setTodayTodos(undefined)
    setThisWeekTodos(undefined)
    setNextWeekTodos(undefined)
    setChildren(undefined)

    cb?.()
  },
  async loadTodo(id: string): Promise<Todo> {
    const { setIsLoading, setTodo, setParentTodo, setChildTodo } = get()
    setIsLoading(true)
    const res = await todosDB.getTodo(id as string)
    setTodo(res)
    set({ text: res?.description ?? '' })

    if (res.parentId) {
      const result = await todosDB.getParentTodo(res.parentId)
      setParentTodo(result)
    }
    if (res.childId) {
      const result = await todosDB.getChildTodo(res.id)
      setChildTodo(result)
    }

    setIsLoading(false)

    return res
  },
}))
