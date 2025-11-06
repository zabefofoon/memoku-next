'use client'

import { useParams, useSearchParams } from 'next/navigation'
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
  const params = useParams()
  const imagesStore = useImagesStore()

  const [images, setImages] = useState<string[]>()
  const [startIndex, setStartIndex] = useState<number>()

  const loadImages = async (): Promise<void> => {
    const id = params.id

    if (!id) return
    const res = await imagesStore.getImages(id.toString())
    const imageUrls = await Promise.all(res.map((item) => etcUtil.blobToBase64(item.image)))
    setImages(imageUrls)

    const imagesQuery = searchParams.get('images')
    const index = imagesQuery ? +imagesQuery : 0
    setStartIndex(index)
  }

  useEffect(() => {
    if (searchParams.get('images')) loadImages()
  }, [searchParams])

  return (
    <UIModal
      open={props.isShow ?? false}
      close={() => props.close()}
      content={() => (
        <div className='sm:w-[1024px]'>
          <UICarousel startIndex={startIndex}>
            {images?.map((image, index) => (
              <UICarouselSlide key={index}>
                <img
                  className='w-full sm:max-w-[992px] h-[80dvh] sm:h-[50dvh] aspect-square object-contain'
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
