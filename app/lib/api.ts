import { RegistAlarmParams } from '../models/Alarm'
import { Tag, Todo } from '../models/Todo'

export const api = {
  getAuthGoogleMe() {
    return fetch(`/api/auth/google/me`, {
      method: 'GET',
      credentials: 'include',
    })
  },
  postSheetGoogleBulkTags(fileId: string, tags: Tag[]) {
    return fetch('/api/sheet/google/bulk/tags', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ fileId, tags }),
    })
  },
  postSheetGoogleBulk(fileId: string, todos: Todo[]) {
    return fetch('/api/sheet/google/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, todos }),
    })
  },
  getSheetGoogleMeta(fileId: string, start: number, end: number) {
    return fetch(`/api/sheet/google/meta?fileId=${fileId}&start=${start}&end=${end}`, {
      method: 'GET',
    })
  },
  postSheetGoogleMeta(fileId: string, meta: { id: string; index: number }[]) {
    return fetch(`/api/sheet/google/meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, meta }),
    })
  },
  getSheetGoogleSheetId() {
    return fetch(`/api/sheet/google/sheetId`, {
      method: 'GET',
      credentials: 'include',
    })
  },
  getSheetGoogleMetaTags(fileId: string) {
    return fetch(`/api/sheet/google/meta/tags?fileId=${fileId}`, {
      method: 'GET',
    })
  },
  postSheetGoogleMetaTags(fileId: string, meta: { id: string; index: number }[]) {
    return fetch(`/api/sheet/google/meta/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, meta }),
    })
  },
  getUploadGoogleImage() {
    return fetch('/api/upload/google/image')
  },
  postAuthGoogleLogout() {
    return fetch('/api/auth/google/logout', { method: 'POST' })
  },
  postSheetGoogleTodo(
    fileId: string,
    body: {
      id: string
      created?: number
      modified?: number
      parent?: string
      tag?: string
    }
  ) {
    return fetch(`/api/sheet/google/todo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, ...body }),
    })
  },

  patchSheetGoogleTodo(
    fileId: string,
    body: {
      index?: number
      tag?: string
      modified?: number
      status?: string
      start?: number
      end?: number
      days?: string
      description?: string
      images?: string
      parent?: string
      child?: string
      deleted?: boolean
    }
  ) {
    return fetch(`/api/sheet/google/todo`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, ...body }),
    })
  },

  postUploadGoogleImage(formData: FormData) {
    return fetch('/api/upload/google/image', {
      method: 'POST',
      body: formData,
    })
  },

  deleteUploadGoogleImage(imageIds: string) {
    return fetch(`/api/upload/google/image?image_ids=${imageIds}`, {
      method: 'DELETE',
    })
  },

  patchSheetGoogleTag(
    fileId: string,
    body: {
      index: number
      now: number
      color?: string
      label?: string
      deleted?: boolean
    }
  ) {
    return fetch(`/api/sheet/google/tag`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, ...body }),
    })
  },

  postSheetGoogleTag(fileId: string, id: string, color: string, label: string, now: number) {
    return fetch(`/api/sheet/google/tag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, id, color, label, now }),
    })
  },

  postAlarmSubscribe(subscription: PushSubscription, device_id: string) {
    return fetch(`/api/alarm/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        subscription,
        device_id,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    })
  },

  deleteAlarmSubscribe(device_id: string) {
    return fetch(`/api/alarm/subscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ device_id }),
    })
  },

  registAlarm(params: RegistAlarmParams) {
    return fetch(`/api/alarm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ params }),
    })
  },
}
