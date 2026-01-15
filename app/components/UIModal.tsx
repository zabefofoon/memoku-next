'use client'

import { ReactElement, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CSSTransition } from 'react-transition-group'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'

interface Props {
  open: boolean
  close?: () => void
  header?: () => ReactElement
  content: () => ReactElement
  cancel?: () => ReactElement
  ok?: () => ReactElement
}

export default function UIModal({ open, close, header, content, ok, cancel }: Props) {
  const nodeRef = useRef<HTMLDivElement>(null)

  // ESC로 닫기
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  const modal = (
    <CSSTransition
      in={open}
      timeout={240}
      classNames='fade'
      mountOnEnter
      unmountOnExit
      nodeRef={nodeRef}>
      <div
        ref={nodeRef}
        role='dialog'
        aria-modal='true'
        className='text-slate-800 dark:text-white/95 | fixed left-0 top-0 z-50 | w-full h-full | flex items-center justify-center'>
        <button
          aria-label='닫기'
          onClick={close}
          className='fixed inset-0 bg-black/50 | w-full h-full | backdrop-blur-[2px]'
        />
        <div className='flex justify-center | max-h-full py-[32px] overflow-auto | scroll-hidden'>
          <div
            className={etcUtil.classNames([
              'modal-card | flex flex-col gap-[12px] | relative z-10 | min-w-[320px] max-w-[calc(100%-32px)] max-h-[calc(100dvh-64px)] | p-[16px] | rounded-xl bg-white dark:bg-zinc-900 shadow-xl',
            ])}>
            <div className='flex justify-between'>
              {header && <p className='text-[16px] sm:text-[20px] font-[700]'>{header()}</p>}
              <button
                type='button'
                className='ml-auto'
                onClick={close}>
                <Icon name='close' />
              </button>
            </div>
            <div
              id='modal-scroll-el'
              className='mb-[12px] | flex-1 h-full overflow-auto | scroll-hidden'>
              {content?.()}
            </div>
            <div className='flex flex-col gap-[4px]'>
              {ok?.()}
              {cancel?.()}
            </div>
          </div>
        </div>
      </div>
    </CSSTransition>
  )

  return typeof window === 'undefined' ? null : createPortal(modal, document.body)
}
