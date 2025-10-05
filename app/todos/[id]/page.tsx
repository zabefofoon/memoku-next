'use client'

import { Icon } from '@/components/Icon'
import TagBadge from '@/components/TagBadge'
import TodosDatePicker from '@/components/TodosDatePicker'
import TodosStatus from '@/components/TodosStatus'
import UIDropdown from '@/components/UIDropdown'
import { useDateUtil } from '@/hooks/useDateUtil'
import { Todo } from '@/models/Todo'
import { useTodosStore } from '@/stores/todos.store'
import debounce from 'lodash.debounce'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useState } from 'react'

export default function TodosDetail(props: PageProps<'/todos/[id]'>) {
  const router = useRouter()
  const todosStore = useTodosStore()

  const dateUtil = useDateUtil()

  const [todo, setTodo] = useState<Todo>()
  const [textValue, setTextValue] = useState<string>('')

  const [open, setOpen] = useState(false)

  const loadTodo = async (): Promise<void> => {
    const params = await props.params
    if (isNaN(+params.id)) return
    const res = await todosStore.getTodo(+params.id)
    setTodo(res)
    setTextValue(res?.description ?? '')
    console.log(res)
  }

  const moveToBack = (): void => {
    history.back()
  }

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

  const handleTextareaInput = (event: FormEvent<HTMLTextAreaElement>): void => {
    setTextareaAutoHeight(event)
    saveText(event.currentTarget.value)
  }
  const setTextareaAutoHeight = (event: FormEvent<HTMLTextAreaElement>): void => {
    event.currentTarget.style.height = '0'
    event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`
  }

  useEffect(() => {
    loadTodo()
  }, [])

  return (
    <div className='flex-1 | flex flex-col'>
      <div className='mb-[24px]'>
        <button
          type='button'
          className='opacity-80 | flex items-center | max-w-[300px]'
          onClick={moveToBack}>
          <Icon
            name='chevron-left'
            className='text-[24px]'
          />
          <p className='text-[20px] truncate'>{textValue.split(/\n/)[0] || '내용을 입력하세요.'}</p>
        </button>
      </div>
      <div className='relative | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[8px]'>
        <textarea
          name='postContent'
          className='w-full min-h-[120px] resize-none | rounded-xl p-[8px]'
          value={textValue}
          onChange={(e) => setTextValue(e.currentTarget.value)}
          onInput={handleTextareaInput}></textarea>
        <div className='flex items-center gap-[6px] px-[8px]'>
          <TagBadge todo={todo} />
          <TodosStatus />
          <UIDropdown
            isOpen={open}
            onOpenChange={setOpen}
            position={{ x: 'LEFT' }}
            fitOptionsParent={false}
            renderButton={({ toggle }) => (
              <button
                type='button'
                className='flex items-center justify-center gap-[4px] | h-[32px] px-[6px] | rounded-full opacity-70 | bg-slate-100 text-slate-600'
                onClick={() => toggle()}>
                <Icon
                  name='alarm'
                  className='text-[20px]'
                />
                <span className='text-[11px] font-[700]'>24.11.19 오후 11:42 까지</span>
              </button>
            )}
            renderOptions={({ toggle }) => (
              <div className='w-[320px] py-[12px]'>
                <TodosDatePicker onChange={() => toggle(false)} />
              </div>
            )}
          />
          <p className='flex gap-[8px] | ml-auto | opacity-70 | text-[12px] leading-[130%]'>
            <span>마지막 수정일</span>
            <span>{dateUtil.parseDate(todo?.modified)}</span>
          </p>
        </div>
      </div>
      <button
        className='shadow-lg bg-violet-500 | mt-[24px] px-[20px] py-[6px] mx-auto | w-fit | rounded-2xl'
        type='button'>
        <p className='text-white text-[15px]'>연관 일 추가하기</p>
      </button>
    </div>
  )
}
