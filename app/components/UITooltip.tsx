import { PropsWithChildren, type CSSProperties } from 'react'
import { If, Then } from 'react-if'
import etcUtil from '../utils/etc.util'

interface Props extends PropsWithChildren {
  className?: string
  bgColor?: string
  direction?: 'TOP' | 'TOP_LEFT' | 'BOTTOM' | 'BOTTOM_LEFT'
  style?: CSSProperties & { positionAnchor?: string }
}

export default function UITooltip({
  direction = 'BOTTOM',
  className,
  bgColor = 'bg-white dark:bg-zinc-700',
  children,
  style,
}: Props) {
  return (
    <div
      className={etcUtil.classNames(['relative', className])}
      style={{ filter: `drop-shadow(0 5px 10px rgb(50 50 50 / 30%))`, ...style }}>
      <If condition={['TOP', 'TOP_LEFT'].includes(direction)}>
        <Then>
          <div
            className={etcUtil.classNames([
              direction === 'TOP' ? 'left-1/2 -translate-x-1/2' : 'left-[8px]',
              'absolute top-0   -translate-y-1/2 rotate-[45deg] | w-[8px] aspect-square',
              bgColor,
            ])}></div>
        </Then>
      </If>
      <div
        className={etcUtil.classNames([bgColor, 'rounded-sm | text-[14px] | px-[8px] py-[4px]'])}>
        {children}
      </div>
      <If condition={['BOTTOM', 'BOTTOM_LEFT'].includes(direction)}>
        <Then>
          <div
            className={etcUtil.classNames([
              'absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-[45deg] | w-[8px] aspect-square',
              direction === 'BOTTOM' ? 'left-1/2 -translate-x-1/2' : 'left-[8px]',
              bgColor,
            ])}></div>
        </Then>
      </If>
    </div>
  )
}
