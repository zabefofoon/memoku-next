import { db } from '@/app/lib/dexie.db'
import { Tag } from '@/app/models/Todo'
import { create } from 'zustand'

interface TagsStore {
  tags: Tag[]
  tagsMap: Record<string, Tag>
  initTags: () => void
  getTagsById: (id?: string) => Tag | undefined
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

  return {
    tags,
    tagsMap,
    initTags,
    getTagsById,
  }
})
