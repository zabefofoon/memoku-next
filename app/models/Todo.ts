import { TAG_COLORS } from '@/const'

export interface Todo {
  id?: number
  description?: string
  tagId?: string
  created?: number
  modified?: number
  parentId?: number
  start?: number
  end?: number
  images?: (string | Blob)[]
  linked?: 'google'
  status: 'created' | 'inprogress' | 'done'
}

export interface Setting {
  id?: number
  tags: Tag[]
}

export interface Tag {
  id: string
  color: keyof typeof TAG_COLORS
  label: string
  excludeUpload: boolean
}
