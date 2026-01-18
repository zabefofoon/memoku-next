import { db } from '@/app/lib/dexie.db'
import etcUtil from '../utils/etc.util'

export interface CreatedSeriesPoint {
  day: string
  created: number
}

export const imagesDB = {
  getAllImages() {
    return db.images.toArray()
  },

  getImages(todoId: string) {
    return db.images.where('todoId').equals(todoId).reverse().toArray()
  },

  async postImages(todoId: string, blobs: Blob[]) {
    const items = blobs.map((image) => ({ id: etcUtil.generateUniqueId(), todoId, image }))
    await db.images.bulkAdd(items)
    return items
  },

  deleteImages(ids: string[]) {
    return db.images.bulkDelete(ids)
  },
}
