import { Todo } from '@/app/models/Todo'
import { WEEK_DAYS_NAME } from '@/const'
import dayjs from 'dayjs'
import { useDateUtil } from '../hooks/useDateUtil'

interface Props {
  todo?: Todo
}

export default function TodosPeriodText(props: Props) {
  const dateUtil = useDateUtil()
  if (props.todo == null) return null

  const now = Date.now()
  const start = props.todo.start ?? 0
  const end = props.todo.end ?? 0

  if (props.todo.days?.length) {
    const days =
      props.todo.days && props.todo.days.length === 7
        ? '매일'
        : props.todo.days?.map((day) => WEEK_DAYS_NAME[day]).join(',')

    const startHour = `${dayjs(start).hour()}`.padStart(2, '0')
    const startMinute = `${dayjs(start).minute()}`.padStart(2, '0')
    const endHour = `${dayjs(end).hour()}`.padStart(2, '0')
    const endMinute = `${dayjs(end).minute()}`.padStart(2, '0')

    if (props.todo.status === 'done')
      return (
        <span className='text-[11px] opacity-70 tracking-tight'>
          {dateUtil.parseDate(props.todo?.created)}
        </span>
      )

    return (
      <span className='text-[11px] opacity-70 tracking-tight'>
        {days} / {startHour}:{startMinute} ~ {endHour}:{endMinute}
      </span>
    )
  }

  if (props.todo.status === 'done' && props.todo.start && props.todo.end) {
    return (
      <span className='text-[11px] opacity-70 tracking-tight'>
        {dateUtil.parseDate(start)} ~ {dateUtil.parseDate(end)}
      </span>
    )
  }

  if (!props.todo.start)
    return (
      <span className='text-[11px] opacity-70 tracking-tight'>
        {dateUtil.parseDate(props.todo?.created)} 생성됨
      </span>
    )

  if (now < start)
    return (
      <span className='text-[11px] sm:text-[13px] font-[700]'>
        {dateUtil.formatDuration(start - now, 'until')} 후 시작
      </span>
    )
  else if (now >= start && now < end)
    return (
      <span className='text-[11px] sm:text-[13px] font-[700] text-indigo-500'>
        {dateUtil.formatDuration(end - now, 'left')} 남음
      </span>
    )
  else
    return (
      <span className='text-[11px] sm:text-[13px] font-[700] text-red-500'>
        {dateUtil.formatDuration(now - end, 'passed')} 초과
      </span>
    )
}
