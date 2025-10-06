import { Todo } from '@/app/models/Todo'

interface Props {
  todo?: Todo
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
    return <span className='font-[700]'>{formatDuration(start - now, 'until')} 후 시작</span>
  else if (now >= start && now < end)
    return (
      <span className='font-[700] text-violet-500'>{formatDuration(end - now, 'left')} 남음</span>
    )
  else
    return (
      <span className='font-[700] text-red-500'>{formatDuration(now - end, 'passed')} 초과</span>
    )
}
