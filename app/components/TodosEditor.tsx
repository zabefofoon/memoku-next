import { useDateUtil } from '@/app/hooks/useDateUtil'
import { Todo } from '@/app/models/Todo'
import etcUtil from '@/app/utils/etc.util'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ClipboardEvent, useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import TagBadge from './TagBadge'
import TodosDeleteButton from './TodosDeleteButton'
import { TodosDeleteModal } from './TodosDeleteModal'
import TodosPeriodText, { BottomTexts } from './TodosPeriodText'
import TodosStatus from './TodosStatus'

interface Props {
  todo?: Todo
  deleteTime?: (todoId?: number) => void
  updateText?: (text: string, todoId?: number) => void
  updateStatus?: (status: Todo['status'], todoId?: number) => void
  addImage: (file: Blob) => Promise<void>
}

export default function TodosEditor(props: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const dateUtil = useDateUtil()

  const textareaEl = useRef<HTMLTextAreaElement>(null)

  const [isShowDeleteTimeModal, setIsShowDeleteTimeModal] = useState<boolean>(false)

  const [textValue, setTextValue] = useState<string>('')

  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>): Promise<void> => {
    const files = Array.from(event.clipboardData.files ?? [])
    if (files.length > 0) {
      event.preventDefault()
      for (const index in files) await props.addImage(files[index])
    }
  }

  useEffect(() => {
    setTextValue(props.todo?.description ?? '')
  }, [props.todo?.description])

  useEffect(() => {
    if (pathname.endsWith(`${props.todo?.id}`)) {
      setIsShowDeleteTimeModal(!!searchParams.get('deleteTime'))
    }
  }, [searchParams])

  return (
    <div className='flex flex-col gap-[12px] | flex-1 w-full overflow-auto | relative | p-[8px]'>
      <TodosDeleteModal
        isShow={isShowDeleteTimeModal}
        close={() => router.back()}
        delete={() => props.deleteTime?.(props.todo?.id)}
      />
      <div className='absolute top-[16px] right-[16px] | flex gap-[4px] sm:gap-[8px]'>
        {props.todo?.id && <TodosDeleteButton id={props.todo.id} />}
      </div>
      <div className='flex items-center gap-[6px] px-[8px]'>
        {props.todo && (
          <TagBadge
            id={props.todo?.tagId}
            click={() => router.push(`?todoTag=${props.todo?.id}`)}
          />
        )}
        <TodosStatus
          status={props.todo?.status ?? 'created'}
          select={(status) => props.updateStatus?.(status, props.todo?.id)}
        />
        {props.todo?.status !== 'done' && (
          <>
            <div className='relative'>
              <Link
                href={`?time=${props.todo?.id}`}
                className={etcUtil.classNames(
                  'relative | w-[24px] sm:w-[32px] aspect-square | rounded-full | flex items-center justify-center',
                  props.todo && props.todo.start && props.todo.end
                    ? 'bg-violet-500 '
                    : 'opacity-70 | bg-slate-100 text-slate-600'
                )}>
                <Icon
                  name='alarm'
                  className={etcUtil.classNames([
                    'text-[16px] sm:text-[20px]',
                    props.todo && props.todo.start && props.todo.end ? 'text-white' : '',
                  ])}
                />
              </Link>
              {props.todo?.start && (
                <Link
                  href={`?deleteTime=${props.todo?.id}`}
                  onClick={(event) => event.stopPropagation()}>
                  <Icon
                    name='close'
                    className='p-[2px] | rounded-full absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 | bg-slate-100 dark:bg-zinc-600 | text-[12px] sm:text-[14px]'
                  />
                </Link>
              )}
            </div>
            {props.todo && props.todo.start && props.todo.end && (
              <TodosPeriodText todo={props.todo} />
            )}
          </>
        )}
      </div>
      <textarea
        ref={textareaEl}
        name='postContent'
        className='w-full flex-1 | resize-none | rounded-xl p-[8px] | text-[15px]'
        value={textValue}
        onChange={(e) => setTextValue(e.currentTarget.value)}
        onInput={(event) => props.updateText?.(event.currentTarget.value, props.todo?.id)}
        onPaste={handlePaste}></textarea>
      {!props.todo?.start ? (
        <p className='flex gap-[8px] | opacity-70 | text-[12px] leading-[130%]'>
          <span>최근 수정일</span>
          <span>{dateUtil.parseDate(props.todo?.modified)}</span>
        </p>
      ) : (
        <BottomTexts todo={props.todo} />
      )}
    </div>
  )
}
