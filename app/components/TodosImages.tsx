'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
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

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(event.target.files ?? [])
    if (files.length <= 5) addImages(files)

    event.target.value = ''
  }

  useEffect(() => {
    if (pathname.endsWith(`${todo?.id}`)) {
      setIsShowDeleteModal(!!searchParams.get('image'))
    }
  }, [pathname, todo?.id, searchParams])

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
          <div className='emboss-sheet'>
            <button
              type='button'
              className='shrink-0 w-[120px] sm:w-[220px] aspect-square | flex flex-col items-center justify-center gap-[6px]'
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
          </div>
        </Then>
      </If>

      {images?.map((image, index) => (
        <div
          className='emboss-sheet'
          key={index}>
          <div className='relative | w-[120px] sm:w-[220px] aspect-square overflow-hidden shrink-0 | rounded-lg shadow-md'>
            <Link href={`?images=${index}`}>
              <img
                className='w-full h-full object-cover | bg-white dark:bg-zinc-800'
                src={image.image}
                alt=''
              />
            </Link>
            <If condition={image.id !== 'uploading'}>
              <Then>
                <Link
                  href={`?image=${index}`}
                  className='absolute right-[6px] top-[6px] | p-[2px] | bg-gray-50 dark:bg-zinc-600 rounded-full'>
                  <Icon
                    name='close'
                    className='text-[14px]'
                  />
                </Link>
              </Then>
            </If>
          </div>
        </div>
      ))}
    </div>
  )
}
