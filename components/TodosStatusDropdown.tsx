'use client'

import { useState } from 'react'
import { Icon } from './Icon'
import UIDropdown from './UIDropdown'

export default function TodosStatusDropdown() {
  const [open, setOpen] = useState(false)

  return (
    <UIDropdown
      isOpen={open}
      onOpenChange={setOpen}
      position={{ x: 'RIGHT', y: 'BOTTOM' }}
      fitOptionsParent={false}
      renderButton={({ toggle }) => (
        <button
          type='button'
          className='flex items-center'
          onClick={() => toggle()}>
          <span className='text-[14px]'>모든 상태</span>
          <Icon
            name='chevron-down'
            className='text-[24px]'
          />
        </button>
      )}
      renderOptions={({ toggle }) => (
        <div className='flex flex-col'>
          <button
            type='button'
            className=''
            onClick={() => toggle(false)}>
            Item 1
          </button>
          <button
            type='button'
            className=''
            onClick={() => toggle(false)}>
            Item 2
          </button>
        </div>
      )}
    />
  )
}
