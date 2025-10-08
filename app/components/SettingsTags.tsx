'use client'

import { TAG_COLORS } from '@/const'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Tag } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { Icon } from './Icon'
import { SettingsTagModal } from './SettingsTagModal'
import TagBadge from './TagBadge'
import { TodosDeleteModal } from './TodosDeleteModal'

export default function SettingsTags() {
  const router = useRouter()
  const tagsStore = useTagsStore()

  const searchParams = useSearchParams()

  const [tags, setTags] = useState<Tag[]>()
  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false)
  const [isShowTagModal, setIsShowTagModal] = useState(false)

  const deleteTag = (): void => {
    const tagId = searchParams.get('delete')
    if (tagId) tagsStore.deleteTag(tagId)
    router.back()
  }

  const handleTagDone = async (tagInfo: {
    label: string
    color: keyof typeof TAG_COLORS
  }): Promise<void> => {
    const tagQuery = searchParams.get('tag')
    if (tagQuery === 'new') await tagsStore.addTag(tagInfo)
    else if (!!tagQuery) await tagsStore.updateTag(tagQuery, tagInfo)
    tagsStore.initTags()
    router.back()
  }

  useEffect(() => {
    setTags(tagsStore.tags)
  }, [tagsStore.tags])

  useEffect(() => {
    setIsShowDeleteModal(!!searchParams.get('delete'))
    setIsShowTagModal(!!searchParams.get('tag'))
  }, [searchParams])

  return (
    <div className='w-full | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[16px]'>
      <TodosDeleteModal
        isShow={isShowDeleteModal}
        close={router.back}
        delete={deleteTag}
      />
      <SettingsTagModal
        isShow={isShowTagModal}
        close={router.back}
        done={handleTagDone}
      />
      <div className='flex items-start flex-col lg:flex-row gap-[12px] lg:gap-[24px]'>
        <p className='text-[15px] font-[700] | shrink-0 | lg:py-[8px] | w-[100px]'>태그</p>
        <div className='flex items-center gap-[6px] flex-wrap'>
          {tags && (
            <>
              {tags?.map((tag) => (
                <div
                  key={tag.id}
                  className='relative'>
                  <TagBadge
                    id={tag.id}
                    click={(tag) => router.push(`?tag=${tag?.id}`)}
                  />
                  <Link
                    className='absolute top-0 right-0 translate-x-[4px] -translate-y-[4px] | bg-gray-100 dark:bg-zinc-700 rounded-full p-[2px]'
                    href={`?delete=${tag.id}`}>
                    <Icon
                      name='delete'
                      className='text-[16px]'
                    />
                  </Link>
                </div>
              ))}
              <TagBadge />
            </>
          )}
          <Link
            className='w-[36px] aspect-square | border border-dashed rounded-full border-slate-400 dark:border-zinc-500 | flex items-center justify-center'
            href='?tag=new'>
            <Icon name='plus' />
          </Link>
        </div>
      </div>
    </div>
  )
}
