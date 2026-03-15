export const THEME_STORAGE_KEY = 'frontend-theme'
export const LIGHT_THEME = 'light'
export const DARK_THEME = 'dark'

export const normalizeTheme = (theme) => {
  return theme === DARK_THEME ? DARK_THEME : LIGHT_THEME
}

export const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return LIGHT_THEME
  }

  return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
}

export const persistTheme = (theme) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, normalizeTheme(theme))
}

export const applyThemeToDocument = (theme) => {
  if (typeof document === 'undefined') {
    return
  }

  const nextTheme = normalizeTheme(theme)

  document.documentElement.dataset.theme = nextTheme
  document.documentElement.setAttribute('data-bs-theme', nextTheme)
  document.documentElement.classList.toggle('dark', nextTheme === DARK_THEME)
}
