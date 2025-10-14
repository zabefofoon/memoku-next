import { Todo } from '@/app/models/Todo'
import { WEEK_DAYS_NAME } from '@/const'
import dayjs from 'dayjs'
import { useDateUtil } from '../hooks/useDateUtil'

interface Props {
  todo?: Todo
  hideBottomText?: boolean
}

const MS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
} as const

type Mode = 'until' | 'left' | 'passed' // 시작까지/종료까지/종료 초과

function formatDuration(ms: number, mode: Mode): string {
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
}

export default function TodosPeriodText(props: Props) {
  if (!props || !props.todo?.start || !props.todo?.end) return null

  const now = Date.now()
  const start =
    typeof props.todo.start === 'number' ? props.todo.start : new Date(props.todo.start).getTime()
  const end =
    typeof props.todo.end === 'number' ? props.todo.end : new Date(props.todo.end).getTime()

  if (now < start)
    return (
      <p className='flex flex-col justify-start | text-left leading-[110%]'>
        <span className='text-[11px] sm:text-[13px] font-[700]'>
          {formatDuration(start - now, 'until')} 후 시작
        </span>
        {!props.hideBottomText && (
          <span className='hidden sm:inline'>
            <BottomTexts todo={props.todo} />
          </span>
        )}
      </p>
    )
  else if (now >= start && now < end)
    return (
      <p className='flex flex-col justify-start | text-left leading-[110%]'>
        <span className='text-[11px] sm:text-[13px] font-[700] text-violet-500'>
          {formatDuration(end - now, 'left')} 남음
        </span>
        {!props.hideBottomText && (
          <span className='hidden sm:inline'>
            <BottomTexts todo={props.todo} />
          </span>
        )}
      </p>
    )
  else
    return (
      <p className='flex flex-col justify-start | text-left leading-[110%]'>
        <span className='text-[11px] sm:text-[13px] font-[700] text-red-500'>
          {formatDuration(now - end, 'passed')} 초과
        </span>
        {!props.hideBottomText && (
          <span className='hidden sm:inline'>
            <BottomTexts todo={props.todo} />
          </span>
        )}
      </p>
    )
}

export function BottomTexts(props: { todo: Todo }) {
  const dateUtil = useDateUtil()

  const days =
    props.todo.days && props.todo.days.length === 7
      ? '매일'
      : props.todo.days?.map((day) => WEEK_DAYS_NAME[day]).join(',')

  const start =
    typeof props.todo.start === 'number'
      ? props.todo.start
      : new Date(props.todo.start ?? '').getTime()
  const end =
    typeof props.todo.end === 'number' ? props.todo.end : new Date(props.todo.end ?? '').getTime()

  const startHour = `${dayjs(start).hour()}`.padStart(2, '0')
  const startMinute = `${dayjs(start).minute()}`.padStart(2, '0')
  const endHour = `${dayjs(end).hour()}`.padStart(2, '0')
  const endMinute = `${dayjs(end).minute()}`.padStart(2, '0')

  return props.todo?.days ? (
    <span className='text-[11px] opacity-70 tracking-tight'>
      {days} / {startHour}:{startMinute} ~ {endHour}:{endMinute}
    </span>
  ) : (
    <span className='text-[11px] opacity-70 tracking-tight'>
      {dateUtil.parseDate(start)} ~ {dateUtil.parseDate(end)}
    </span>
  )
}
