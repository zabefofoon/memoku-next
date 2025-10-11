'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import UIDropdown from './UIDropdown'

export default function TodosStatusDropdown() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const urlParams = new URLSearchParams(searchParams.toString())

  const items = [
    { name: '전체', value: undefined },
    { name: '생성됨', value: 'created' },
    { name: '진행중', value: 'inprogress' },
    { name: '완료', value: 'done' },
  ]

  const selectedItem = items.find((item) => item.value === urlParams.get('status'))

  const moveTo = (status?: string): void => {
    if (!status) urlParams.delete('status')
    else urlParams.set('status', status)

    const queryString = urlParams.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  return (
    <UIDropdown
      isOpen={open}
      onOpenChange={setOpen}
      fitOptionsParent={false}
      renderButton={({ toggle }) => (
        <button
          type='button'
          className='flex items-center'
          onClick={() => toggle()}>
          <span className='text-[13px] sm:text-[14px]'>{selectedItem?.name ?? '전체'}</span>
          <Icon
            name='chevron-down'
            className='text-[24px]'
          />
        </button>
      )}
      renderOptions={({ toggle }) => (
        <div className='flex flex-col | text-[13px] sm:text-[15px]'>
          {items.map((item) => (
            <button
              key={item.name}
              type='button'
              className={etcUtil.classNames([
                'px-[12px] py-[3px] | flex justify-center hover:bg-slate-50 hover:dark:bg-zinc-600',
                { 'bg-slate-50 dark:bg-zinc-600': selectedItem?.value === item.value },
              ])}
              onClick={() => toggle(false, () => moveTo(item.value))}>
              {item.name}
            </button>
          ))}
        </div>
      )}
    />
  )
}
