export interface Todo {
  id?: string
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
  createdDate?: string
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
