'use client'

import { ReactElement, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CSSTransition } from 'react-transition-group'
import { Icon } from './Icon'

interface Props {
  open: boolean
  close?: () => void
  header: () => ReactElement
  content: () => ReactElement
  cancel: () => ReactElement
  ok: () => ReactElement
}

export default function UIModal(props: Props) {
  const nodeRef = useRef<HTMLDivElement>(null)

  // ESC로 닫기
  useEffect(() => {
    if (!props.open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.close?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [props.open, props.close])

  const modal = (
    <CSSTransition
      in={props.open}
      timeout={240}
      classNames='fade'
      mountOnEnter
      unmountOnExit
      nodeRef={nodeRef}>
      <div
        ref={nodeRef}
        role='dialog'
        aria-modal='true'
        className='fixed left-0 top-0 z-50 w-full h-full flex items-center justify-center'>
        <button
          aria-label='닫기'
          onClick={props.close}
          className='absolute inset-0 bg-black/50'
        />
        <div className='modal-card | flex flex-col gap-[12px] | relative z-10 | min-w-[320px] | p-[16px] | rounded-xl bg-white dark:bg-zinc-800 shadow-xl'>
          <div className='flex justify-between'>
            <p className='text-[20px] font-[700]'>{props.header?.() || '제목'}</p>
            <button
              type='button'
              onClick={props.close}>
              <Icon name='close' />
            </button>
          </div>
          <div className='mb-[12px]'>{props.content?.()}</div>
          <div className='flex flex-col gap-[4px]'>
            {props.ok?.()}
            {props.cancel?.()}
          </div>
        </div>
      </div>
    </CSSTransition>
  )

  return typeof window === 'undefined' ? null : createPortal(modal, document.body)
}
