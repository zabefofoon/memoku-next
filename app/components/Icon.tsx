'use client'

import { useEffect, useState } from 'react'

interface Props {
  name: string
  className?: string
}

export function Icon(props: Props) {
  const [mounted, setMounted] = useState<boolean>()
  useEffect(() => {
    setMounted(true)
  })
  return (
    <span className={props.className}>
      <svg
        width='1em'
        height='1em'>
        <use
          href={`/icons/icons.svg#icon-${props.name}`}
          xlinkHref={`/icons/icons.svg#icon-${props.name}`}
          key={`${mounted}`}
        />
      </svg>
    </span>
  )
}
