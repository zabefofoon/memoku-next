import etcUtil from '@/utils/etc.util'
import { Icon } from './Icon'

interface Props {
  id: string
  onIcon?: string
  offIcon?: string
  checked?: boolean
  toggle?: (checked: boolean) => void
}

export default function UIToggle(props: Props) {
  return (
    <label className='flex select-none items-center'>
      <span className='sr-only'>{props.id}</span>
      <div className='relative'>
        <input
          type='checkbox'
          checked={props.checked}
          onChange={() => props.toggle?.(!props.checked)}
          className='sr-only'
        />
        <div className='h-8 w-14 rounded-full bg-[#E5E7EB] dark:bg-zinc-900'></div>
        <div
          className={etcUtil.classNames([
            'absolute left-1 top-1 h-6 w-6 rounded-full bg-white dark:bg-zinc-800 transition | flex items-center justify-center',
            props.checked ? 'translate-x-6' : 'translate-x-0',
          ])}>
          {props.checked
            ? props.onIcon && (
                <Icon
                  name={props.onIcon}
                  className='text-[18px]'
                />
              )
            : props.offIcon && (
                <Icon
                  name={props.offIcon}
                  className='text-[18px]'
                />
              )}
        </div>
      </div>
    </label>
  )
}
