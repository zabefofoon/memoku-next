export interface Todo {
  id?: number
  upto?: boolean
  date?: string
  description?: string
  tagId?: string
  time?: string
  created?: number
  done?: boolean
  modified?: number
  images?: (string | Blob)[]
  linked?: 'google'
  parentId?: number
}

export interface Setting {
  id?: number
  tags: Tag[]
}

export interface Tag {
  id: string
  color: string
  label: string
  excludeUpload: boolean
}
