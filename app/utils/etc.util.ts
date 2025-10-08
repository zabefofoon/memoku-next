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
}

export default etcUtil
