import { Todo } from '@/app/models/Todo'
import { TAG_COLORS, WEEK_DAYS_NAME } from '@/const'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ClipboardEvent, useEffect, useRef, useState } from 'react'
import { Case, Else, If, Switch, Then } from 'react-if'
import { useTagsStore } from '../stores/tags.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'

interface Props {
  todo: Todo
  updateText: (text: string, todoId: string) => void
  addImages: (files: Blob[]) => Promise<void>
}

const statusMap = {
  done: {
    label: '완료됨',
    icon: 'check',
    color: 'var(--color-green-500)',
  },
  inprogress: {
    label: '진행중',
    icon: 'run',
    color: 'var(--color-indigo-500)',
  },
  hold: {
    label: '중지됨',
    icon: 'pause',
    color: 'var(--color-orange-600)',
  },
  created: {
    label: '생성됨',
    icon: 'plus',
    color: 'var(--color-slate-600)',
  },
}

export default function TodosEditor({ todo, updateText, addImages }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const getTagsById = useTagsStore((s) => s.getTagsById)

  const tag = getTagsById(todo.tagId)

  const textareaEl = useRef<HTMLTextAreaElement>(null)

  const [textValue, setTextValue] = useState<string>('')
  const now = Date.now()
  const start = todo.start ?? 0
  const end = todo.end ?? 0

  const hasRemainedTime = todo.start && todo.end
  const hasDays = todo.days?.length
  const isBeforeRemainedTime = now < start
  const isInprogressRemainedTime = now >= start && now < end
  const isAfterRemainedTime = now > end

  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>): Promise<void> => {
    const files = Array.from(event.clipboardData.files ?? [])
    if (files.length > 0) {
      event.preventDefault()
      addImages(files)
    }
  }

  useEffect(() => {
    setTextValue(todo?.description ?? '')
  }, [todo?.description])

  return (
    <div className='flex flex-col gap-[12px] | flex-1 w-full overflow-auto | relative | p-[8px]'>
      <div className='absolute top-[8px] right-[8px] | flex gap-[4px] sm:gap-[8px]'>
        <If condition={todo?.id}>
          <Then>
            <Link
              href={`?time=${todo.id}}`}
              className='rounded-full | p-[6px] | border border-gray-100'
              type='button'
              style={{
                boxShadow: '1px 1px 0 var(--color-gray-300), -1px -1px 0 white',
              }}>
              <Icon
                name='alarm'
                className='expand-hitbox | text-[16px]'
              />
            </Link>
            <Link
              href={`?deleteModal=${todo.id}`}
              className='rounded-full | p-[6px] | border border-gray-100'
              type='button'
              style={{
                boxShadow: '1px 1px 0 var(--color-gray-300), -1px -1px 0 white',
              }}>
              <Icon
                name='delete'
                className='expand-hitbox | text-[16px]'
              />
            </Link>
          </Then>
        </If>
      </div>
      <div className='flex items-center gap-[6px]'>
        <If condition={todo != null}>
          <Then>
            <div className='neu-button | rounded-full | h-[34px] | flex'>
              <button
                type='button'
                className='button'
                onClick={() => router.push(`?todoTag=${todo?.id}`)}>
                <div className='button-inner | flex items-center gap-[4px]'>
                  <span
                    className='w-[8px] aspect-square | rounded-full | bg-red-500'
                    style={{
                      background: tag
                        ? TAG_COLORS[tag.color]?.white || 'var(--color-slate-800)'
                        : 'var(--color-slate-800)',
                    }}></span>
                  <p className='text-[11px] text-gray-600 leading-[100%]'>{tag?.label ?? 'MEMO'}</p>
                </div>
              </button>
            </div>
          </Then>
        </If>

        <div className='neu-button | relative | rounded-full '>
          <button
            type='button'
            className='button'
            style={{
              color: statusMap[todo?.status ?? 'created']?.color,
            }}
            onClick={() => {
              const urlParams = new URLSearchParams(searchParams.toString())
              router.push(`?${decodeURIComponent(urlParams.toString())}&todoStatus=${todo.id}`, {
                scroll: false,
              })
            }}>
            <div className='button-inner | flex items-center'>
              <Icon name={statusMap[todo.status ?? 'created']?.icon} />
              <p className='text-[11px] leading-[100%] whitespace-nowrap'>
                {statusMap[todo.status ?? 'created']?.label}
              </p>
            </div>
          </button>
        </div>
      </div>
      <textarea
        ref={textareaEl}
        name='postContent'
        className='w-full flex-1 | resize-none | rounded-xl | text-[15px]'
        value={textValue}
        onChange={(e) => setTextValue(e.currentTarget.value)}
        onInput={(event) => updateText(event.currentTarget.value, todo.id)}
        onPaste={handlePaste}></textarea>
      {/* 남은시간, 반복 날짜 */}
      <div className='flex items-center gap-[4px] | mt-[6px] | leading-[100%] tracking-tight'>
        <If condition={todo.status === 'done'}>
          <Then>
            <div className='flex items-center gap-[3px] '>
              <div className='w-[3px] aspect-square bg-gray-300 rounded-full'></div>
              <If condition={!todo.start && !todo.end}>
                <Then>
                  <p className='text-[11px] text-gray-400'>
                    {dayjs(todo.created).format('YY/MM/DD')} 생성
                  </p>
                </Then>
                <Else>
                  <p className='text-[11px] text-gray-400'>
                    {dayjs(todo.start).format('YY/MM/DD')} ~ {dayjs(todo.end).format('YY/MM/DD')}
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
                      ? '매일'
                      : todo.days?.map((day) => WEEK_DAYS_NAME[day]).join(',')}
                  </p>
                </div>

                {/* 시간 */}
                <div className='flex items-center gap-[3px] '>
                  <div className='w-[3px] aspect-square bg-gray-300 rounded-full'></div>
                  <p className='text-[11px] text-gray-600'>
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
                            <span className='text-gray-600 font-[600]'>
                              {etcUtil.formatDuration(start - now, 'until')} 후 시작
                            </span>
                          </Case>
                          <Case condition={isInprogressRemainedTime}>
                            <span className='text-indigo-500 font-[600]'>
                              {etcUtil.formatDuration(end - now, 'left')} 남음
                            </span>
                          </Case>
                          <Case condition={isAfterRemainedTime}>
                            <span className='text-red-500 font-[600]'>
                              {etcUtil.formatDuration(now - end, 'passed')} 초과
                            </span>
                          </Case>
                        </Switch>
                      </p>
                    </div>
                  </Then>
                </If>
                {/* 남은 시간 */}

                {/* 생성일 */}
                <div className='flex items-center gap-[3px] '>
                  <div className='w-[3px] aspect-square bg-gray-300 rounded-full'></div>
                  <p className='text-[11px] text-gray-500'>
                    {dayjs(todo.created).format('YYYY/MM/DD HH:mm:ss')} 생성
                  </p>
                </div>
                {/* 생성일 */}
              </Else>
            </If>
          </Else>
        </If>
      </div>
      {/* 남은시간, 반복 날짜 */}
    </div>
  )
}
