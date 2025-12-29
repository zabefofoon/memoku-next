'use client'

import { useEffect, useRef } from 'react'
import UICarousel, { UICarouselHandle, UICarouselSlide } from './UICarousel'

interface Props {
  initialHour?: number
  initialMinute?: number
  changeHour: (index: number) => void
  changeMinute: (index: number) => void
}

export default function TimePicker(props: Props) {
  const amCarousel = useRef<UICarouselHandle>(null)

  useEffect(() => {
    setTimeout(() => {
      const index = (props.initialHour ?? 0) < 12 ? 0 : 1
      amCarousel.current?.scrollTo(index)
    }, 100)
  }, [props.initialHour])

  return (
    <div className='relative | flex | mb-[32px]'>
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
            <span className='text-[18px]'>{item}</span>
          </UICarouselSlide>
        ))}
      </UICarousel>
      <UICarousel
        className='w-full h-[120px]'
        startIndex={props.initialHour ?? 0}
        hideDots
        loop
        dragFree
        scrollSnap
        vertical
        perview={3}
        change={(index) => {
          props.changeHour(index)
          if (index < 12) amCarousel.current?.scrollTo(0)
          else amCarousel.current?.scrollTo(1)
        }}>
        {Array.from({ length: 24 }).map((_, index) => (
          <UICarouselSlide
            key={index}
            className='h-[40px] | flex items-center justify-center'>
            <span className='text-[18px]'>{`${index}`.padStart(2, '0')}</span>
          </UICarouselSlide>
        ))}
      </UICarousel>
      <UICarousel
        className='w-full h-[120px]'
        startIndex={props.initialMinute ?? 0}
        hideDots
        loop
        dragFree
        scrollSnap
        vertical
        perview={3}
        change={props.changeMinute}>
        {Array.from({ length: 60 }).map((_, index) => (
          <UICarouselSlide
            key={index}
            className='h-[40px] | flex items-center justify-center'>
            <span className='text-[18px]'>{`${index}`.padStart(2, '0')}</span>
          </UICarouselSlide>
        ))}
      </UICarousel>
    </div>
  )
}
