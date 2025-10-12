import { clsx, type ClassValue } from 'clsx'
import ShortUniqueId from 'short-unique-id'
import { twMerge } from 'tailwind-merge'

const etcUtil = {
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
}

export default etcUtil
