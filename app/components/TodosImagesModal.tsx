'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useImagesStore } from '../stores/images.store'
import etcUtil from '../utils/etc.util'
import UICarousel, { UICarouselSlide } from './UICarousel'
import UIModal from './UIModal'

interface Props {
  isShow?: boolean
  close: () => void
}

export default function TodosImagesModal(props: Props) {
  const searchParams = useSearchParams()
  const imagesStore = useImagesStore()

  const [images, setImages] = useState<string[]>()

  const loadImages = async (): Promise<void> => {
    const query = searchParams.get('images')
    if (!query || isNaN(+query)) return
    const res = await imagesStore.getImages(+query)
    const imageUrls = await Promise.all(res.map((item) => etcUtil.blobToBase64(item.image)))
    setImages(imageUrls)
  }

  useEffect(() => {
    loadImages()
  }, [searchParams])

  return (
    <UIModal
      open={props.isShow ?? false}
      close={() => props.close()}
      content={() => (
        <div className='sm:w-[1024px]'>
          <UICarousel>
            {images?.map((image, index) => (
              <UICarouselSlide key={index}>
                <img
                  className='w-full h-[80dvh] sm:h-[50dvh] aspect-square object-contain'
                  src={image}
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
