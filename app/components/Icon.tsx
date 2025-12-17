'use client'

import { CSSProperties, useEffect, useState } from 'react'

interface Props {
  name: string
  className?: string
  style?: CSSProperties
}

export function Icon({ name, className, style }: Props) {
  const [mounted, setMounted] = useState<boolean>()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <span className={className}>
      <svg
        width='1em'
        height='1em'
        style={style}>
        <use
          href={`/icons/icons.svg?v=2#icon-${name}`}
          xlinkHref={`/icons/icons.svg?v=2#icon-${name}`}
          key={`${mounted}`}
        />
      </svg>
    </span>
  )
}
