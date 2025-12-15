'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ImageRow } from '../models/Todo'
import UICarousel, { UICarouselSlide } from './UICarousel'
import UIModal from './UIModal'

interface Props {
  images?: ImageRow[]
  isShow?: boolean
  close: () => void
}

export default function TodosImagesModal({ images, isShow, close }: Props) {
  const searchParams = useSearchParams()

  const [startIndex, setStartIndex] = useState<number>()

  useEffect(() => {
    const imagesQuery = searchParams.get('images')
    const index = imagesQuery ? +imagesQuery : 0
    setStartIndex(index)
  }, [searchParams])

  return (
    <UIModal
      open={isShow ?? false}
      close={() => close()}
      content={() => (
        <div className='sm:w-[1024px]'>
          <UICarousel startIndex={startIndex}>
            {images?.map((image, index) => (
              <UICarouselSlide key={index}>
                <img
                  className='w-full sm:max-w-[992px] h-[80dvh] sm:h-[50dvh] aspect-square object-contain'
                  src={image.image}
                  alt=''
                />
              </UICarouselSlide>
            ))}
          </UICarousel>
        </div>
      )}
    />
  )
}
