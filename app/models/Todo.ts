import { TAG_COLORS } from '@/const'

export interface Todo {
  id?: number
  description?: string
  tagId?: string
  created?: number
  modified?: number
  parentId?: number
  childId?: number
  start?: number
  end?: number
  images?: (string | Blob)[]
  linked?: 'google'
  status: 'created' | 'inprogress' | 'done' | 'hold'
  days?: WeekDay[]
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

export interface GetTodosParams {
  tags?: string[]
  status?: string
  searchText?: string
}

export type WeekDay = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
