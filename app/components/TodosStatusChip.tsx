import { Todo } from '../models/Todo'
import etcUtil from '../utils/etc.util'

interface Props {
  status: Todo['status']
  click?: () => void
}

export default function TodosStatusChip(props: Props) {
  let bgColor = 'bg-slate-200'
  if (props.status === 'done') bgColor = 'bg-green-200'
  if (props.status === 'inprogress') bgColor = 'bg-indigo-200'
  if (props.status === 'hold') bgColor = 'bg-orange-200'

  let textColor = 'text-slate-500'
  if (props.status === 'done') textColor = 'text-green-500'
  if (props.status === 'inprogress') textColor = 'text-indigo-500'
  if (props.status === 'hold') textColor = 'text-orange-600'

  let text = '생성됨'
  if (props.status === 'done') text = '완료됨'
  if (props.status === 'inprogress') text = '진행중'
  if (props.status === 'hold') text = '중지됨'

  return (
    <button
      className={etcUtil.classNames([
        'rounded-full | shrink-0 h-[24px] sm:h-[32px] w-fit | px-[6px] sm:px-[12px] sm:py-0 | flex items-center justify-center',
        bgColor,
      ])}
      onClick={(event) => {
        event.stopPropagation()
        props.click?.()
      }}>
      <span
        className={etcUtil.classNames([
          'whitespace-nowrap font-[700] text-[11px] sm:text-[12px] leading-[130%]',
          textColor,
        ])}>
        {text}
      </span>
    </button>
  )
}
