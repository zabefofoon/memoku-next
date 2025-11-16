import { Todo } from '@/app/models/Todo'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ClipboardEvent, useEffect, useRef, useState } from 'react'
import TagBadge from './TagBadge'
import { TodosDropdown } from './TodosDropdown'
import TodosPeriodText from './TodosPeriodText'
import TodosStatus from './TodosStatus'

interface Props {
  todo: Todo
  updateText: (text: string, todoId: string) => void
  updateStatus?: (status: Todo['status'], todoId: string) => void
  addImage: (file: Blob) => Promise<void>
}

export default function TodosEditor(props: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const textareaEl = useRef<HTMLTextAreaElement>(null)

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

  return (
    <div className='flex flex-col gap-[12px] | flex-1 w-full overflow-auto | relative | p-[8px]'>
      <div className='absolute top-[16px] right-[16px] | flex gap-[4px] sm:gap-[8px]'>
        {props.todo?.id && (
          <TodosDropdown
            todo={props.todo}
            hideEdit
            position={{ x: 'RIGHT' }}
          />
        )}
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
          select={(status) => props.updateStatus?.(status, props.todo.id)}
        />
      </div>
      <textarea
        ref={textareaEl}
        name='postContent'
        className='w-full flex-1 | resize-none | rounded-xl p-[8px] | text-[15px]'
        value={textValue}
        onChange={(e) => setTextValue(e.currentTarget.value)}
        onInput={(event) => props.updateText(event.currentTarget.value, props.todo.id)}
        onPaste={handlePaste}></textarea>
      <TodosPeriodText todo={props.todo} />
    </div>
  )
}
