import { WeekDay } from './app/models/Todo'

export const AGE_1_YEAR = 60 * 60 * 24 * 365

export const COOKIE_THEME = 'x-theme'
export const COOKIE_EXPAND = 'x-expand-aside'

export const TAG_COLORS = {
  green: { white: '#1abc9c', dark: '#16a085' },
  emerald: { white: '#2ecc71', dark: '#27ae60' },
  blue: { white: '#3498db', dark: '#2980b9' },
  violet: { white: '#9b59b6', dark: '#8e44ad' },
  darkblue: { white: '#34495e', dark: '#2c3e50' },
  yellow: { white: '#f1c40f', dark: '#f39c12' },
  orange: { white: '#e67e22', dark: '#d35400' },
  red: { white: '#e74c3c', dark: '#c0392b' },
  darkgray: { white: '#95a5a6', dark: '#7f8c8d' },
} as const

export const WEEK_DAYS: { name: string; value: WeekDay }[] = [
  { name: '일', value: 'sun' },
  { name: '월', value: 'mon' },
  { name: '화', value: 'tue' },
  { name: '수', value: 'wed' },
  { name: '목', value: 'thu' },
  { name: '금', value: 'fri' },
  { name: '토', value: 'sat' },
]

export const WEEK_DAYS_NAME = {
  sun: '일',
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
  sat: '토',
}

export const MS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
} as const

export const CALENDAR_REPEAT = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
}
