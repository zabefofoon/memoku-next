'use client'

import { Icon } from '@/app/components/Icon'
import { TodosDeleteModal } from '@/app/components/TodosDeleteModal'
import TodosEditor from '@/app/components/TodosEditor'
import TodosImagesModal from '@/app/components/TodosImagesModal'
import { TodosTagModal } from '@/app/components/TodosTagModal'
import TodosTimeModal from '@/app/components/TodosTimeModal'
import { Tag, Todo } from '@/app/models/Todo'
import { useTodosStore } from '@/app/stores/todos.store'
import etcUtil from '@/app/utils/etc.util'
import debounce from 'lodash.debounce'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function TodosDetail(props: PageProps<'/todos/[id]'>) {
  const router = useRouter()
  const todosStore = useTodosStore()

  const [todo, setTodo] = useState<Todo>()
  const [parentTodo, setParentTodo] = useState<Todo>()
  const [childTodo, setChildTodo] = useState<Todo>()
  const [textValue, setTextValue] = useState<string>('')

  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false)
  const [isShowTagModal, setIsShowTagModal] = useState(false)
  const [isShowImageModal, setIsShowImageModal] = useState(false)
  const [isShowTimeModal, setIsShowTimeModal] = useState(false)

  const saveText = useMemo(
    () =>
      debounce(async (text: string): Promise<void> => {
        const params = await props.params
        setTextValue(text)
        if (!isNaN(+params.id)) todosStore.updateDescription(+params.id, text)
      }, 250),
    []
  )

  const addChildren = async (): Promise<void> => {
    const newChild: Todo = {
      description: '',
      parentId: todo?.id,
      tagId: todo?.tagId,
      status: 'created',
    }
    const res = await todosStore.addNewTodo(newChild)
    newChild.id = res
    router.replace(`/todos/${res}`)
  }

  const loadTodo = async (): Promise<void> => {
    const params = await props.params
    if (isNaN(+params.id)) return

    const res = await todosStore.getTodo(+params.id)
    setTodo(res)
    setTextValue(res?.description ?? '')

    if (res.parentId) todosStore.getParentTodo(res.parentId).then(setParentTodo)
    if (res.id) todosStore.getChildTodo(res.id).then(setChildTodo)
  }

  const deleteTodo = async (): Promise<void> => {
    const searchParams = await props.searchParams
    if (searchParams.deleteModal && !isNaN(+searchParams.deleteModal)) {
      await todosStore.deleteTodo(+searchParams.deleteModal)
      router.back()
      await etcUtil.sleep(250)
      router.replace('/todos')
    }
  }

  const changeTag = async (tag: Tag): Promise<void> => {
    const searchParams = await props.searchParams

    if (searchParams.todoTag && !isNaN(+searchParams.todoTag)) {
      await todosStore.updateTag(+searchParams.todoTag, tag.id)
      setTodo((prev) => prev && { ...prev, tagId: tag.id })
      router.back()
    }
  }

  const updateStatus = async (status: Todo['status'], todoId?: number): Promise<void> => {
    if (todoId == null) return

    await todosStore.updateStatus(todoId, status)
    if (todoId === todo?.id) setTodo((prev) => ({ ...prev, status }))
  }

  const updateTime = async (
    id: number,
    values: { start: Todo['start']; end: Todo['end']; days?: Todo['days'] }
  ): Promise<void> => {
    await todosStore.updateTimes(id, values)

    if (id === todo?.id) setTodo((prev) => prev && { ...prev, ...values })
  }

  const deleteTime = async (id?: number): Promise<void> => {
    if (id == null) return
    const values = { start: undefined, end: undefined, days: undefined }
    await todosStore.updateTimes(id, values)

    if (id === todo?.id) setTodo((prev) => prev && { ...prev, ...values })

    router.back()
  }

  const handleSearchParams = async (): Promise<void> => {
    const searchParams = await props.searchParams
    setIsShowDeleteModal(!!searchParams.deleteModal)
    setIsShowTagModal(!!searchParams.todoTag)
    setIsShowImageModal(!!searchParams.images)
    setIsShowTimeModal(!!searchParams.time)
  }

  useEffect(() => {
    loadTodo()
  }, [])

  useEffect(() => {
    handleSearchParams()
  }, [props.searchParams])

  return (
    <div className='flex-1 max-h-full | flex flex-col'>
      <TodosTimeModal
        isShow={isShowTimeModal}
        todos={[todo].filter((todo) => !!todo)}
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

      <div className='mb-[24px] hidden sm:block'>
        <button
          type='button'
          className='opacity-80 | flex items-center | max-w-[300px]'
          onClick={() => history.back()}>
          <Icon
            name='chevron-left'
            className='text-[24px]'
          />
          <p className='text-[20px] truncate'>{textValue.split(/\n/)[0] || '내용을 입력하세요.'}</p>
        </button>
        <p className='text-[16px] opacity-50'>모든 글은 자동으로 저장 됩니다.</p>
      </div>
      {todo?.parentId && todo.parentId !== -1 && (
        <Link
          href={`/todos/${todo?.parentId}`}
          replace
          className='p-[8px] mb-[12px] | text-[14px] | bg-white dark:bg-zinc-800 shadow-md rounded-xl | flex gap-[12px]'>
          <p className='flex items-center | opacity-70'>
            <Icon
              name='chevron-up'
              className='text-[20px]'
            />
            상위
          </p>
          <p>{parentTodo?.description}</p>
        </Link>
      )}
      <div className='h-full flex-1 | flex flex-col | sm:overflow-auto | bg-white dark:bg-zinc-800 shadow-md rounded-xl'>
        <TodosEditor
          todo={todo}
          updateText={saveText}
          updateStatus={updateStatus}
          deleteTime={deleteTime}
        />
      </div>
      {childTodo ? (
        <Link
          href={`/todos/${childTodo.id}`}
          replace
          className='p-[8px] mt-[12px] | text-[14px] | bg-white dark:bg-zinc-800 shadow-md rounded-xl | flex gap-[12px]'>
          <p className='flex items-center | opacity-70'>
            <Icon
              name='chevron-down'
              className='text-[20px]'
            />
            하위
          </p>
          <p>{childTodo.description}</p>
        </Link>
      ) : (
        <button
          className='flex items-center | shadow-lg bg-violet-500 | text-white | pl-[12px] pr-[20px] py-[12px] mt-[12px] mx-auto | w-fit | rounded-2xl'
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
