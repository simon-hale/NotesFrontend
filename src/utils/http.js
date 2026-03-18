import i18n from '@/i18n'

const COMMON_HTTP_ERROR_KEY_MAP = Object.freeze({
  400: 'common.badRequest',
  401: 'common.unauthorized',
  403: 'common.forbidden',
  404: 'common.apiNotFound',
  500: 'common.serverError',
  0: 'common.networkError',
  default: 'common.unknownError',
})

const AUTH_HTTP_ERROR_KEY_MAP = Object.freeze({
  400: 'auth.badRequest',
  401: 'auth.unauthorized',
  403: 'auth.incorrectCredentials',
  404: 'auth.apiNotFound',
  500: 'auth.serverError',
  0: 'auth.networkError',
  default: 'auth.unknownError',
})

const normalizeStatus = (status) => {
  const parsedStatus = Number(status)
  return Number.isFinite(parsedStatus) ? parsedStatus : -1
}

const getCurrentLanguage = () => {
  const locale = i18n.global?.locale
  if (typeof locale === 'string') return locale
  return locale?.value ?? 'zh-CN'
}

const getHttpErrorMessage = (t, status, messageKeyMap = COMMON_HTTP_ERROR_KEY_MAP) => {
  const normalizedStatus = normalizeStatus(status)
  const messageKey = messageKeyMap[normalizedStatus] ?? messageKeyMap.default
  return t(messageKey)
}

export { AUTH_HTTP_ERROR_KEY_MAP, COMMON_HTTP_ERROR_KEY_MAP, getCurrentLanguage, getHttpErrorMessage }
