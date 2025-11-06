import { create } from 'zustand'
import { db } from '../lib/dexie.db'
import etcUtil from '../utils/etc.util'

export const useImagesStore = create(() => {
  const getImages = (todoId: string) => {
    return db.images.where('todoId').equals(todoId).reverse().toArray()
  }

  const postImage = (todoId: string, blob: Blob): Promise<string> => {
    return db.images.add({ id: etcUtil.generateUniqueId(), todoId, image: blob })
  }

  const deleteImage = (id: string): Promise<number> => {
    return db.images.where('id').equals(id).delete()
  }

  return {
    getImages,
    postImage,
    deleteImage,
  }
})
