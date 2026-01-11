'use client'

import { Link } from '@/app/components/Link'

import { produce } from 'immer'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'
import { ChangeEvent, SyntheticEvent, useEffect, useRef, useState } from 'react'
import { Else, If, Then } from 'react-if'
import { useTodosDetailStore } from '../stores/todosDetail.store'
import { Icon } from './Icon'
import { TodosDeleteModal } from './TodosDeleteModal'
import UISpinner from './UISpinner'

export function TodosImages() {
  const todo = useTodosDetailStore((s) => s.todo)
  const images = useTodosDetailStore((s) => s.images)
  const deleteImage = useTodosDetailStore((s) => s.deleteImage)
  const addImages = useTodosDetailStore((s) => s.addImages)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const fileInputEl = useRef<HTMLInputElement>(null)

  const [isShowDeleteModal, setIsShowDeleteModal] = useState<boolean>(false)

  const isUploading = images?.find(({ id }) => id === 'uploading')
  const [sizes, setImages] = useState<{ width: number; height: number }[]>([])

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(event.target.files ?? [])
    if (files.length <= 5) addImages(files)

    event.target.value = ''
  }

  const handleImageLoad = (index: number, event: SyntheticEvent<HTMLImageElement>) => {
    const target = event.nativeEvent.target as HTMLImageElement
    setImages((prev) =>
      produce(prev, (draft) => {
        draft[index] = {
          width: target.naturalWidth,
          height: target.naturalHeight,
        }
      })
    )
  }

  useEffect(() => {
    if (pathname.endsWith(`${todo?.id}`)) {
      setIsShowDeleteModal(!!searchParams.get('image'))
    }
  }, [pathname, todo?.id, searchParams])

  useEffect(() => {
    let lightbox: PhotoSwipeLightbox | undefined = new PhotoSwipeLightbox({
      gallery: '#gallery',
      children: 'a',
      pswpModule: () => import('photoswipe'),
    })
    lightbox.init()

    return () => {
      lightbox?.destroy()
      lightbox = undefined
    }
  }, [])

  return (
    <div className='shrink-0 sm:h-full | overflow-y-hidden sm:overflow-y-auto sm:overflow-x-hidden | flex sm:flex-col gap-[12px]'>
      <TodosDeleteModal
        isShow={isShowDeleteModal}
        close={() => router.back()}
        done={() => deleteImage(searchParams.get('image') ?? '', router.back)}
      />
      <input
        accept='image/*'
        ref={fileInputEl}
        type='file'
        multiple
        hidden
        onChange={handleFileChange}
      />
      <If condition={images && images.length < 5}>
        <Then>
          <button
            type='button'
            className='shrink-0 | emboss-sheet | w-[120px] sm:w-[220px] aspect-square | flex flex-col items-center justify-center gap-[6px]'
            onClick={() => !isUploading && fileInputEl.current?.click()}>
            <If condition={!!isUploading}>
              <Then>
                <UISpinner />
                <p className='text-[12px] sm:text-[13px] opacity-70'>업로드 중</p>
              </Then>
              <Else>
                <span className='bg-slate-100 dark:bg-zinc-700 | rounded-full p-[8px]'>
                  <Icon name='image' />
                </span>
                <p className='text-[12px] sm:text-[13px] opacity-70'>이미지 추가</p>
              </Else>
            </If>
          </button>
        </Then>
      </If>

      <div
        id='gallery'
        className='pswp-gallery | flex sm:flex-col gap-[12px]'>
        {images?.map((image, index) => (
          <div
            key={`gallery-${index}`}
            className='emboss-sheet'>
            <div className='relative | w-[120px] sm:w-[220px] aspect-square overflow-hidden shrink-0 | rounded-lg shadow-md'>
              <Link
                href={typeof image.image === 'string' ? image.image : ''}
                data-pswp-width={sizes[index]?.width}
                data-pswp-height={sizes[index]?.height}
                target='_blank'
                rel='noreferrer'>
                <img
                  className='w-full h-full object-cover | bg-white dark:bg-zinc-800'
                  src={image.image}
                  alt=''
                  onLoad={(event) => handleImageLoad(index, event)}
                />
              </Link>
              <If condition={image.id !== 'uploading'}>
                <Then>
                  <button
                    type='button'
                    className='expand-hitbox | !absolute right-[6px] top-[6px] | p-[2px] | bg-gray-50 dark:bg-zinc-600 rounded-full'
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      router.push(`?image=${index}`)
                    }}>
                    <Icon
                      name='close'
                      className='text-[14px]'
                    />
                  </button>
                </Then>
              </If>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
