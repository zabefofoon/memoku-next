import { TAG_COLORS } from '@/const'

export interface TodoWithChildren extends Todo {
  isExpanded?: boolean
  children?: Todo[]
}
export interface Todo {
  id: string
  description?: string
  tagId?: string
  created?: number
  modified?: number
  parentId?: string
  childId?: string
  start?: number
  end?: number
  images?: (string | Blob)[]
  status: 'created' | 'inprogress' | 'done' | 'hold'
  days?: WeekDay[]
  dirty?: boolean
  index?: number
}

export interface Setting {
  id?: number
  tags: Tag[]
}

export interface Tag {
  id: string
  color: keyof typeof TAG_COLORS
  label: string
  dirty?: boolean
  modified?: number
  index?: number
}

export interface GetTodosParams {
  tags?: string[]
  status?: Todo['status'][]
  sort?: 'recent' | 'created'
  searchText?: string
  page: number
}

export type WeekDay = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'

export interface ImageRow {
  id: string
  image: string | Blob
  todoId: string
}
