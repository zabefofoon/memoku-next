'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Todo } from '../models/Todo'
import { Icon } from './Icon'
import { TodosDeleteModal } from './TodosDeleteModal'

interface Props {
  todo?: Todo
  images?: { id?: string; image: string; todoId: string }[]
  addImage: (file: Blob) => Promise<void>
  deleteImage: () => Promise<void>
}

export function TodosImages(props: Props) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const fileInputEl = useRef<HTMLInputElement>(null)

  const [isShowDeleteModal, setIsShowDeleteModal] = useState<boolean>(false)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(event.target.files ?? [])

    if (files.length > 5) {
      alert('이미지는 최대 5개까지만 등록 가능합니다.')
      event.target.value = ''
      return
    }

    for (const index in files) await props.addImage(files[index])
  }

  useEffect(() => {
    if (pathname.endsWith(`${props.todo?.id}`)) {
      setIsShowDeleteModal(!!searchParams.get('image'))
    }
  }, [searchParams])

  return (
    <div className='sm:h-full overflow-y-hidden sm:overflow-y-auto sm:overflow-x-hidden | flex sm:flex-col gap-[12px]'>
      <TodosDeleteModal
        isShow={isShowDeleteModal}
        close={() => router.back()}
        delete={props.deleteImage}
      />
      <input
        accept='image/*'
        ref={fileInputEl}
        type='file'
        multiple
        hidden
        onChange={handleFileChange}
      />
      {props.images && props.images.length < 5 && (
        <button
          type='button'
          className='shrink-0 w-[120px] sm:w-[220px] aspect-square | flex flex-col items-center justify-center gap-[6px] | rounded-lg bg-white dark:bg-zinc-800 shadow-md'
          onClick={() => fileInputEl.current?.click()}>
          <span className='bg-slate-100 dark:bg-zinc-700 | rounded-full p-[8px]'>
            <Icon name='image' />
          </span>
          <p className='text-[12px] sm:text-[13px] opacity-70'>이미지 추가</p>
        </button>
      )}
      {props.images?.map((image, index) => (
        <div
          key={image.id}
          className='relative | w-[120px] sm:w-[220px] aspect-square overflow-hidden shrink-0 | rounded-lg shadow-md'>
          <Link href={`?images=${index}`}>
            <img
              className='w-full h-full object-cover | bg-white dark:bg-zinc-800'
              src={image.image}
              alt=''
            />
          </Link>
          <Link
            href={`?image=${image.id}`}
            className='absolute right-[6px] top-[6px] | p-[2px] | bg-gray-100 dark:bg-zinc-600 rounded-full'>
            <Icon
              name='close'
              className='text-[14px]'
            />
          </Link>
        </div>
      ))}
    </div>
  )
}
