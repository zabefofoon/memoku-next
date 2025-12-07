import { TAG_COLORS, WEEK_DAYS_NAME } from '@/const'
import dayjs from 'dayjs'
import Link from 'next/link'
import { Fragment, useEffect, useRef } from 'react'
import { Case, Default, Else, If, Switch, Then } from 'react-if'
import { TodoWithChildren } from '../models/Todo'
import { useTagsStore } from '../stores/tags.store'
import { useTodosPageStore } from '../stores/todosPage.store'
import etcUtil from '../utils/etc.util'
import { Icon } from './Icon'
import UISpinner from './UISpinner'

interface Props {
  loadTodos: (page: number) => void
}

export default function TodosCards(props: Props) {
  const isTodosNextLoading = useTodosPageStore((state) => state.isTodosNextLoading)
  const isTodosLoading = useTodosPageStore((state) => state.isTodosLoading)
  const page = useTodosPageStore((state) => state.page)
  const setPage = useTodosPageStore((state) => state.setPage)
  const todos = useTodosPageStore((state) => state.todos)
  const total = useTodosPageStore((state) => state.total)

  const nextLoaderEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const isLoadable = entry.isIntersecting && !isTodosNextLoading && !isTodosLoading
      if (isLoadable) setPage(page + 1, props.loadTodos)
    })
    if (nextLoaderEl.current) observer.observe(nextLoaderEl.current)

    return () => observer.disconnect()
  }, [isTodosLoading, isTodosNextLoading, page, props.loadTodos, setPage])

  return (
    <If condition={isTodosLoading}>
      <Then>
        {() => (
          <div className='flex-1 h-full | py-[80px] px-[16px] | text-center'>
            <UISpinner />
          </div>
        )}
      </Then>
      <Else>
        <If condition={!todos?.length}>
          <Then>
            <div className='flex-1 h-full | py-[80px] px-[16px] | text-center'>
              <p className='text-[13px] opacity-70'>데이터가 없습니다.</p>
            </div>
          </Then>
          <Else>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[12px] | px-[16px]'>
              {todos?.map((todo) => (
                <Fragment key={todo.id}>
                  <TodoCard todo={todo} />
                  <If condition={todo.isExpanded}>
                    <Then>
                      {todo.children?.map((child) => (
                        <div
                          key={child.id}
                          className='flex items-center gap-[4px]'>
                          <Icon
                            name='reply'
                            className='text-[16px]'
                          />
                          <TodoCard
                            todo={child}
                            parent={todo}
                          />
                        </div>
                      ))}
                    </Then>
                  </If>
                </Fragment>
              ))}
              <If condition={!isTodosLoading && todos && (total ?? 0) > todos.length}>
                <Then>
                  <div
                    ref={nextLoaderEl}
                    className='text-center | py-[6px]'>
                    <UISpinner />
                  </div>
                </Then>
              </If>
            </div>
          </Else>
        </If>
      </Else>
    </If>
  )
}

function TodoCard({ todo }: { todo: TodoWithChildren; parent?: TodoWithChildren }) {
  const getTagsById = useTagsStore((s) => s.getTagsById)

  const now = Date.now()
  const start = todo.start ?? 0
  const end = todo.end ?? 0

  const hasRemainedTime = todo.start && todo.end
  const hasDays = todo.days?.length
  const isBeforeRemainedTime = now < start
  const isInprogressRemainedTime = now >= start && now < end
  const isAfterRemainedTime = now > end

  let bgColor = 'bg-slate-200'
  if (todo.status === 'done') bgColor = 'bg-green-200'
  if (todo.status === 'inprogress') bgColor = 'bg-indigo-200'
  if (todo.status === 'hold') bgColor = 'bg-orange-200'

  let textColor = 'text-slate-500'
  if (todo.status === 'done') textColor = 'text-green-500'
  if (todo.status === 'inprogress') textColor = 'text-indigo-500'
  if (todo.status === 'hold') textColor = 'text-orange-600'

  let text = '생성됨'
  if (todo.status === 'done') text = '완료됨'
  if (todo.status === 'inprogress') text = '진행중'
  if (todo.status === 'hold') text = '중지됨'

  const tag = getTagsById(todo.tagId)

  return (
    <Link
      href={`/todos/${todo.id}`}
      className='block | bg-[rgb(248,248,251)] | rounded-xl | p-[12px]'
      style={{
        boxShadow: '2px 2px 0 var(--color-gray-200), -2px -2px 0 white',
      }}>
      {/* 태그 */}
      <div className='flex items-center gap-[4px]'>
        <div
          className='w-[8px] aspect-square | rounded-full | bg-red-500'
          style={{
            background: tag ? TAG_COLORS[tag.color].white : 'var(--color-slate-800)',
          }}></div>
        <p className='text-[11px] text-gray-600 leading-[100%]'>{tag?.label ?? 'MEMO'}</p>
      </div>
      {/* 태그 */}

      {/* 제목, 상태 */}
      <div className='mt-[6px] | flex items-start gap-[6px] justify-between'>
        {/* 제목 */}
        <p className='line-2 | text-[15px] font-[600] leading-[130%]'>
          {todo.description?.slice(0, 40)?.split(/\n/)[0]}
        </p>
        {/* 제목 */}

        {/* 상태 */}
        <div
          className={etcUtil.classNames(
            'shrink-0 | leading-[100%] | flex items-center | py-[3px] px-[4px] pr-[8px] | rounded-full',
            [textColor, bgColor]
          )}>
          <p className='text-[14px]'>
            <Switch>
              <Case condition={todo.status === 'inprogress'}>
                <Icon name='run' />
              </Case>
              <Case condition={todo.status === 'hold'}>
                <Icon name='pause' />
              </Case>
              <Case condition={todo.status === 'done'}>
                <Icon name='check' />
              </Case>
              <Default>
                <Icon name='plus' />
              </Default>
            </Switch>
          </p>
          <p className='text-[11px]'>{text}</p>
        </div>
        {/* 상태 */}
      </div>
      {/* 제목, 상태 */}

      {/* 남은시간, 반복 날짜 */}
      <div className='flex items-center gap-[4px] | mt-[6px] | leading-[100%] tracking-tight'>
        <If condition={todo.status === 'done'}>
          <Then>
            <div className='flex items-center gap-[3px] '>
              <div className='w-[3px] aspect-square bg-gray-300 rounded-full'></div>
              <p className='text-[11px] text-gray-400'>
                {dayjs(todo.created).format('YY/MM/DD')} 생성
              </p>
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
                  <p className='text-[11px] text-gray-400'>
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
                  <p className='text-[11px] text-gray-400'>
                    {dayjs(todo.created).format('YY/MM/DD')} 생성
                  </p>
                </div>
                {/* 생성일 */}
              </Else>
            </If>
          </Else>
        </If>
      </div>
      {/* 남은시간, 반복 날짜 */}

      <div className='flex items-center'>
        {/* 하위 일 더 보기 */}
        <If condition={todo.childId}>
          <Then>
            <div className='flex items-center | mt-[6px]'>
              <Icon
                name='chevron-down'
                className='text-[16px]'
              />
              <p className='text-[11px]'>하위 일 더 보기</p>
            </div>
          </Then>
          <Else>
            <div className='flex items-center | mt-[6px] | text-gray-400'>
              <Icon
                name='plus'
                className='text-[16px]'
              />
              <p className='text-[11px]'>하위 일 추가</p>
            </div>
          </Else>
        </If>
        {/* 하위 일 더 보기 */}

        <button
          className='rounded-full | ml-auto p-[2px] | border border-gray-100'
          type='button'
          style={{
            boxShadow: '1px 1px 0 var(--color-gray-300), -1px -1px 0 white',
          }}>
          <Icon
            name='overflow'
            className='text-[14px]'
          />
        </button>
      </div>
    </Link>
  )
}
