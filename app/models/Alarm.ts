import { WeekDay } from './Todo'

export interface RegistAlarmParams {
  device_id: string
  todo_id: string
  text?: string
  start?: number
  end?: number
  days?: WeekDay[]
}
