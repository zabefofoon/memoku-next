'use client'

import { Icon } from '@/app/components/Icon'
import { TodosDeleteModal } from '@/app/components/TodosDeleteModal'
import TodosEditor from '@/app/components/TodosEditor'
import { TodosImages } from '@/app/components/TodosImages'
import TodosImagesModal from '@/app/components/TodosImagesModal'
import { TodosStatusModal } from '@/app/components/TodosStatusModal'
import { TodosTagModal } from '@/app/components/TodosTagModal'
import TodosTimeModal from '@/app/components/TodosTimeModal'
import UISpinner from '@/app/components/UISpinner'
import { api } from '@/app/lib/api'
import { todosDB } from '@/app/lib/todos.db'
import { Tag, Todo } from '@/app/models/Todo'
import { useImagesStore } from '@/app/stores/images.store'
import { useSheetStore } from '@/app/stores/sheet.store'
import etcUtil from '@/app/utils/etc.util'
import debounce from 'lodash.debounce'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

export default function TodosDetail() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const getImages = useImagesStore((state) => state.getImages)
  const deleteImages = useImagesStore((state) => state.deleteImages)
  const postImages = useImagesStore((state) => state.postImages)
  const fileId = useSheetStore((state) => state.fileId)
  const imageFolderId = useSheetStore((state) => state.imageFolderId)

  const [todo, setTodo] = useState<Todo>()
  const [parentTodo, setParentTodo] = useState<Todo>()
  const [childTodo, setChildTodo] = useState<Todo>()
  const [textValue, setTextValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false)
  const [isShowStatusModal, setIsShowStatusModal] = useState(false)
  const [isShowTagModal, setIsShowTagModal] = useState(false)
  const [isShowImageModal, setIsShowImageModal] = useState(false)
  const [isShowTimeModal, setIsShowTimeModal] = useState(false)

  const [images, setImages] = useState<{ id: string; image: string; todoId: string }[]>()

  const syncText = debounce(async (text) => {
    const currentTodo = await todosDB.getTodo(params.id as string)
    if (currentTodo == null) return

    if (fileId) {
      api
        .patchSheetGoogleTodo(fileId, {
          index: currentTodo.index,
          description: encodeURIComponent(text),
          modified: currentTodo.modified,
        })
        .then((res) => {
          if (res.ok) todosDB.updateDirties([currentTodo.id], false)
        })
    }
  }, 2000)

  const saveText = useMemo(
    () =>
      debounce(async (text: string): Promise<void> => {
        setTextValue(text)
        if (params.id) todosDB.updateDescription(params.id as string, text)
        window.dispatchEvent(new CustomEvent('updateText', { detail: text }))

        syncText(text)
      }, 250),
    [params.id, syncText]
  )

  const loadTodo = useCallback(async (): Promise<Todo> => {
    setIsLoading(true)
    const res = await todosDB.getTodo(params.id as string)
    setTodo(res)

    window.dispatchEvent(new CustomEvent('updateText', { detail: res.description }))

    setTextValue(res?.description ?? '')

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
  }, [params.id])

  const loadImages = useCallback(
    async (todo: Todo): Promise<void> => {
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

        const imageData: { id: string; image: string; todoId: string }[] = []
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
          const localSavedImages = imageData.filter(({ image }) => image.startsWith('data:'))
          if (localSavedImages.length > 0) {
            const currentTodo = await todosDB.getTodo(params.id as string)
            if (currentTodo == null) return

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
                .filter(({ image }) => !image.startsWith('data:'))
                .map(({ image }) => image)

              const nextImages = [...uploadedUrls, ...alreadyRemoteUrls]

              // todosStore에 images 배열을 URL로 업데이트
              const modified = await todosDB.updateImages(currentTodo.id, nextImages)

              api
                .patchSheetGoogleTodo(fileId, {
                  index: currentTodo.index,
                  images: encodeURIComponent(nextImages.join(',')),
                  modified,
                })
                .then((res) => {
                  if (res.ok) todosDB.updateDirties([currentTodo.id], false)
                })

              await deleteImages(localSavedImages.map(({ id }) => id))

              setImages(
                nextImages.map((url) => ({
                  id: 'uploaded',
                  image: url,
                  todoId: currentTodo.id,
                }))
              )
            }
          }
        }
      }
    },
    [deleteImages, fileId, getImages, params.id]
  )

  const addChildren = async (): Promise<void> => {
    const currentTodo = await todosDB.getTodo(params.id as string)
    if (currentTodo == null) return

    await todosDB.updateDirties([currentTodo.id], true)

    const newTodo = await todosDB.addNewTodo({
      id: etcUtil.generateUniqueId(),
      description: '',
      parentId: todo?.id,
      tagId: todo?.tagId,
      status: 'created',
    })

    api
      .patchSheetGoogleTodo(fileId, {
        index: currentTodo.index,
        parent: currentTodo.parentId,
        child: newTodo.id,
        modified: Date.now(),
      })
      .then((res) => {
        if (res.ok) todosDB.updateDirties([currentTodo.id], false)
      })
    api
      .postSheetGoogleTodo(fileId, {
        id: newTodo.id,
        created: newTodo.created,
        modified: newTodo.modified,
        parent: currentTodo.id,
      })
      .then((res) => {
        if (res.ok) {
          todosDB.updateDirties([newTodo.id], false)
          res.json().then((result) => {
            todosDB.updateIndex(newTodo.id, result.index)
          })
        }
      })

    router.replace(`/todos/${newTodo.id}`)
  }

  const deleteTodo = async (): Promise<void> => {
    const currentTodo = await todosDB.getTodo(params.id as string)
    if (currentTodo == null) return

    const deleteQuery = searchParams.get('deleteModal')
    if (deleteQuery) {
      if (fileId) {
        api
          .patchSheetGoogleTodo(fileId, {
            index: currentTodo.index,
            deleted: true,
          })
          .then((res) => {
            if (res.ok) todosDB.updateDirties([currentTodo.id], false)
          })
        const now = Date.now()
        if (currentTodo.parentId) {
          const parentTodo = await todosDB.getTodo(currentTodo.parentId as string)
          if (parentTodo == null) return
          api
            .patchSheetGoogleTodo(fileId, {
              index: parentTodo.index,
              parent: parentTodo.parentId,
              child: currentTodo.childId,
              modified: now,
            })
            .then((res) => {
              if (res.ok) todosDB.updateDirties([currentTodo.id], false)
            })
        }
      }

      if (currentTodo.childId) {
        const childTodo = await todosDB.getTodo(currentTodo.childId as string)
        if (childTodo == null) return

        if (fileId) {
          const now = Date.now()
          api
            .patchSheetGoogleTodo(fileId, {
              index: childTodo.index,
              parent: currentTodo.parentId,
              child: childTodo.childId,
              modified: now,
            })
            .then((res) => {
              if (res.ok) todosDB.updateDirties([currentTodo.id], false)
            })
        }
      }

      deleteImageAll()
      await todosDB.deleteTodo(deleteQuery)

      router.back()
      await etcUtil.sleep(250)
      router.back()
    }
  }

  const changeTag = async (tag: Tag): Promise<void> => {
    const tagQuery = searchParams.get('todoTag')
    if (tagQuery) {
      const modified = await todosDB.updateTag(tagQuery, tag.id)
      if (todo != null)
        api
          .patchSheetGoogleTodo(fileId, {
            index: todo.index,
            tag: tag.id,
            modified,
          })
          .then((res) => {
            if (res.ok) todosDB.updateDirties([todo.id], false)
          })

      setTodo((prev) => prev && { ...prev, tagId: tag.id })
      router.back()
    }
  }

  const updateStatus = async (status: Todo['status'], todoId: string): Promise<void> => {
    const modified = await todosDB.updateStatus(todoId, status)

    if (todo != null)
      api.patchSheetGoogleTodo(fileId, { index: todo?.index, status, modified }).then((res) => {
        if (res.ok) todosDB.updateDirties([todo.id], false)
      })

    if (todoId === todo?.id) setTodo((prev) => ({ ...prev!, status }))

    router.back()
  }

  const updateTime = async (
    todo: Todo,
    values: { start: Todo['start']; end: Todo['end']; days?: Todo['days'] }
  ): Promise<void> => {
    const modified = await todosDB.updateTimes(todo.id, values)
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

    setTodo((prev) => prev && { ...prev, ...values })
  }

  const addImages = async (files: Blob[]): Promise<void> => {
    if (images && files.length + images.length > 5) {
      alert('이미지는 5개까지만 등록 가능합니다.')
      return
    }

    const currentTodo = await todosDB.getTodo(params.id as string)
    if (currentTodo == null) return

    todosDB.updateDirties([currentTodo.id], true)
    const transformed = files.map((file) => etcUtil.fileToWebp(file))
    const res = await Promise.all(transformed)
    const blobs = res.map(([blob]) => blob)
    const base64s = res.map(([_, base64]) => base64)

    if (fileId) {
      setImages([
        ...base64s.map((item) => ({ id: 'uploading', image: item, todoId: currentTodo.id ?? '' })),
        ...(images ?? []),
      ])

      const formData = new FormData()
      blobs.forEach((file) => formData.append('images', file))
      formData.append('folderId', imageFolderId)
      const res = await api.postUploadGoogleImage(formData)
      const result = await res.json()
      const newImages = [...result.urls, ...(images?.map(({ image }) => image) ?? [])]
      const now = await todosDB.updateImages(params.id as string, newImages)

      api
        .patchSheetGoogleTodo(fileId, {
          index: currentTodo.index,
          images: encodeURIComponent(newImages.join(',')),
          modified: now,
        })
        .then((res) => {
          if (res.ok) todosDB.updateDirties([currentTodo.id], false)
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
      const ress = await postImages(params.id as string, blobs)
      setImages((prev) => [
        ...ress.map((item, index) => ({ ...item, image: base64s[index] })),
        ...(prev ?? []),
      ])
    }
  }

  const deleteImage = async (): Promise<void> => {
    if (images == null) return
    if (todo == null) return

    const image = searchParams.get('image') ?? ''
    const index = +image

    const currentTodo = await todosDB.getTodo(params.id as string)
    if (currentTodo == null) return

    if (fileId) {
      const remaineds = images.filter((_, i) => i !== index)
      const deleteImages = images.filter((_, i) => i === index).map(({ image }) => image)
      const ids = deleteImages.map((url) => new URL(url).pathname.split('/').at(-1))
      const now = await todosDB.updateImages(
        params.id as string,
        remaineds.map(({ image }) => image)
      )
      api.deleteUploadGoogleImage(encodeURIComponent(ids.join(',')))
      const deleteQueris = remaineds.map(({ image }) => image).join(',') || 'undefined'
      api
        .patchSheetGoogleTodo(fileId, {
          index: currentTodo.index,
          images: encodeURIComponent(deleteQueris),
          modified: now,
        })
        .then((res) => {
          if (res.ok) todosDB.updateDirties([currentTodo.id], false)
          setImages((prev) => prev?.filter((_, i) => i !== index))
        })
    } else {
      await deleteImages([images[index].id])
      setImages((prev) => prev?.filter((_, i) => i !== index))
    }
    router.back()
  }

  const deleteImageAll = async (): Promise<void> => {
    if (images == null) return
    if (todo == null) return

    if (!fileId) deleteImages(images.map(({ id }) => id))
    else {
      const deleteImages = images.map(({ image }) => image)
      const ids = deleteImages.map((url) => new URL(url).pathname.split('/').at(-1))
      api.deleteUploadGoogleImage(encodeURIComponent(ids.join(',')))
    }
  }

  useLayoutEffect(() => {
    setIsLoading(true)
  }, [])

  useEffect(() => {
    loadTodo().then((todo) => loadImages(todo))
  }, [loadImages, loadTodo])

  useEffect(() => {
    setIsShowDeleteModal(!!searchParams.get('deleteModal'))
    setIsShowTagModal(!!searchParams.get('todoTag'))
    setIsShowImageModal(!!searchParams.get('images'))
    setIsShowTimeModal(!!searchParams.get('time'))
    setIsShowStatusModal(!!searchParams.get('todoStatus'))
  }, [searchParams])

  if (isLoading)
    return (
      <div className='flex-1 | flex items-center justify-center'>
        <UISpinner />
      </div>
    )
  else if (todo != null)
    return (
      <div className='flex-1 | flex flex-col | max-h-full | px-[16px] sm:px-0 mt-[12px] mb-[24px] sm:mt-0'>
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
        <TodosStatusModal
          isShow={isShowStatusModal}
          close={router.back}
          select={(status) => updateStatus(status, todo.id)}
        />
        {todo && (
          <TodosImagesModal
            images={images}
            todo={todo}
            isShow={isShowImageModal}
            close={router.back}
          />
        )}

        <div className='mb-[24px]'>
          <button
            type='button'
            className='opacity-80 | flex items-center | max-w-[300px]'
            onClick={() => history.back()}>
            <Icon
              name='chevron-left'
              className='text-[20px] sm:text-[24px]'
            />

            <p className='text-[18px] sm:text-[20px] truncate'>
              {textValue.split(/\n/)[0] || '내용을 입력하세요.'}
            </p>
          </button>
          <p className='text-[13px] sm:text-[15px] opacity-50 | hidden sm:block'>
            모든 글은 자동으로 저장 됩니다.
          </p>
        </div>
        {todo?.parentId && (
          <div
            id='test2'
            className='mb-[12px]'>
            <div className='inner'>
              <Link
                href={`/todos/${todo?.parentId}`}
                replace
                className='p-[8px]  | text-[13px] | flex gap-[12px]'>
                <p className='shrink-0 | flex items-center | opacity-70'>
                  <Icon
                    name='chevron-up'
                    className='text-[20px]'
                  />
                  상위
                </p>
                <p className='truncate'>{parentTodo?.description?.split(/\n/)[0]}</p>
              </Link>
            </div>
          </div>
        )}
        <div className='pb-[4px] | flex-1 overflow-hidden | flex gap-[16px] flex-col sm:flex-row'>
          <div
            id='test2'
            className='flex-1 w-full h-full'>
            <div className='inner | h-full bg-white'>
              <div className='h-full | flex flex-col | sm:overflow-auto | dark:bg-zinc-800'>
                <TodosEditor
                  todo={todo}
                  updateText={saveText}
                  addImages={addImages}
                />
              </div>
            </div>
          </div>
          <TodosImages
            todo={todo}
            images={images}
            addImages={addImages}
            deleteImage={deleteImage}
          />
        </div>

        {childTodo ? (
          <div
            id='test2'
            className='mt-[12px]'>
            <div className='inner'>
              <Link
                href={`/todos/${childTodo.id}`}
                replace
                className='p-[8px] | text-[13px] | flex gap-[12px]'>
                <p className='shrink-0 | flex items-center | opacity-70'>
                  <Icon
                    name='chevron-down'
                    className='text-[20px]'
                  />
                  하위
                </p>
                <p className='truncate'>{childTodo.description?.split(/\n/)[0]}</p>
              </Link>
            </div>
          </div>
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
