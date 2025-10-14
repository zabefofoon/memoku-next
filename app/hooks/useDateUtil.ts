export const useDateUtil = () => {
  return {
    parseDate(dateNumber?: number) {
      const date = dateNumber ? new Date(dateNumber) : new Date()

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
  }
}
