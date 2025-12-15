'use client'

import { TAG_COLORS } from '@/const'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Tag } from '../models/Todo'
import { useSheetStore } from '../stores/sheet.store'
import { useTagsStore } from '../stores/tags.store'
import { Icon } from './Icon'
import { SettingsTagModal } from './SettingsTagModal'
import TagBadge from './TagBadge'
import { TodosDeleteModal } from './TodosDeleteModal'

export default function SettingsTags() {
  const router = useRouter()
  const initTags = useTagsStore((s) => s.initTags)
  const allTags = useTagsStore((s) => s.tags)
  const getTag = useTagsStore((s) => s.getTag)
  const addTag = useTagsStore((s) => s.addTag)
  const updateTag = useTagsStore((s) => s.updateTag)
  const updateIndex = useTagsStore((s) => s.updateIndex)
  const updateDirties = useTagsStore((s) => s.updateDirties)
  const deleteTags = useTagsStore((s) => s.deleteTags)
  const fileId = useSheetStore((s) => s.fileId)

  const searchParams = useSearchParams()

  const [tags, setTags] = useState<Tag[]>()
  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false)
  const [isShowTagModal, setIsShowTagModal] = useState(false)

  const deleteTag = async (): Promise<void> => {
    const tagId = searchParams.get('delete')
    if (!tagId) return
    if (fileId) {
      const currentTag = await getTag(tagId)
      if (currentTag == null) return

      const res = await fetch(
        `/api/sheet/google/tag?fileId=${fileId}&index=${currentTag?.index}&deleted=${true}&modified=${Date.now()}`,
        { method: 'PATCH' }
      )
      const result = await res.json()
      if (result) deleteTags([tagId])
    } else deleteTags([tagId])
    router.back()
  }

  const handleTagDone = async (tagInfo: {
    label: string
    color: keyof typeof TAG_COLORS
  }): Promise<void> => {
    router.back()

    const tagQuery = searchParams.get('tag')
    if (fileId) {
      if (tagQuery === 'new') {
        const [id, now] = await addTag(tagInfo)
        const res = await fetch(
          `/api/sheet/google/tag?fileId=${fileId}&id=${id}&color=${tagInfo.color}&label=${tagInfo.label}&modified=${now}`,
          { method: 'POST' }
        )
        const result = await res.json()
        updateIndex(id, result.index)
        updateDirties([id], false)
      } else if (!!tagQuery) {
        const currentTag = await getTag(tagQuery)
        if (currentTag == null) return
        const now = await updateTag(tagQuery, tagInfo)
        const res = await fetch(
          `/api/sheet/google/tag?fileId=${fileId}&color=${tagInfo.color}&label=${tagInfo.label}&index=${currentTag?.index}&modified=${now}`,
          { method: 'PATCH' }
        )
        const result = await res.json()
        if (result.ok) updateDirties([tagQuery], false)
      }
    } else {
      if (tagQuery === 'new') await addTag(tagInfo)
      else if (!!tagQuery) await updateTag(tagQuery, tagInfo)
    }

    initTags()
  }

  useEffect(() => {
    setTags(allTags)
  }, [allTags])

  useEffect(() => {
    setIsShowDeleteModal(!!searchParams.get('delete'))
    setIsShowTagModal(!!searchParams.get('tag'))
  }, [searchParams])

  return (
    <div className='w-full | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[16px]'>
      <TodosDeleteModal
        isShow={isShowDeleteModal}
        close={router.back}
        done={deleteTag}
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
                    className='absolute z-[1] top-0 right-0 translate-x-[4px] -translate-y-[4px] | bg-gray-50 dark:bg-zinc-700 rounded-full p-[2px]'
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
