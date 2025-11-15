'use client'

import { Icon } from '@/app/components/Icon'
import { TodosDeleteModal } from '@/app/components/TodosDeleteModal'
import TodosEditor from '@/app/components/TodosEditor'
import { TodosImages } from '@/app/components/TodosImages'
import TodosImagesModal from '@/app/components/TodosImagesModal'
import { TodosTagModal } from '@/app/components/TodosTagModal'
import TodosTimeModal from '@/app/components/TodosTimeModal'
import UISpinner from '@/app/components/UISpinner'
import { Tag, Todo } from '@/app/models/Todo'
import { useImagesStore } from '@/app/stores/images.store'
import { useSheetStore } from '@/app/stores/sheet.store'
import { useTodosStore } from '@/app/stores/todos.store'
import etcUtil from '@/app/utils/etc.util'
import debounce from 'lodash.debounce'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'

export default function TodosDetail() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const todosStore = useTodosStore()
  const imagesStore = useImagesStore()
  const sheetStore = useSheetStore()

  const [todo, setTodo] = useState<Todo>()
  const [parentTodo, setParentTodo] = useState<Todo>()
  const [childTodo, setChildTodo] = useState<Todo>()
  const [textValue, setTextValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false)
  const [isShowTagModal, setIsShowTagModal] = useState(false)
  const [isShowImageModal, setIsShowImageModal] = useState(false)
  const [isShowTimeModal, setIsShowTimeModal] = useState(false)

  const [images, setImages] = useState<{ id: string; image: string; todoId: string }[]>()

  const saveText = useMemo(
    () =>
      debounce(async (text: string): Promise<void> => {
        setTextValue(text)
        if (params.id) todosStore.updateDescription(params.id as string, text)
        window.dispatchEvent(new CustomEvent('updateText', { detail: text }))

        syncText(text)
      }, 250),
    []
  )

  const syncText = debounce(async (text) => {
    const currentTodo = await todosStore.getTodo(params.id as string)
    if (currentTodo == null) return

    fetch(
      `/api/sheet/google/todo?fileId=${sheetStore.fileId}&index=${currentTodo.index}&description=${encodeURIComponent(
        text
      )}&modified=${currentTodo.modified}`,
      { method: 'PATCH' }
    ).then((res) => {
      if (res.ok) todosStore.updateDirties([currentTodo.id], false)
    })
  }, 2000)

  const loadTodo = async (): Promise<void> => {
    setIsLoading(true)

    const res = await todosStore.getTodo(params.id as string)
    setTodo(res)

    window.dispatchEvent(new CustomEvent('updateText', { detail: res.description }))

    setTextValue(res?.description ?? '')
    loadImages(res.id)

    if (res.parentId) {
      const result = await todosStore.getParentTodo(res.parentId)
      setParentTodo(result)
    }
    if (res.childId) {
      const result = await todosStore.getChildTodo(res.id)
      setChildTodo(result)
    }

    setIsLoading(false)
  }

  const loadImages = async (todoId?: string): Promise<void> => {
    if (todoId == null) return

    const res = await imagesStore.getImages(todoId)

    const imageData: { id: string; image: string; todoId: string }[] = []
    for (const key in res) {
      const data = {
        id: res[key].id,
        image: await etcUtil.blobToBase64(res[key].image),
        todoId: res[key].todoId,
      }
      imageData.push(data)
    }

    setImages(imageData)
  }

  const addChildren = async (): Promise<void> => {
    const currentTodo = await todosStore.getTodo(params.id as string)
    if (currentTodo == null) return

    await todosStore.updateDirties([currentTodo.id], true)

    const newTodo = await todosStore.addNewTodo({
      id: etcUtil.generateUniqueId(),
      description: '',
      parentId: todo?.id,
      tagId: todo?.tagId,
      status: 'created',
    })

    fetch(
      `/api/sheet/google/todo?fileId=${sheetStore.fileId}&index=${currentTodo.index}&parent=${currentTodo.parentId}&child=${newTodo.id}&modified=${Date.now()}`,
      { method: 'PATCH' }
    ).then((res) => {
      if (res.ok) todosStore.updateDirties([currentTodo.id], false)
    })

    fetch(
      `/api/sheet/google/todo?fileId=${sheetStore.fileId}&id=${newTodo.id}&created=${newTodo.created}&modified=${newTodo.modified}&parent=${currentTodo.id}`,
      { method: 'POST' }
    ).then((res) => {
      if (res.ok) {
        todosStore.updateDirties([newTodo.id], false)
        res.json().then((result) => {
          todosStore.updateIndex(newTodo.id, result.index)
        })
      }
    })

    router.replace(`/todos/${newTodo.id}`)
  }

  const deleteTodo = async (): Promise<void> => {
    if (todo == null) return

    const currentTodo = await todosStore.getTodo(params.id as string)
    if (currentTodo == null) return

    const deleteQuery = searchParams.get('deleteModal')
    if (deleteQuery) {
      fetch(
        `/api/sheet/google/todo?fileId=${sheetStore.fileId}&index=${currentTodo.index}&deleted=${true}`,
        { method: 'PATCH' }
      ).then((res) => {
        if (res.ok) todosStore.updateDirties([todo.id], false)
      })
      const now = Date.now()
      if (currentTodo.parentId) {
        const parentTodo = await todosStore.getTodo(currentTodo.parentId as string)
        if (parentTodo == null) return

        fetch(
          `/api/sheet/google/todo?fileId=${sheetStore.fileId}&index=${parentTodo.index}&parent=${parentTodo.parentId}&child=${currentTodo.childId}&modified=${now}`,
          { method: 'PATCH' }
        ).then((res) => {
          if (res.ok) todosStore.updateDirties([todo.id], false)
        })
      }

      if (currentTodo.childId) {
        const childTodo = await todosStore.getTodo(currentTodo.childId as string)
        if (childTodo == null) return

        fetch(
          `/api/sheet/google/todo?fileId=${sheetStore.fileId}&index=${childTodo.index}&parent=${currentTodo.parentId}&child=${childTodo.childId}&modified=${now}`,
          { method: 'PATCH' }
        ).then((res) => {
          if (res.ok) todosStore.updateDirties([todo.id], false)
        })
      }

      await todosStore.deleteTodo(deleteQuery)

      router.back()
      await etcUtil.sleep(250)
      router.replace('/todos')
    }
  }

  const changeTag = async (tag: Tag): Promise<void> => {
    const tagQuery = searchParams.get('todoTag')
    if (tagQuery) {
      const modified = await todosStore.updateTag(tagQuery, tag.id)
      if (todo != null)
        fetch(
          `/api/sheet/google/todo?fileId=${sheetStore.fileId}&modified=${modified}&index=${todo.index}&tag=${tag.id}`,
          { method: 'PATCH' }
        ).then((res) => {
          if (res.ok) todosStore.updateDirties([todo.id], false)
        })

      setTodo((prev) => prev && { ...prev, tagId: tag.id })
      router.back()
    }
  }

  const updateStatus = async (status: Todo['status'], todoId: string): Promise<void> => {
    const modified = await todosStore.updateStatus(todoId, status)

    if (todo != null)
      fetch(
        `/api/sheet/google/todo?fileId=${sheetStore.fileId}&index=${todo?.index}&modified=${modified}&status=${status}`,
        { method: 'PATCH' }
      ).then((res) => {
        if (res.ok) todosStore.updateDirties([todo.id], false)
      })

    if (todoId === todo?.id) setTodo((prev) => ({ ...prev!, status }))
  }

  const updateTime = async (
    todo: Todo,
    values: { start: Todo['start']; end: Todo['end']; days?: Todo['days'] }
  ): Promise<void> => {
    const modified = await todosStore.updateTimes(todo.id, values)

    fetch(
      `/api/sheet/google/todo?fileId=${sheetStore.fileId}&modified=${modified}&index=${todo?.index}&start=${values.start}&end=${values.end}&days=${values.days ? values.days.join(',') : ''}`,
      { method: 'PATCH' }
    ).then((res) => {
      if (res.ok) todosStore.updateDirties([todo.id], false)
    })

    setTodo((prev) => prev && { ...prev, ...values })
  }

  const deleteTime = async (id?: string): Promise<void> => {
    if (id == null) return
    const values = { start: undefined, end: undefined, days: undefined }
    const modified = await todosStore.updateTimes(id, values)

    if (todo != null)
      fetch(
        `/api/sheet/google/todo?fileId=${sheetStore.fileId}&modified=${modified}&index=${todo?.index}&start=''&end=''&days=''`,
        { method: 'PATCH' }
      ).then((res) => {
        if (res.ok) todosStore.updateDirties([todo.id], false)
      })

    if (id === todo?.id) setTodo((prev) => prev && { ...prev, ...values })

    router.back()
  }

  const addImage = async (file: Blob): Promise<void> => {
    const [blob, base64String] = await etcUtil.fileToWebp(file)
    const id = await imagesStore.postImage(params.id as string, blob)

    let removedId: string | undefined

    setImages((prev) => {
      const items = prev ? [...prev] : []
      if (items.length >= 5) removedId = items.pop()?.id
      items.unshift({ id, image: base64String, todoId: params.id as string })
      return items
    })

    if (removedId) await imagesStore.deleteImage(removedId)
  }

  const deleteImage = async (): Promise<void> => {
    const image = searchParams.get('image') ?? ''
    if (image) await imagesStore.deleteImage(image)
    setImages((prev) => prev?.filter((item) => item.id !== image))
    router.back()
  }

  useLayoutEffect(() => {
    setIsLoading(true)
  }, [])

  useEffect(() => {
    loadTodo()
  }, [])

  useEffect(() => {
    setIsShowDeleteModal(!!searchParams.get('deleteModal'))
    setIsShowTagModal(!!searchParams.get('todoTag'))
    setIsShowImageModal(!!searchParams.get('images'))
    setIsShowTimeModal(!!searchParams.get('time'))
  }, [searchParams])

  if (isLoading)
    return (
      <div className='flex-1 | flex items-center justify-center'>
        <UISpinner />
      </div>
    )
  else if (todo != null)
    return (
      <div className='flex-1 | flex flex-col | max-h-full'>
        <TodosTimeModal
          isShow={isShowTimeModal}
          todo={todo}
          updateTime={updateTime}
          close={router.back}
        />
        <TodosDeleteModal
          isShow={isShowDeleteModal}
          close={router.back}
          delete={deleteTodo}
        />
        <TodosTagModal
          isShow={isShowTagModal}
          close={router.back}
          select={changeTag}
        />
        <TodosImagesModal
          isShow={isShowImageModal}
          close={router.back}
        />

        {
          <div className='mb-[24px] hidden sm:block'>
            <button
              type='button'
              className='opacity-80 | flex items-center | max-w-[300px]'
              onClick={() => history.back()}>
              <Icon
                name='chevron-left'
                className='text-[24px]'
              />

              <p className='text-[20px] truncate'>
                {textValue.split(/\n/)[0] || '내용을 입력하세요.'}
              </p>
            </button>
            <p className='text-[16px] opacity-50'>모든 글은 자동으로 저장 됩니다.</p>
          </div>
        }
        {todo?.parentId && (
          <Link
            href={`/todos/${todo?.parentId}`}
            replace
            className='p-[8px] mb-[12px] | text-[13px] | bg-white dark:bg-zinc-800 shadow-md rounded-xl | flex gap-[12px]'>
            <p className='shrink-0 | flex items-center | opacity-70'>
              <Icon
                name='chevron-up'
                className='text-[20px]'
              />
              상위
            </p>
            <p className='truncate'>{parentTodo?.description?.split(/\n/)[0]}</p>
          </Link>
        )}
        {
          <div className='pb-[4px] | flex-1 overflow-hidden | flex gap-[16px] flex-col sm:flex-row'>
            <div className='flex-1 w-full h-full | flex flex-col | sm:overflow-auto | bg-white dark:bg-zinc-800 shadow-md rounded-xl'>
              <TodosEditor
                todo={todo}
                updateText={saveText}
                updateStatus={updateStatus}
                deleteTime={deleteTime}
                addImage={addImage}
              />
            </div>
            <TodosImages
              todo={todo}
              images={images}
              addImage={addImage}
              deleteImage={deleteImage}
            />
          </div>
        }

        {childTodo ? (
          <Link
            href={`/todos/${childTodo.id}`}
            replace
            className='p-[8px] mt-[12px] | text-[13px] | bg-white dark:bg-zinc-800 shadow-md rounded-xl | flex gap-[12px]'>
            <p className='shrink-0 | flex items-center | opacity-70'>
              <Icon
                name='chevron-down'
                className='text-[20px]'
              />
              하위
            </p>
            <p className='truncate'>{childTodo.description?.split(/\n/)[0]}</p>
          </Link>
        ) : (
          <button
            className='flex items-center justify-center | shadow-lg bg-indigo-500 | text-white | pl-[12px] pr-[20px] py-[12px] mt-[12px] mx-auto | w-full sm:w-fit | rounded-2xl'
            type='button'
            onClick={addChildren}>
            <Icon
              name='chevron-down'
              className='text-[20px]'
            />
            <p className='text-[15px]'>하위 일 추가하기</p>
          </button>
        )}
      </div>
    )
}
