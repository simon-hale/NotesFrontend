import { createI18n } from 'vue-i18n'
import enUS from '../languages/en-US'
import zhCN from '../languages/zh-CN'

const STORAGE_KEY = 'frontend-locale'
const DEFAULT_LOCALE = 'zh-CN'
const SUPPORTED_LOCALES = ['en-US', 'zh-CN']

const normalizeLocale = (locale) => {
  if (locale && locale.toLowerCase().startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en-US'
}

const getInitialLocale = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored && SUPPORTED_LOCALES.includes(stored)) {
    return stored
  }

  return DEFAULT_LOCALE
}

const syncDocumentLanguage = (locale) => {
  if (typeof document === 'undefined') return
  document.documentElement.lang = locale
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
  },
})

syncDocumentLanguage(i18n.global.locale.value)

const setAppLocale = (locale) => {
  const nextLocale = SUPPORTED_LOCALES.includes(locale) ? locale : normalizeLocale(locale)
  i18n.global.locale.value = nextLocale
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, nextLocale)
  }
  syncDocumentLanguage(nextLocale)
}

export { DEFAULT_LOCALE, STORAGE_KEY, SUPPORTED_LOCALES, setAppLocale }
export default i18n
