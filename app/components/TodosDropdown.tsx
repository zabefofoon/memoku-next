import Link from 'next/link'
import { useState } from 'react'
import { Todo } from '../models/Todo'
import { Icon } from './Icon'
import UIDropdown, { Position } from './UIDropdown'

interface Props {
  todo: Todo
  position?: Partial<Position>
  hideTime?: boolean
  hideEdit?: boolean
  hideDelete?: boolean
}

export function TodosDropdown(props: Props) {
  const [isOpen, setOpen] = useState<boolean>(false)
  return (
    <UIDropdown
      isOpen={isOpen}
      fitOptionsParent={false}
      onOpenChange={setOpen}
      position={props.position}
      renderButton={({ toggle }) => (
        <button
          type='button'
          onClick={() => toggle()}>
          <Icon
            name='overflow'
            className='text-[20px]'
          />
        </button>
      )}
      renderOptions={({ toggle }) => (
        <div className='py-[3px] | flex flex-col'>
          {!props.hideTime && (
            <Link
              href={`?time=${props.todo.id}`}
              className='px-[6px] py-[4px] | flex items-center justify-start gap-[6px] | hover:bg-slate-50 hover:dark:bg-zinc-600'
              onClick={() => toggle(false)}>
              <Icon
                name='alarm'
                className='text-[20px]'
              />
              <p className='text-[13px]'>일정 설정</p>
            </Link>
          )}
          {!props.hideEdit && (
            <Link
              href={`/todos/${props.todo.id}`}
              className='px-[6px] py-[4px] | flex items-center justify-start gap-[6px] | hover:bg-slate-50 hover:dark:bg-zinc-600'>
              <Icon
                name='edit'
                className='text-[20px]'
              />
              <p className='text-[13px]'>내용 수정</p>
            </Link>
          )}
          {!props.hideDelete && (
            <Link
              href={`?deleteModal=${props.todo.id}`}
              className='px-[6px] py-[4px] | flex items-center justify-start gap-[6px] | hover:bg-slate-100 hover:dark:bg-red-600'
              onClick={() => toggle(false)}>
              <Icon
                name='delete'
                className='text-[20px]'
              />
              <p className='text-[13px]'>할 일 삭제</p>
            </Link>
          )}
        </div>
      )}
    />
  )
}
