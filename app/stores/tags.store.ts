import { Tag } from '@/app/models/Todo'
import { create } from 'zustand'
import { tagsDB } from '../lib/tags.db'

interface TagsStore {
  tags: Tag[]
  tagsMap: Record<string, Tag>
  initTags: () => void
  getTagsById: (id?: string) => Tag | undefined
  deleteTags: (ids: string[]) => Promise<void>
}

export const useTagsStore = create<TagsStore>((set, get) => {
  const tags: Tag[] = []
  const tagsMap: Record<string, Tag> = {}

  const initTags = async (): Promise<void> => {
    const tags = await tagsDB.getAllTags()

    const map = tags.reduce<Record<string, Tag>>((acc, current) => {
      acc[current.id] = current
      return acc
    }, {})

    set({ tags, tagsMap: map })
  }

  const getTagsById = (id?: string): Tag | undefined => (id ? get().tagsMap[id] : undefined)

  const deleteTags = async (ids: string[]): Promise<void> => {
    await tagsDB.deleteTags(ids)
    initTags()
  }

  return {
    tags,
    tagsMap,
    initTags,
    getTagsById,
    deleteTags,
  }
})
