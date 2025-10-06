import { useDateUtil } from '@/app/hooks/useDateUtil'
import { Todo } from '@/app/models/Todo'
import { useTodosStore } from '@/app/stores/todos.store'
import etcUtil from '@/app/utils/etc.util'
import { FormEvent, useEffect, useState } from 'react'
import { Icon } from './Icon'
import TagBadge from './TagBadge'
import TodosDatePicker from './TodosDatePicker'
import TodosDeleteButton from './TodosDeleteButton'
import TodosPeriodText from './TodosPeriodText'
import TodosStatus from './TodosStatus'
import UIDropdown from './UIDropdown'

interface Props {
  todo?: Todo
  updateText?: (text: string, todoId?: number) => void
}

export default function TodosEditor(props: Props) {
  const todosStore = useTodosStore()
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

  const setTodoRange = (range?: { start?: number; end?: number }): void => {
    if (range == null) return
    if (props.todo == null) return

    props.todo.start = range.start
    props.todo.end = range.end

    if (props.todo.id != null) todosStore.updateRange(props.todo.id, range)
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
        className='w-full min-h-[100px] resize-none | rounded-xl p-[8px] | text-[15px]'
        value={textValue}
        onChange={(e) => setTextValue(e.currentTarget.value)}
        onInput={handleTextareaInput}></textarea>
      <div className='flex items-center gap-[6px] px-[8px]'>
        <TagBadge todo={props.todo} />
        <TodosStatus />
        <UIDropdown
          isOpen={open}
          onOpenChange={setOpen}
          fitOptionsParent={false}
          renderButton={({ toggle }) => (
            <button
              type='button'
              className='flex items-center gap-[4px]'
              onClick={() => toggle()}>
              <Icon
                name='alarm'
                className={etcUtil.classNames(
                  'w-[32px] aspect-square rounded-full | flex items-center justify-center | text-[20px]',
                  props.todo && props.todo.start && props.todo.end
                    ? 'bg-violet-500 text-white'
                    : 'opacity-70 | bg-slate-100 text-slate-600'
                )}
              />
              {props.todo && props.todo.start && props.todo.end && (
                <span className='text-[12px] font-[700]'>
                  <TodosPeriodText todo={props.todo} />
                </span>
              )}
            </button>
          )}
          renderOptions={({ toggle }) => (
            <div className='w-full max-w-[328px] py-[12px]'>
              <TodosDatePicker
                value={{ start: props.todo?.start, end: props.todo?.end }}
                onChange={(range) => toggle(false, () => setTodoRange(range))}
                onCancel={() => toggle(false)}
              />
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
