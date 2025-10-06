'use client'

import { Icon } from '@/components/Icon'
import TodosEditor from '@/components/TodosEditor'
import { Todo } from '@/models/Todo'
import { useTodosStore } from '@/stores/todos.store'
import debounce from 'lodash.debounce'
import { useEffect, useMemo, useState } from 'react'

export default function TodosDetail(props: PageProps<'/todos/[id]'>) {
  const todosStore = useTodosStore()

  const [todo, setTodo] = useState<Todo>()
  const [textValue, setTextValue] = useState<string>('')

  const [parents, setParents] = useState<Todo[]>()
  const [children, setChildren] = useState<Todo[]>()

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
    }
    const res = await todosStore.addNewTodo(newChild)
    newChild.id = res
    setChildren((prev) => [...(prev ?? []), newChild])
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

  useEffect(() => {
    loadTodo()
    loadParent()
    loadChildren()
  }, [])

  return (
    <div className='flex-1 | flex flex-col'>
      <div className='mb-[24px]'>
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
      </div>
      <div className='flex flex-col'>
        {parents?.map((todo) => (
          <div key={todo.id}>
            <TodosEditor
              todo={todo}
              updateText={saveChildrenText}
            />
            <div className='h-[28px] | border-x-[3px] border-dotted border-gray-300 dark:border-zinc-600 | mx-[20px]'></div>
          </div>
        ))}
        <TodosEditor
          todo={todo}
          updateText={saveText}
        />
        {children?.map((todo) => (
          <div key={todo.id}>
            <div className='h-[28px] | border-x-[3px] border-dotted border-gray-300 dark:border-zinc-600 | mx-[20px]'></div>
            <TodosEditor
              todo={todo}
              updateText={saveChildrenText}
            />
          </div>
        ))}
      </div>
      <button
        className='shadow-lg bg-violet-500 | mt-[24px] px-[20px] py-[6px] mx-auto | w-fit | rounded-2xl'
        type='button'
        onClick={addChildren}>
        <p className='text-white text-[15px]'>연관 일 추가하기</p>
      </button>
    </div>
  )
}
