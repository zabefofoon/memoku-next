import { create } from 'zustand'
import { db } from '../lib/dexie.db'

export const useImagesStore = create(() => {
  const getImages = (todoId: number) => {
    return db.images.where('todoId').equals(todoId).reverse().toArray()
  }

  const postImage = (todoId: number, blob: Blob): Promise<number> => {
    return db.images.add({ todoId, image: blob })
  }

  const deleteImage = (id: number): Promise<number> => {
    return db.images.where('id').equals(id).delete()
  }

  return {
    getImages,
    postImage,
    deleteImage,
  }
})
