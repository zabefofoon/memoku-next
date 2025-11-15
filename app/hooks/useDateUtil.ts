import { MS } from '@/const'

export const useDateUtil = () => {
  return {
    parseDate(dateNumber?: number) {
      let date = new Date().getTime()
      if (typeof dateNumber === 'number') date = dateNumber
      if (typeof dateNumber === 'string') date = +dateNumber

      return new Intl.DateTimeFormat('ko', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(date)
    },

    parseOnlyDate(dateNumber?: number) {
      const date = dateNumber ? new Date(dateNumber) : new Date()

      return new Intl.DateTimeFormat('ko', {
        dateStyle: 'long',
      }).format(date)
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
}
