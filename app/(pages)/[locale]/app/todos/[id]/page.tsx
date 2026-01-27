import TodosDetailClient from '@/app/components/TodosDetailClient'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/app/todos/[id]'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return {
    title: t('Menu.TodosDetail'),
  }
}

export default async function TodosDetail() {
  return <TodosDetailClient />
}
