'use client'

import { Icon } from '@/app/components/Icon'
import { TodosDeleteModal } from '@/app/components/TodosDeleteModal'
import TodosEditor from '@/app/components/TodosEditor'
import TodosImagesModal from '@/app/components/TodosImagesModal'
import { TodosTagModal } from '@/app/components/TodosTagModal'
import TodosTimeModal from '@/app/components/TodosTimeModal'
import { Tag, Todo } from '@/app/models/Todo'
import { useTodosStore } from '@/app/stores/todos.store'
import debounce from 'lodash.debounce'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function TodosDetail(props: PageProps<'/todos/[id]'>) {
  const router = useRouter()
  const todosStore = useTodosStore()

  const [todo, setTodo] = useState<Todo>()
  const [textValue, setTextValue] = useState<string>('')

  const [parents, setParents] = useState<Todo[]>()
  const [children, setChildren] = useState<Todo[]>()

  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false)
  const [isShowTagModal, setIsShowTagModal] = useState(false)
  const [isShowImageModal, setIsShowImageModal] = useState(false)
  const [isShowTimeModal, setIsShowTimeModal] = useState(false)

  const saveText = useMemo(
    () =>
      debounce(async (text: string): Promise<void> => {
        const params = await props.params
        setTextValue(text)

        if (isNaN(+params.id)) {
          const res = await todosStore.postDescription(text)
          params.id = res.toString()
          window.history.replaceState(null, '', `/todos/${res}`)
        } else todosStore.updateDescription(+params.id, text)
      }, 250),
    []
  )

  const addChildren = async (): Promise<void> => {
    const newChild: Todo = {
      description: '',
      parentId: children?.at(-1)?.id || todo?.id,
      tagId: todo?.tagId,
      status: 'created',
    }
    const res = await todosStore.addNewTodo(newChild)
    newChild.id = res
    setChildren((prev) => [...(prev ?? []), newChild])
    router.replace(`/todos/${res}`)
  }

  const saveChildrenText = useMemo(
    () =>
      debounce(async (text, todoId): Promise<void> => {
        todosStore.updateDescription(todoId, text)
      }, 250),
    [todo?.id]
  )

  const loadTodo = async (): Promise<void> => {
    const params = await props.params
    if (isNaN(+params.id)) return
    const res = await todosStore.getTodo(+params.id)
    setTodo(res)
    setTextValue(res?.description ?? '')
  }

  const loadParent = async (): Promise<void> => {
    const params = await props.params
    if (isNaN(+params.id)) return

    const res = await todosStore.getAncestorsFlat(+params.id)
    setParents(res)
  }

  const loadChildren = async (): Promise<void> => {
    const params = await props.params
    if (isNaN(+params.id)) return

    const res = await todosStore.getDescendantsFlat(+params.id)
    setChildren(res)
  }

  const deleteTodo = async (): Promise<void> => {
    const searchParams = await props.searchParams
    if (searchParams.deleteModal && !isNaN(+searchParams.deleteModal)) {
      await todosStore.deleteTodo(+searchParams.deleteModal)

      if (todo?.id === +searchParams.deleteModal) router.replace('/todos')
      else {
        loadTodo()
        loadParent()
        loadChildren()
        router.back()
      }
    }
  }

  const changeTag = async (tag: Tag): Promise<void> => {
    const searchParams = await props.searchParams
    if (searchParams.todoTag && !isNaN(+searchParams.todoTag)) {
      await todosStore.updateTag(+searchParams.todoTag, tag.id)

      loadTodo()
      loadParent()
      loadChildren()
      router.back()
    }
  }

  const handleSearchParams = async (): Promise<void> => {
    const searchParams = await props.searchParams
    setIsShowDeleteModal(!!searchParams.deleteModal)
    setIsShowTagModal(!!searchParams.todoTag)
    setIsShowImageModal(!!searchParams.images)
    setIsShowTimeModal(!!searchParams.time)
  }

  const updateStatus = async (status: Todo['status'], todoId?: number): Promise<void> => {
    if (todoId == null) return

    await todosStore.updateStatus(todoId, status)
    if (todoId === todo?.id) setTodo((prev) => ({ ...prev, status }))
    else if (children?.find((child) => child.id === todoId))
      setChildren((prev) => prev?.map((todo) => (todo.id === todoId ? { ...todo, status } : todo)))
    else if (parents?.find((parent) => parent.id === todoId))
      setParents((prev) => prev?.map((todo) => (todo.id === todoId ? { ...todo, status } : todo)))
  }

  const updateTime = async (
    id: number,
    values: { start: Todo['start']; end: Todo['end']; days?: Todo['days'] }
  ): Promise<void> => {
    await todosStore.updateTimes(id, values)

    if (id === todo?.id) setTodo((prev) => prev && { ...prev, ...values })
    else if (children?.find((child) => child.id === id))
      setChildren((prev) => prev?.map((todo) => (todo.id === id ? { ...todo, ...values } : todo)))
    else if (parents?.find((parent) => parent.id === id))
      setParents((prev) => prev?.map((todo) => (todo.id === id ? { ...todo, ...values } : todo)))
  }

  const deleteTime = async (id?: number): Promise<void> => {
    if (id == null) return
    const values = { start: undefined, end: undefined, days: undefined }
    await todosStore.updateTimes(id, values)

    if (id === todo?.id) setTodo((prev) => prev && { ...prev, ...values })
    else if (children?.find((child) => child.id === id))
      setChildren((prev) => prev?.map((todo) => (todo.id === id ? { ...todo, ...values } : todo)))
    else if (parents?.find((parent) => parent.id === id))
      setParents((prev) => prev?.map((todo) => (todo.id === id ? { ...todo, ...values } : todo)))

    router.back()
  }

  useEffect(() => {
    loadTodo()
    loadParent()
    loadChildren()
  }, [])

  useEffect(() => {
    handleSearchParams()
  }, [props.searchParams])

  useEffect(() => {
    props.params.then((params) => {
      setTimeout(() => {
        const target = document.getElementById(`todo-${params.id}`)
        document
          .getElementById('scroll-el')
          ?.scrollTo({ top: target?.offsetTop, behavior: 'smooth' })
      }, 250)
    })
  }, [todo, parents, children])

  return (
    <div className='flex-1 h-full | flex flex-col'>
      <TodosTimeModal
        isShow={isShowTimeModal}
        todos={[todo, ...(parents ?? []), ...(children ?? [])].filter((todo) => !!todo)}
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
      <div className='h-full flex-1 | flex flex-col | sm:overflow-auto'>
        {parents?.map((todo) => (
          <div key={todo.id}>
            <TodosEditor
              todo={todo}
              updateText={saveChildrenText}
              updateStatus={updateStatus}
              deleteTime={deleteTime}
            />
            <div className='h-[28px] | border-x-[3px] border-dotted border-gray-300 dark:border-zinc-600 | mx-[20px]'></div>
          </div>
        ))}
        <TodosEditor
          todo={todo}
          updateText={saveText}
          updateStatus={updateStatus}
          deleteTime={deleteTime}
        />
        {children?.map((todo) => (
          <div key={todo.id}>
            <div className='h-[28px] | border-x-[3px] border-dotted border-gray-300 dark:border-zinc-600 | mx-[20px]'></div>
            <TodosEditor
              todo={todo}
              updateText={saveChildrenText}
              updateStatus={updateStatus}
              deleteTime={deleteTime}
            />
          </div>
        ))}

        <button
          className='shadow-lg bg-violet-500 | mt-[24px] px-[20px] py-[12px] mx-auto | w-fit | rounded-2xl'
          type='button'
          onClick={addChildren}>
          <p className='text-white text-[15px]'>연관 일 추가하기</p>
        </button>
      </div>
    </div>
  )
}
