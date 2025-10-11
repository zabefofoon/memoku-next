import { Todo } from '../models/Todo'
import etcUtil from '../utils/etc.util'

interface Props {
  status: Todo['status']
  click?: () => void
}

export default function TodosStatusChip(props: Props) {
  const bgColor =
    props.status === 'created'
      ? 'bg-slate-200'
      : props.status === 'inprogress'
        ? 'bg-violet-100'
        : 'bg-green-100'

  const textColor =
    props.status === 'created'
      ? 'text-slate-500'
      : props.status === 'inprogress'
        ? 'text-violet-500'
        : 'text-green-500'

  const text =
    props.status === 'created' ? '생성됨' : props.status === 'inprogress' ? '진행중' : '완료'

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
