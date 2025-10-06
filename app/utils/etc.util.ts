import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const etcUtil = {
  classNames(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  },
}

export default etcUtil
