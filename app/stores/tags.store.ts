import { db } from '@/app/lib/dexie.db'
import { Tag } from '@/app/models/Todo'
import { TAG_COLORS } from '@/const'
import { create } from 'zustand'
import etcUtil from '../utils/etc.util'

interface TagsStore {
  tags: Tag[]
  tagsMap: Record<string, Tag>
  initTags: () => void
  getTagsById: (id?: string) => Tag | undefined
  deleteTag: (id: string) => Promise<void>
  addTag: (tagInfo: { label: string; color: keyof typeof TAG_COLORS }) => Promise<string>
  updateTag: (
    id: string,
    tagInfo: { label: string; color: keyof typeof TAG_COLORS }
  ) => Promise<number>
}

export const useTagsStore = create<TagsStore>((set, get) => {
  const tags: Tag[] = []
  const tagsMap: Record<string, Tag> = {}

  const initTags = async (): Promise<void> => {
    const tags = await db.tags.toArray()

    const map = tags.reduce<Record<string, Tag>>((acc, current) => {
      acc[current.id] = current
      return acc
    }, {})

    set({ tags, tagsMap: map })
  }

  const getTagsById = (id?: string): Tag | undefined => (id ? get().tagsMap[id] : undefined)

  const addTag = async (tagInfo: {
    label: string
    color: keyof typeof TAG_COLORS
  }): Promise<string> => {
    return db.tags.add({ ...tagInfo, id: etcUtil.generateUniqueId(), excludeUpload: false })
  }

  const updateTag = async (
    id: string,
    tagInfo: { label: string; color: keyof typeof TAG_COLORS }
  ): Promise<number> => {
    return db.tags.update(id, tagInfo)
  }

  const deleteTag = async (id: string): Promise<void> => {
    await db.tags.where({ id }).delete()
    initTags()
  }

  return {
    tags,
    tagsMap,
    initTags,
    getTagsById,
    deleteTag,
    addTag,
    updateTag,
  }
})
