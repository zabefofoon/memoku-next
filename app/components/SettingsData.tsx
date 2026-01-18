'use client'

import { useTranslations } from 'next-intl'
import { imagesDB } from '../lib/images.db'
import { tagsDB } from '../lib/tags.db'
import { todosDB } from '../lib/todos.db'
import etcUtil from '../utils/etc.util'

export default function SettingsData() {
  const t = useTranslations()

  const importData = (): void => {
    const element = document.createElement('input')
    element.setAttribute('type', 'file')
    element.click()
    document.body.appendChild(element)
    element.onchange = (event: Event) => {
      const fileReader = new FileReader()
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return
      fileReader.readAsText(file, 'utf-8')
      fileReader.onload = async () => {
        const result = JSON.parse(`${fileReader.result}`)
        await etcUtil.sleep(200)
        if (result.version === 1) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const todos = result.todos.map((todo: any) => ({
            id: etcUtil.generateUniqueId(),
            description: todo.description,
            tagId: todo.tagId,
            created: todo.created,
            modified: todo.modified,
            images: todo.images,
          }))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tags = result.setting.tags.map((tag: any) => ({ id: tag.id, label: tag.label }))

          await Promise.all([todosDB.addNewTodoBulk(todos), tagsDB.addNewTagBulk(tags)])
        }
        if (result.version === 2) {
          await Promise.all([
            todosDB.addNewTodoBulk(result.todos),
            tagsDB.addNewTagBulk(result.tags),
          ])
        }

        location.reload()
      }
    }
    document.body.removeChild(element)
  }

  const exportData = async (): Promise<void> => {
    const allTags = await tagsDB.getAllTags()
    const allTodos = await todosDB.getAllTodos()
    const allImages = await imagesDB.getAllImages()

    for (let i = 0; i < allTodos.length; i++) {
      const todo = allTodos[i]

      todo.images = todo.images
        ? todo.images
        : await Promise.all(
            allImages
              .filter((image) => image.todoId === todo.id)
              .map(({ image }) => (image instanceof Blob ? etcUtil.blobToBase64(image) : image))
          )
    }

    const element = document.createElement('a')
    element.setAttribute(
      'href',
      `data:text/json;charset=utf-8, ${encodeURIComponent(JSON.stringify({ version: 2, todos: allTodos, tags: allTags }))}`
    )
    element.setAttribute('download', 'data.json')
    document.body.appendChild(element)

    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className='emboss-sheet | p-[16px]'>
      <div className='flex items-center justify-between sm:justify-start gap-[12px] lg:gap-[24px]'>
        <p className='truncate text-[14px] font-[700] | shrink-0 | lg:py-[8px] | sm:w-[100px]'>
          {t('Settings.Data')}
        </p>
        <div className='flex gap-[6px] | text-[13px] underline'>
          <button
            type='button'
            onClick={importData}>
            {t('Settings.DataImport')}
          </button>
          <button
            type='button'
            onClick={exportData}>
            {t('Settings.DataExport')}
          </button>
        </div>
      </div>
    </div>
  )
}
