'use client'

import { ReactElement, SyntheticEvent, TouchEvent, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { If, Then } from 'react-if'
import { CSSTransition } from 'react-transition-group'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'

interface Props {
  containerClass?: string
  open: boolean
  close?: () => void
  header?: () => ReactElement
  filters?: () => ReactElement
  content: () => ReactElement
  cancel?: () => ReactElement
  ok?: () => ReactElement
}

export default function UIBottomSheet({
  open,
  close,
  header,
  filters,
  content,
  cancel,
  ok,
  containerClass,
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollTop = useRef<number>(0)
  const touchStarted = useRef<number>(0)
  const touchMovedY = useRef<number>(0)
  const rafId = useRef<number | null>(null)

  const handleOnScroll = (event: SyntheticEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLDivElement
    scrollTop.current = target.scrollTop
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const target = document.getElementById('bottomsheet-scroll-el')

    if (target && target.scrollTop > 0) return

    touchStarted.current = event.touches[0].clientY
  }
  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const target = document.getElementById('bottomsheet-scroll-el')

    if (target && target.scrollTop > 0) return

    const diff = touchStarted.current - event.touches[0].clientY
    if (diff < 0) {
      touchMovedY.current = diff
      if (rafId.current !== null) return
      rafId.current = window.requestAnimationFrame(() => {
        if (containerRef.current)
          containerRef.current.style.transform = `translate(0, ${-touchMovedY.current}px)`
        rafId.current = null
      })
    }
  }
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (event.currentTarget.scrollTop > 0) return
    if (touchMovedY.current < -20) close?.()
    else {
      touchMovedY.current = 0
      touchStarted.current = 0
      if (containerRef.current) containerRef.current.style.transform = 'translate(0, 0)'
    }
  }

  // ESC로 닫기
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        touchMovedY.current = 0
        touchStarted.current = 0
        document.documentElement.style.overscrollBehavior = 'contain'
        if (containerRef.current) containerRef.current.style.transform = 'translate(0, 0)'
      }, 100)
    } else {
      document.documentElement.style.overscrollBehavior = document.querySelector(
        '[data-sheet=true]'
      )
        ? 'contain'
        : 'auto'
    }
  }, [open])

  useEffect(() => {
    const target = document.getElementById('bottomsheet-scroll-el')

    scrollTop.current = target?.scrollTop ?? 0

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLDivElement
      scrollTop.current = target.scrollTop
    }
    target?.addEventListener('scroll', handleScroll)
    return () => {
      target?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const bottomSheet = (
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
        className='fixed left-0 top-0 z-50 | w-full h-full | flex items-end sm:items-center justify-center'
        data-sheet={open}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchCancel={handleTouchEnd}
        onTouchEnd={handleTouchEnd}>
        <button
          aria-label='닫기'
          onClick={close}
          className='fixed inset-0 bg-black/50 | w-full h-full | backdrop-blur-[2px]'
        />
        <div
          ref={containerRef}
          className={etcUtil.classNames([
            'flex justify-center | sm:py-[32px] | w-full max-h-[90%] sm:max-w-[320px] overflow-auto | scroll-hidden',
            containerClass,
          ])}
          onScroll={handleOnScroll}>
          <div
            className={etcUtil.classNames([
              'bottom-sheet-card | flex flex-col gap-[12px] | relative z-10 | w-full | p-[16px] | rounded-t-4xl sm:rounded-xl bg-gray-100 dark:bg-zinc-900 shadow-xl',
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
            <If condition={!!filters}>
              <Then>{filters?.()}</Then>
            </If>
            <div
              id='bottomsheet-scroll-el'
              className='mb-[12px] | flex-1 h-full overflow-auto | scroll-hidden'>
              {content?.()}
            </div>
            <div className='flex flex-col gap-[4px] | empty:hidden'>
              {ok?.()}
              {cancel?.()}
            </div>
          </div>
        </div>
      </div>
    </CSSTransition>
  )

  return typeof window === 'undefined' ? null : createPortal(bottomSheet, document.body)
}
