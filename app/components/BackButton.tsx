'use client'

import { Icon } from './Icon'

interface Props {
  title: string
}

export function BackButton({ title }: Props) {
  return (
    <button
      type='button'
      className='opacity-80 | flex items-center | max-w-[600px] | -translate-x-[8px]'
      onClick={() => history.back()}>
      <Icon
        name='chevron-left'
        className='text-[24px]'
      />
      <p className='text-[18px] sm:text-[20px] truncate'>{title}</p>
    </button>
  )
}
