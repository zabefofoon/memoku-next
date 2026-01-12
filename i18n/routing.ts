import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'ko', 'ja', 'zh-Hans', 'zh-Hant', 'pt-BR'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})
