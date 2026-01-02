'use client'

import { useEffect, useRef } from 'react'
import UICarousel, { UICarouselHandle, UICarouselSlide } from './UICarousel'

interface Props {
  initialHour?: number
  initialMinute?: number
  changeHour?: (index: number) => void
  changeMinute?: (index: number) => void
}

export default function TimePicker({
  initialHour,
  initialMinute,
  changeHour,
  changeMinute,
}: Props) {
  const amCarousel = useRef<UICarouselHandle>(null)
  const hourCarousel = useRef<UICarouselHandle>(null)
  const minuteCarousel = useRef<UICarouselHandle>(null)

  useEffect(() => {
    setTimeout(() => {
      const index = (initialHour ?? 0) < 12 ? 0 : 1
      amCarousel.current?.scrollTo(index)

      hourCarousel.current?.scrollTo(initialHour ?? 0, true)
      minuteCarousel.current?.scrollTo((initialMinute ?? 0) / 5, true)
    }, 100)
  }, [initialHour, initialMinute, minuteCarousel, hourCarousel])

  return (
    <div className='select-none relative | flex | mb-[32px]'>
      <div className='w-full h-[40px] | absolute top-[40px] | border-y border-gray-300 dark:border-zinc-600 border-dashed'></div>
      <UICarousel
        ref={amCarousel}
        className='w-full h-[120px] | pointer-events-none'
        hideDots
        vertical>
        {['AM', 'PM'].map((item) => (
          <UICarouselSlide
            key={item}
            className='h-[40px] | flex items-center justify-center'>
            <span className='text-[16px]'>{item}</span>
          </UICarouselSlide>
        ))}
      </UICarousel>
      <UICarousel
        ref={hourCarousel}
        className='w-full h-[120px]'
        hideDots
        loop
        dragFree
        scrollSnap
        vertical
        perview={3}
        change={(index) => {
          changeHour?.(index)
          if (index < 12) amCarousel.current?.scrollTo(0)
          else amCarousel.current?.scrollTo(1)
        }}>
        {Array.from({ length: 24 }).map((_, index) => (
          <UICarouselSlide
            key={index}
            className='h-[40px] | flex items-center justify-center'>
            <span className='text-[16px]'>{`${index}`.padStart(2, '0')}</span>
          </UICarouselSlide>
        ))}
      </UICarousel>
      <UICarousel
        ref={minuteCarousel}
        className='w-full h-[120px]'
        hideDots
        loop
        dragFree
        scrollSnap
        vertical
        perview={3}
        change={changeMinute}>
        {Array.from({ length: 12 }).map((_, index) => (
          <UICarouselSlide
            key={index}
            className='h-[40px] | flex items-center justify-center'>
            <span className='text-[16px]'>{`${index * 5}`.padStart(2, '0')}</span>
          </UICarouselSlide>
        ))}
      </UICarousel>
    </div>
  )
}
