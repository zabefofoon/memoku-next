import { MS } from '@/const'
import { clsx, type ClassValue } from 'clsx'
import ShortUniqueId from 'short-unique-id'
import { twMerge } from 'tailwind-merge'
import { Todo } from '../models/Todo'

const etcUtil = {
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), ms))
  },

  classNames(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  },

  generateUniqueId() {
    const uId = new ShortUniqueId({
      length: 10,
      dictionary: 'alpha',
    })
    return uId.rnd()
  },

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob) // Blob을 Base64로 변환
    })
  },

  fileToWebp(file: Blob): Promise<[Blob, string]> {
    const reader = new FileReader()
    return new Promise((resolve) => {
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string

        if (result) {
          const img = new Image()
          img.src = result
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const maxWidth = 1280
            const maxHeight = 1280

            let width = img.width
            let height = img.height

            // 이미지 크기를 유지하면서 비율에 맞게 리사이즈
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height
                height = maxHeight
              }
            }

            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')

            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height)

              canvas.toBlob(
                (blob) => {
                  if (blob)
                    this.blobToBase64(blob).then((base64String) => resolve([blob, base64String]))
                },
                'image/webp',
                0.8
              )
            }
          }
        }
      }

      reader.readAsDataURL(file)
    })
  },

  getRemainedTime(todo: Todo): string {
    const now = Date.now()
    const start = todo.start ?? 0
    const end = todo.end ?? 0

    if (now < start) return `${this.formatDuration(start - now, 'until')} 후 시작`
    else if (now >= start && now < end)
      return `${this.formatDuration(start - now, 'until')} 후 시작`
    else return `${this.formatDuration(start - now, 'until')} 후 초과`
  },

  formatDuration(ms: number, mode: 'until' | 'left' | 'passed'): string {
    if (ms < 0) ms = -ms

    const days = Math.floor(ms / MS.day)
    ms -= days * MS.day

    const hours = Math.floor(ms / MS.hour)
    ms -= hours * MS.hour

    let minutes = Math.floor(ms / MS.minute)

    // 남은 시간(until/left)인데 실제로는 1분 미만 남았을 때 표시 보정
    if ((mode === 'until' || mode === 'left') && days === 0 && hours === 0 && minutes === 0) {
      minutes = 1
    }

    const parts: string[] = []
    if (days) parts.push(`${days}일`)
    if (hours) parts.push(`${hours}시간`)
    parts.push(`${minutes}분`)

    return parts.join(' ')
  },
}

export default etcUtil
