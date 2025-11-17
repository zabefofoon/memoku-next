import { create } from 'zustand'
import { db } from '../lib/dexie.db'
import etcUtil from '../utils/etc.util'

export const useImagesStore = create(() => {
  const getImages = (todoId: string) => {
    return db.images.where('todoId').equals(todoId).reverse().toArray()
  }

  const postImages = async (
    todoId: string,
    blobs: Blob[]
  ): Promise<{ id: string; todoId: string; image: Blob }[]> => {
    const items = blobs.map((image) => ({ id: etcUtil.generateUniqueId(), todoId, image }))
    await db.images.bulkAdd(items)
    return items
  }

  const deleteImages = (ids: string[]): Promise<void> => {
    return db.images.bulkDelete(ids)
  }

  return {
    getImages,
    postImages,
    deleteImages,
  }
})
