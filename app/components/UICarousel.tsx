'use client'

import type { EmblaCarouselType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import {
  createContext,
  forwardRef,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import etcUtil from '../utils/etc.util'

interface Props {
  gap?: string
  perview?: number | 'auto'
  loop?: boolean
  dragFree?: boolean
  startIndex?: number
  hideDots?: boolean
  vertical?: boolean
  scrollSnap?: boolean
  className?: string
  change?: (index: number) => void
}

export type UICarouselHandle = {
  scrollTo: (index: number, jump?: boolean) => void
}

const CarouselContext = createContext<{
  perview: number | 'auto'
  gap: string
}>({
  perview: 1,
  gap: '0px',
})

export default forwardRef<UICarouselHandle, PropsWithChildren<Props>>(function UICarouselImpl(
  {
    gap,
    perview,
    loop,
    dragFree,
    startIndex,
    hideDots,
    vertical,
    scrollSnap,
    className,
    change,
    children,
  }: PropsWithChildren<Props>,
  ref: React.Ref<UICarouselHandle>
) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: loop ?? false,
    dragFree: dragFree ?? false,
    startIndex: startIndex ?? 0,
    axis: vertical ? 'y' : 'x',
  })

  const dotsNode = useRef<HTMLDivElement>(null)

  const addDotBtnsAndClickHandlers = useCallback(
    (dotsNode: HTMLElement): (() => string) => {
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
    },
    [emblaApi]
  )

  useEffect(() => {
    if (!hideDots) {
      if (dotsNode.current != null) addDotBtnsAndClickHandlers(dotsNode.current)
      emblaApi?.reInit()
    }
  }, [emblaApi, hideDots, addDotBtnsAndClickHandlers])

  useEffect(() => {
    if (!scrollSnap) return

    const handleSelect = (event: EmblaCarouselType) => {
      const index = event.selectedScrollSnap() || 0
      change?.(index)
    }
    const handlePointerUp = (event: EmblaCarouselType) => {
      const snaps: number[] = event.scrollSnapList()
      const progress: number = event.scrollProgress()
      let nearest = 0,
        best = Infinity
      snaps.forEach((p, i) => {
        const d = Math.abs(p - progress)
        if (d < best) {
          best = d
          nearest = i
        }
      })
      event.scrollTo(nearest)
    }
    emblaApi?.on('select', handleSelect)
    emblaApi?.on('pointerUp', handlePointerUp)
    return () => {
      emblaApi?.off('select', handleSelect)
      emblaApi?.off('pointerUp', handlePointerUp)
    }
  }, [emblaApi, scrollSnap, change])

  useImperativeHandle(
    ref,
    () => ({
      scrollTo: (index: number, jump?: boolean) => emblaApi?.scrollTo(index, jump),
    }),
    [emblaApi]
  )

  return (
    <CarouselContext.Provider
      value={{
        gap: gap ?? '0px',
        perview: perview ?? 1,
      }}>
      <div className={etcUtil.classNames(['embla', className])}>
        <div
          ref={emblaRef}
          className='embla-viewport'
          role='presentation'
          style={{ height: vertical ? '100%' : 'auto' }}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}>
          <div
            className='embla-container'
            style={{
              flexDirection: vertical ? 'column' : 'row',
              height: vertical ? `100%` : 'auto',
              marginLeft: `-${gap ?? '0px'}`,
            }}>
            {children}
          </div>
        </div>
        <div className='embla-controls'>
          {!hideDots && (
            <div
              ref={dotsNode}
              className='embla-dots'></div>
          )}
        </div>
      </div>
    </CarouselContext.Provider>
  )
})

export function UICarouselSlide(props: PropsWithChildren<{ className?: string }>) {
  const context = useContext(CarouselContext)

  const flex = context.perview === 'auto' ? '0 0 auto' : `0 0 ${100 / context.perview}%`

  return (
    <div
      className={etcUtil.classNames(['embla-slide', props.className])}
      style={{ flex, paddingLeft: context.gap }}
      {...props}>
      {props.children}
    </div>
  )
}
