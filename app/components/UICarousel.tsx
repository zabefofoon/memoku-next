'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { createContext, PropsWithChildren, useContext, useEffect, useRef } from 'react'

interface Props {
  gap?: string
  perview?: number | 'auto'
  loop?: boolean
  dragFree?: boolean
  startIndex?: number
  autoplay?: boolean
  hideDots?: boolean
  active?: boolean
}

const CarouselContext = createContext<{
  perview: number | 'auto'
  gap: string
}>({
  perview: 1,
  gap: '0px',
})

export default function UICarousel(props: PropsWithChildren<Props>) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: props.loop ?? false,
    dragFree: props.dragFree ?? false,
    startIndex: props.startIndex ?? 0,
  })

  const dotsNode = useRef<HTMLDivElement>(null)

  const addDotBtnsAndClickHandlers = (dotsNode: HTMLElement): (() => string) => {
    if (emblaApi == null) return () => (dotsNode.innerHTML = '')

    let dotNodes: HTMLElement[] = []
    const addDotBtnsWithClickHandlers = (): void => {
      dotsNode.innerHTML =
        emblaApi
          .scrollSnapList()
          .map(() => '<button type="button" class="embla-dot" type="button"></button>')
          .join('') ?? ''

      const scrollTo = (index: number): void => emblaApi.scrollTo(index)

      dotNodes = Array.from(dotsNode.querySelectorAll('.embla-dot'))
      dotNodes.forEach((dotNode, index) =>
        dotNode.addEventListener('click', () => scrollTo(index), false)
      )
    }

    const toggleDotBtnsActive = (): void => {
      const previous = emblaApi.previousScrollSnap()
      const selected = emblaApi.selectedScrollSnap()
      if (dotNodes[previous] && dotNodes[selected]) {
        dotNodes[previous].classList.remove('embla-dot-selected')
        dotNodes[selected].classList.add('embla-dot-selected')
      }
    }

    emblaApi
      .on('init', addDotBtnsWithClickHandlers)
      .on('reInit', addDotBtnsWithClickHandlers)
      .on('init', toggleDotBtnsActive)
      .on('reInit', toggleDotBtnsActive)
      .on('select', toggleDotBtnsActive)

    return () => (dotsNode.innerHTML = '')
  }

  useEffect(() => {
    if (!props.hideDots) {
      if (dotsNode.current != null) addDotBtnsAndClickHandlers(dotsNode.current)
      emblaApi?.reInit()
    }
  }, [emblaApi, dotsNode.current])

  return (
    <CarouselContext.Provider
      value={{
        gap: props.gap ?? '0px',
        perview: props.perview ?? 1,
      }}>
      <div className='embla'>
        <div
          ref={emblaRef}
          className='embla-viewport'
          role='presentation'
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}>
          <div
            className='embla-container'
            style={{
              flexDirection: 'row',
              height: 'auto',
              marginLeft: `-${props.gap ?? '0px'}`,
            }}>
            {props.children}
          </div>
        </div>
        <div className='embla-controls'>
          {!props.hideDots && (
            <div
              ref={dotsNode}
              className='embla-dots'></div>
          )}
        </div>
      </div>
    </CarouselContext.Provider>
  )
}

export function UICarouselSlide(props: PropsWithChildren) {
  const context = useContext(CarouselContext)

  const flex = context.perview === 'auto' ? '0 0 auto' : `0 0 ${100 / context.perview}%`

  return (
    <div
      className='embla-slide'
      style={{ flex, paddingLeft: context.gap }}
      {...props}>
      {props.children}
    </div>
  )
}
