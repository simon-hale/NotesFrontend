export const THEME_STORAGE_KEY = 'frontend-theme'
export const LIGHT_THEME = 'light'
export const DARK_THEME = 'dark'
export const DEFAULT_THEME_PALETTE = 'blue'
export const THEME_PALETTES = Object.freeze([
  { value: 'blue', labelKey: 'theme.palettes.blue' },
  { value: 'emerald', labelKey: 'theme.palettes.emerald' },
  { value: 'amber', labelKey: 'theme.palettes.amber' },
  { value: 'rose', labelKey: 'theme.palettes.rose' },
  { value: 'sage', labelKey: 'theme.palettes.sage' },
  { value: 'almond', labelKey: 'theme.palettes.almond' },
])

const THEME_PALETTE_VALUES = THEME_PALETTES.map((palette) => palette.value)

export const normalizeThemeMode = (theme) => {
  return theme === DARK_THEME ? DARK_THEME : LIGHT_THEME
}

export const normalizeThemePalette = (palette) => {
  return THEME_PALETTE_VALUES.includes(palette) ? palette : DEFAULT_THEME_PALETTE
}

export const normalizeTheme = (theme) => {
  if (typeof theme === 'string') {
    return {
      palette: DEFAULT_THEME_PALETTE,
      mode: normalizeThemeMode(theme),
    }
  }

  if (theme && typeof theme === 'object') {
    return {
      palette: normalizeThemePalette(theme.palette),
      mode: normalizeThemeMode(theme.mode),
    }
  }

  return {
    palette: DEFAULT_THEME_PALETTE,
    mode: LIGHT_THEME,
  }
}

export const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return normalizeTheme()
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (!storedTheme) {
    return normalizeTheme()
  }

  try {
    return normalizeTheme(JSON.parse(storedTheme))
  } catch (error) {
    return normalizeTheme(storedTheme)
  }
}

export const persistTheme = (theme) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(normalizeTheme(theme)))
}

export const applyThemeToDocument = (theme) => {
  if (typeof document === 'undefined') {
    return
  }

  const nextTheme = normalizeTheme(theme)
  const { palette, mode } = nextTheme

  document.documentElement.dataset.theme = `${palette}-${mode}`
  document.documentElement.dataset.themeMode = mode
  document.documentElement.dataset.themePalette = palette
  document.documentElement.setAttribute('data-bs-theme', mode)
  document.documentElement.classList.toggle('dark', mode === DARK_THEME)
}
