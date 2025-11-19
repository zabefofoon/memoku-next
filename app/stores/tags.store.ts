import { db } from '@/app/lib/dexie.db'
import { Tag } from '@/app/models/Todo'
import { TAG_COLORS } from '@/const'
import { create } from 'zustand'
import etcUtil from '../utils/etc.util'

interface TagsStore {
  tags: Tag[]
  tagsMap: Record<string, Tag>
  getTag: (id: string) => Promise<Tag | undefined>
  initTags: () => void
  getTagsById: (id?: string) => Tag | undefined
  deleteTags: (ids: string[]) => Promise<void>
  addTag: (tagInfo: { label: string; color: keyof typeof TAG_COLORS }) => Promise<[string, number]>
  updateTag: (
    id: string,
    tagInfo: { label: string; color: keyof typeof TAG_COLORS }
  ) => Promise<number>
  getAllDirtyTags: () => Promise<Tag[]>
  updateIndex: (id: string, index: number) => Promise<number>
  updateDirties: (ids: string[], value: boolean) => Promise<number>
  getMetas: () => Promise<{ id: string; modified?: number }[]>
  addNewTagBulk: (tags: Tag[]) => Promise<number>
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

  const getTag = async (id: string): Promise<Tag | undefined> => {
    const [res] = await db.tags.where({ id }).toArray()
    return res
  }

  const addTag = async (tagInfo: {
    label: string
    color: keyof typeof TAG_COLORS
  }): Promise<[string, number]> => {
    const id = etcUtil.generateUniqueId()
    const now = Date.now()
    db.tags.add({ ...tagInfo, id, modified: now, dirty: true })
    return [id, now]
  }

  const updateTag = async (
    id: string,
    tagInfo: { label: string; color: keyof typeof TAG_COLORS }
  ): Promise<number> => {
    const now = Date.now()
    await db.tags.update(id, { ...tagInfo, modified: Date.now(), dirty: true })
    return now
  }

  const deleteTags = async (ids: string[]): Promise<void> => {
    await db.tags.bulkDelete(ids)
    initTags()
  }

  const updateIndex = async (id: string, index: number): Promise<number> => {
    return db.tags.update(id, { index })
  }

  const updateDirties = async (ids: string[], value: boolean): Promise<number> => {
    return db.tags.bulkUpdate(ids.map((id) => ({ key: id, changes: { dirty: value } })))
  }

  const getAllDirtyTags = (): Promise<Tag[]> => {
    return db.tags.filter(({ dirty }) => Boolean(dirty) || dirty == null).toArray()
  }

  const getMetas = async (): Promise<{ id: string; modified?: number }[]> => {
    return db.tags.toArray((tag) => tag.map(({ id, modified }) => ({ id, modified })))
  }

  const addNewTagBulk = (tags: Tag[]): Promise<number> => {
    return db.tags.bulkPut(tags)
  }

  return {
    getTag,
    tags,
    tagsMap,
    initTags,
    getTagsById,
    deleteTags,
    addTag,
    updateTag,
    getAllDirtyTags,
    updateIndex,
    updateDirties,
    getMetas,
    addNewTagBulk,
  }
})
