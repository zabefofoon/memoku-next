'use client'

import { ReactElement, useState } from 'react'
import { Todo } from '../models/Todo'
import TodosStatusChip from './TodosStatusChip'
import UIDropdown from './UIDropdown'

interface Props {
  status?: Todo['status']
  select?: (status: Todo['status']) => void
}

const status: Todo['status'][] = ['created', 'inprogress', 'done']

export default function TodosStatus(props: Props): ReactElement {
  const [open, setOpen] = useState(false)

  return (
    <UIDropdown
      isOpen={open}
      fitOptionsParent={false}
      onOpenChange={setOpen}
      renderButton={({ toggle }) => (
        <TodosStatusChip
          status={props.status ?? 'created'}
          click={() => toggle()}
        />
      )}
      renderOptions={({ toggle }) => (
        <div className='py-[3px] | flex flex-col'>
          {status.map((value) => (
            <div
              key={value}
              className='px-[6px] py-[3px] | flex justify-center hover:bg-slate-50 hover:dark:bg-zinc-600'>
              <TodosStatusChip
                status={value}
                click={() => toggle(false, () => props.select?.(value))}
              />
            </div>
          ))}
        </div>
      )}
    />
  )
}
