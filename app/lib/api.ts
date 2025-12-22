export const api = {
  postSheetGoogleTodo(
    fileId: string,
    searchParams: {
      id: string
      created?: number
      modified?: number
      parent?: string
    }
  ) {
    const init = { fileId, ...searchParams } as unknown as Record<string, string>
    const params = new URLSearchParams(init)
    return fetch(`/api/sheet/google/todo?${decodeURIComponent(params.toString())}`, {
      method: 'POST',
    })
  },

  patchSheetGoogleTodo(
    fileId: string,
    searchParams: {
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
    const init = { fileId, ...searchParams } as unknown as Record<string, string>
    const params = new URLSearchParams(init)
    return fetch(`/api/sheet/google/todo?${decodeURIComponent(params.toString())}`, {
      method: 'PATCH',
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
    searchParams: {
      index: number
      now: number
      color?: string
      label?: string
      deleted?: boolean
    }
  ) {
    const init = { fileId, ...searchParams } as unknown as Record<string, string>
    const params = new URLSearchParams(init)
    return fetch(`/api/sheet/google/tag?${decodeURIComponent(params.toString())}`, {
      method: 'PATCH',
    })
  },

  postSheetGoogleTag(fileId: string, id: string, color: string, label: string, now: number) {
    return fetch(
      `/api/sheet/google/tag?fileId=${fileId}&id=${id}&color=${color}&label=${label}&modified=${now}`,
      { method: 'POST' }
    )
  },
}
