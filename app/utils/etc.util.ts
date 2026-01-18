import { MS } from '@/const'
import { clsx, type ClassValue } from 'clsx'
import ShortUniqueId from 'short-unique-id'
import { twMerge } from 'tailwind-merge'

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
      reader.readAsDataURL(blob) // Convert Blob to base64 data URL.
    })
  },

  base64ToBlob(base64: string, mimeType = 'image/webp') {
    // Base64 문자열에서 헤더 부분을 제거 (만약 포함되어 있다면)
    const byteString = atob(base64.split(',')[1])

    // 바이너리 데이터를 저장할 배열 생성
    const arrayBuffer = new ArrayBuffer(byteString.length)
    const uint8Array = new Uint8Array(arrayBuffer)

    // Base64 문자열을 바이너리로 변환하여 배열에 저장
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i)
    }

    // Blob 생성
    return new Blob([uint8Array], { type: mimeType })
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

            // Resize while preserving aspect ratio.
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

  formatDuration(ms: number, mode: 'until' | 'left' | 'passed', locale = 'en'): string {
    if (ms < 0) ms = -ms

    const days = Math.floor(ms / MS.day)
    ms -= days * MS.day

    const hours = Math.floor(ms / MS.hour)
    ms -= hours * MS.hour

    let minutes = Math.floor(ms / MS.minute)

    if ((mode === 'until' || mode === 'left') && days === 0 && hours === 0 && minutes === 0) {
      minutes = 1
    }

    const formatUnit = (value: number, unit: 'day' | 'hour' | 'minute') =>
      new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'short' }).format(value)

    const parts: string[] = []
    if (days) parts.push(formatUnit(days, 'day'))
    if (hours) parts.push(formatUnit(hours, 'hour'))
    parts.push(formatUnit(minutes, 'minute'))

    return parts.join(' ')
  },
}

export default etcUtil
