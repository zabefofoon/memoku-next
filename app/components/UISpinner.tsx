import { Icon } from './Icon'

export default function UISpinner() {
  return (
    <span className='w-[20px] aspect-square | relative'>
      &nbsp;
      <Icon
        name='spinner'
        className='spinner | absolute top-0 left-0 | text-[20px]'
      />
    </span>
  )
}
