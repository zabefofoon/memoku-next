import dayjs from 'dayjs'
import { useLocale, useTranslations } from 'next-intl'
import { MouseEvent } from 'react'
import { Case, Else, If, Switch, Then } from 'react-if'
import { Todo } from '../models/Todo'
import etcUtil from '../utils/etc.util'
interface Props {
  todo: Todo
  timeFormat?: string
  hideTime?: boolean
  onClick?: (event: MouseEvent) => void
}

export default function TodoTimeText({
  todo,
  timeFormat = 'YYYY/MM/DD HH:mm:ss',
  hideTime = false,
  onClick,
}: Props) {
  const t = useTranslations()
  const locale = useLocale()
  const now = Date.now()
  const start = todo.start ?? 0
  const end = todo.end ?? 0

  const hasRemainedTime = todo.start && todo.end
  const hasDays = todo.days?.length
  const isBeforeRemainedTime = now < start
  const isInprogressRemainedTime = now >= start && now < end
  const isAfterRemainedTime = now > end

  return (
    <button
      className='flex items-center gap-[4px] | leading-[100%] tracking-tight'
      onClick={onClick}>
      <If condition={todo.status === 'done'}>
        <Then>
          <div className='flex items-center gap-[3px] '>
            <div className='w-[3px] aspect-square bg-gray-300 rounded-full'></div>
            <If condition={!todo.start && !todo.end}>
              <Then>
                <p className='text-[11px] text-gray-400'>
                  {t('Todo.Created', { date: dayjs(todo.created).format(t('General.YMD')) })}
                </p>
              </Then>
              <Else>
                <p className='text-[11px] text-gray-400'>
                  {dayjs(todo.start).format(t('General.YMD'))} ~{' '}
                  {dayjs(todo.end).format(t('General.YMD'))}
                </p>
              </Else>
            </If>
          </div>
        </Then>
        <Else>
          <If condition={hasDays}>
            <Then>
              <div className='flex items-center gap-[3px]'>
                <p className='text-[11px]'>⏰</p>
                <p className='text-[11px]'>
                  {todo.days && todo.days.length === 7
                    ? t('Todo.AllDays')
                    : todo.days?.map((day) => t(`General.${day}`)).join(',')}
                </p>
              </div>

              {/* 시간 */}
              <div className='flex items-center gap-[3px] '>
                <div className='w-[3px] aspect-square bg-gray-300 rounded-full'></div>
                <p className='text-[11px] text-gray-600 dark:text-zinc-400'>
                  {`${dayjs(start).hour()}`.padStart(2, '0')}:
                  {`${dayjs(start).minute()}`.padStart(2, '0')} ~{' '}
                  {`${dayjs(end).hour()}`.padStart(2, '0')}:
                  {`${dayjs(end).minute()}`.padStart(2, '0')}
                </p>
              </div>
              {/* 시간 */}
            </Then>
            <Else>
              {/* 남은 시간 */}
              <If condition={hasRemainedTime}>
                <Then>
                  <div className='flex items-center gap-[3px]'>
                    <p className='text-[11px]'>⏰</p>
                    <p className='text-[11px]'>
                      <Switch>
                        <Case condition={isBeforeRemainedTime}>
                          <span className='text-gray-600 dark:text-zinc-400 font-[600]'>
                            {t('Todo.TimeUntil', {
                              time: etcUtil.formatDuration(start - now, 'until', locale),
                            })}
                          </span>
                        </Case>
                        <Case condition={isInprogressRemainedTime}>
                          <span className='text-indigo-500 font-[600]'>
                            {t('Todo.TimeLeft', {
                              time: etcUtil.formatDuration(end - now, 'left', locale),
                            })}
                          </span>
                        </Case>
                        <Case condition={isAfterRemainedTime}>
                          <span className='text-red-500 font-[600]'>
                            {t('Todo.TimePassed', {
                              time: etcUtil.formatDuration(now - end, 'passed', locale),
                            })}
                          </span>
                        </Case>
                      </Switch>
                    </p>
                  </div>
                </Then>
              </If>
              {/* 남은 시간 */}

              {/* 생성일 */}
              <If condition={!hideTime}>
                <Then>
                  <div className='flex items-center gap-[3px] '>
                    <div className='w-[3px] aspect-square bg-gray-300 rounded-full'></div>
                    <p className='text-[11px] text-gray-600 dark:text-zinc-400'>
                      {t('Todo.Created', { date: dayjs(todo.created).format(timeFormat) })}
                    </p>
                  </div>
                </Then>
              </If>
              {/* 생성일 */}
            </Else>
          </If>
        </Else>
      </If>
    </button>
  )
}
