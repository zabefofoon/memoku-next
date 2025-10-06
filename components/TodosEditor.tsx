import { useDateUtil } from '@/hooks/useDateUtil'
import { Todo } from '@/models/Todo'
import { FormEvent, useEffect, useState } from 'react'
import { Icon } from './Icon'
import TagBadge from './TagBadge'
import TodosDatePicker from './TodosDatePicker'
import TodosDeleteButton from './TodosDeleteButton'
import TodosStatus from './TodosStatus'
import UIDropdown from './UIDropdown'

interface Props {
  todo?: Todo
  updateText?: (text: string, todoId?: number) => void
}

export default function TodosEditor(props: Props) {
  const [open, setOpen] = useState(false)

  const dateUtil = useDateUtil()

  const [textValue, setTextValue] = useState<string>('')

  const handleTextareaInput = (event: FormEvent<HTMLTextAreaElement>): void => {
    setTextareaAutoHeight(event)
    props.updateText?.(event.currentTarget.value, props.todo?.id)
  }
  const setTextareaAutoHeight = (event: FormEvent<HTMLTextAreaElement>): void => {
    event.currentTarget.style.height = '0'
    event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`
  }

  useEffect(() => {
    setTextValue(props.todo?.description ?? '')
  }, [props.todo?.description])

  return (
    <div className='relative | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[8px]'>
      <div className='absolute top-[16px] right-[16px]'>
        <TodosDeleteButton />
      </div>
      <textarea
        name='postContent'
        className='w-full min-h-[120px] resize-none | rounded-xl p-[8px] | text-[15px]'
        value={textValue}
        onChange={(e) => setTextValue(e.currentTarget.value)}
        onInput={handleTextareaInput}></textarea>
      <div className='flex items-center gap-[6px] px-[8px]'>
        <TagBadge todo={props.todo} />
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
          <span>{dateUtil.parseDate(props.todo?.modified)}</span>
        </p>
      </div>
    </div>
  )
}
