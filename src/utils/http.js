import $ from 'jquery'
import i18n from '@/i18n'
import { BASE_URL } from '@/config'

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

/* ------------------------------------------------------------------ *
 * Browser HTTP configuration.
 *
 * The browser authenticates with the HttpOnly `notes-auth` cookie, so
 * every jQuery request has to be sent with credentials. Unsafe requests
 * to the backend additionally carry the `X-XSRF-TOKEN` header taken from
 * the JavaScript readable `XSRF-TOKEN` cookie.
 *
 * The `notes-auth` cookie is HttpOnly and must never be read here.
 * ------------------------------------------------------------------ */

const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN'
const CSRF_SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE']
const CSRF_HEADER_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

// `decodeURIComponent` throws on malformed input, so stay on the raw value.
const safeDecodeURIComponent = (value) => {
  try {
    return decodeURIComponent(value)
  } catch (error) {
    return value
  }
}

// Reads a JavaScript readable cookie without touching HttpOnly cookies.
const readCookie = (name) => {
  if (typeof document === 'undefined' || typeof document.cookie !== 'string') return ''

  const prefix = `${name}=`
  const segments = document.cookie ? document.cookie.split(';') : []

  for (const segment of segments) {
    const cookie = segment.trim()
    if (!cookie.startsWith(prefix)) continue

    return safeDecodeURIComponent(cookie.slice(prefix.length))
  }

  return ''
}

const resolveRequestOrigin = (url) => {
  if (typeof url !== 'string' || url === '') return null

  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : undefined

  try {
    return new URL(url, origin).origin
  } catch (error) {
    return null
  }
}

const stripQueryAndHash = (url) => url.split('#')[0].split('?')[0]

// Backend origin/path derived from BASE_URL. A relative BASE_URL is resolved
// against the current origin, so absolute request URLs pointing at the same
// origin are recognised as backend requests as well.
const BACKEND = (() => {
  if (typeof BASE_URL !== 'string' || BASE_URL.trim() === '') return { origin: null, path: '' }

  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : undefined
  let resolved

  try {
    resolved = new URL(BASE_URL, origin)
  } catch (error) {
    const relativePath = stripQueryAndHash(BASE_URL.trim())
    if (!relativePath.startsWith('/')) return { origin: null, path: '' }

    return { origin: null, path: relativePath.replace(/\/+$/, '') }
  }

  return {
    origin: resolved.origin,
    path: stripQueryAndHash(resolved.pathname).replace(/\/+$/, ''),
  }
})()

const isBackendRequest = (url) => {
  if (typeof url !== 'string' || url === '') return false

  if (BACKEND.origin !== null) {
    const origin = resolveRequestOrigin(url)
    if (origin === null || origin !== BACKEND.origin) return false
  }

  if (BACKEND.path === '') return true

  const base = typeof window !== 'undefined' && window.location ? window.location.origin : undefined
  let pathname = stripQueryAndHash(url)

  try {
    pathname = new URL(url, base).pathname
  } catch (error) {
    if (!pathname.startsWith('/')) return false
  }

  return pathname === BACKEND.path || pathname.startsWith(`${BACKEND.path}/`)
}

const isUnsafeMethod = (method) => {
  const normalizedMethod = typeof method === 'string' && method !== '' ? method.toUpperCase() : 'GET'

  if (CSRF_SAFE_METHODS.includes(normalizedMethod)) return false
  return CSRF_HEADER_METHODS.includes(normalizedMethod)
}

const applyCsrfHeader = (xhr, settings) => {
  if (!xhr || !settings || !isUnsafeMethod(settings.type || settings.method)) return
  if (!isBackendRequest(settings.url)) return

  const csrfToken = readCookie(CSRF_COOKIE_NAME)
  if (!csrfToken) return

  xhr.setRequestHeader(CSRF_HEADER_NAME, csrfToken)
}

const configureHttp = () => {
  $.ajaxSetup({
    xhrFields: {
      withCredentials: true,
    },
    beforeSend(xhr, settings) {
      applyCsrfHeader(xhr, settings)
    },
  })
}

export {
  AUTH_HTTP_ERROR_KEY_MAP,
  COMMON_HTTP_ERROR_KEY_MAP,
  configureHttp,
  getCurrentLanguage,
  getHttpErrorMessage,
}
