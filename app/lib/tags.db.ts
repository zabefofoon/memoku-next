import { db } from '@/app/lib/dexie.db'
import { TAG_COLORS } from '@/const'
import { Tag } from '../models/Todo'
import etcUtil from '../utils/etc.util'

export interface CreatedSeriesPoint {
  day: string
  created: number
}

export const tagsDB = {
  async getAllTags() {
    return db.tags.toArray()
  },
  async getTag(id: string) {
    const [res] = await db.tags.where({ id }).toArray()
    return res
  },
  addTag(tagInfo: { label: string; color: keyof typeof TAG_COLORS }): [string, number] {
    const id = etcUtil.generateUniqueId()
    const now = Date.now()
    db.tags.add({ ...tagInfo, id, modified: now, dirty: true })
    return [id, now]
  },
  async updateTag(id: string, tagInfo: { label: string; color: keyof typeof TAG_COLORS }) {
    const now = Date.now()
    await db.tags.update(id, { ...tagInfo, modified: Date.now(), dirty: true })
    return now
  },
  deleteTags(ids: string[]) {
    return db.tags.bulkDelete(ids)
  },
  updateIndex(id: string, index: number) {
    return db.tags.update(id, { index })
  },
  updateDirties(ids: string[], value: boolean) {
    return db.tags.bulkUpdate(ids.map((id) => ({ key: id, changes: { dirty: value } })))
  },
  getAllDirtyTags() {
    return db.tags.filter(({ dirty }) => Boolean(dirty) || dirty == null).toArray()
  },
  getMetas() {
    return db.tags.toArray((tag) => tag.map(({ id, modified }) => ({ id, modified })))
  },
  addNewTagBulk(tags: Tag[]) {
    return db.tags.bulkPut(tags)
  },
}
