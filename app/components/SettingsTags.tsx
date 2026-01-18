'use client'

import { Link } from '@/app/components/Link'
import { TAG_COLORS } from '@/const'

import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { tagsDB } from '../lib/tags.db'
import { Tag } from '../models/Todo'
import { useSheetStore } from '../stores/sheet.store'
import { useTagsStore } from '../stores/tags.store'
import { Icon } from './Icon'
import { SettingsTagModal } from './SettingsTagModal'
import { TodosDeleteModal } from './TodosDeleteModal'

export default function SettingsTags() {
  const t = useTranslations()
  const router = useRouter()
  const initTags = useTagsStore((s) => s.initTags)
  const allTags = useTagsStore((s) => s.tags)

  const deleteTags = useTagsStore((s) => s.deleteTags)
  const fileId = useSheetStore((s) => s.fileId)

  const searchParams = useSearchParams()

  const [tags, setTags] = useState<Tag[]>()

  const deleteTag = async (): Promise<void> => {
    const tagId = searchParams.get('delete')
    if (!tagId) return
    if (fileId) {
      const currentTag = await tagsDB.getTag(tagId)
      if (currentTag == null) return

      const res = await api.patchSheetGoogleTag(fileId, {
        index: currentTag?.index ?? 0,
        deleted: true,
        now: Date.now(),
      })
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
        const [id, now] = tagsDB.addTag(tagInfo)
        const res = await api.postSheetGoogleTag(fileId, id, tagInfo.color, tagInfo.label, now)
        const result = await res.json()
        tagsDB.updateIndex(id, result.index)
        tagsDB.updateDirties([id], false)
      } else if (!!tagQuery) {
        const currentTag = await tagsDB.getTag(tagQuery)
        if (currentTag == null) return
        const now = await tagsDB.updateTag(tagQuery, tagInfo)
        const res = await api.patchSheetGoogleTag(fileId, {
          color: tagInfo.color,
          label: tagInfo.label,
          index: currentTag?.index ?? 0,
          now,
        })

        const result = await res.json()
        if (result.ok) tagsDB.updateDirties([tagQuery], false)
      }
    } else {
      if (tagQuery === 'new') tagsDB.addTag(tagInfo)
      else if (!!tagQuery) await tagsDB.updateTag(tagQuery, tagInfo)
    }

    initTags()
  }

  useEffect(() => {
    setTags(allTags)
  }, [allTags])

  return (
    <div className='emboss-sheet | p-[16px]'>
      <TodosDeleteModal
        isShow={!!searchParams.get('delete')}
        close={router.back}
        done={deleteTag}
      />
      <SettingsTagModal
        isShow={!!searchParams.get('tag')}
        close={router.back}
        done={handleTagDone}
      />
      <div className='flex items-start flex-col lg:flex-row gap-[12px] lg:gap-[24px]'>
        <p className='text-[14px] font-[700] | shrink-0 | lg:py-[8px] | w-[100px]'>
          {t('Settings.Tag')}
        </p>

        <div className='flex flex-wrap gap-[8px] | my-auto'>
          {tags?.map((tag) => (
            <button
              key={tag.id}
              type='button'
              className='neu-button'
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()

                const urlParams = new URLSearchParams(searchParams.toString())
                urlParams.append('tag', tag.id)
                router.push(`?${decodeURIComponent(urlParams.toString())}`, {
                  scroll: false,
                })
              }}>
              <Icon
                name='tag-active'
                className='text-[11px] translate-y-[1px]'
                style={{
                  color: tag
                    ? TAG_COLORS[tag.color]?.white || 'var(--color-slate-500)'
                    : 'var(--color-slate-500)',
                }}
              />
              <p>{tag?.label ?? 'MEMO'}</p>

              <Link
                className='p-[2px]'
                href={`?delete=${tag.id}`}
                onClick={(event) => event.stopPropagation()}>
                <Icon
                  name='delete'
                  className='text-[14px]'
                />
              </Link>
            </button>
          ))}
          <Link
            href='?tag=new'
            className='pl-[12px] pr-[6px] py-[6px] | border border-dashed rounded-full border-slate-400 dark:border-zinc-600 | flex items-center justify-center gap-[4px]'>
            <p className='text-[12px] text-gray-600 dark:text-gray-200'>{t('Settings.TagNew')}</p>
            <Icon name='plus' />
          </Link>
        </div>
      </div>
    </div>
  )
}
