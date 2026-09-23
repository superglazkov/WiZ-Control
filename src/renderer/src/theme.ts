export type ThemePreference = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'wiz-control-theme'
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')

export function getThemePreference(): ThemePreference {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

export function applyTheme(): void {
  const preference = getThemePreference()
  const resolved = preference === 'system' ? (systemTheme.matches ? 'dark' : 'light') : preference
  document.documentElement.dataset.theme = resolved
  document.documentElement.style.colorScheme = resolved
}

export function setThemePreference(preference: ThemePreference): void {
  if (preference === 'system') window.localStorage.removeItem(STORAGE_KEY)
  else window.localStorage.setItem(STORAGE_KEY, preference)
  applyTheme()
}

systemTheme.addEventListener('change', () => {
  if (getThemePreference() === 'system') applyTheme()
})
