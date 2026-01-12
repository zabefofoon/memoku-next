import { TodosClient } from '@/app/components/TodosClient'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/app/guides'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return {
    title: t('Menu.Todos'),
  }
}

export default function Todos() {
  return <TodosClient />
}
