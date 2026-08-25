export type Lang = 'en' | 'he' | 'ar'

export const LANGUAGES: { id: Lang; nativeLabel: string; dir: 'ltr' | 'rtl' }[] = [
  { id: 'en', nativeLabel: 'English', dir: 'ltr' },
  { id: 'he', nativeLabel: 'עברית', dir: 'rtl' },
  { id: 'ar', nativeLabel: 'العربية', dir: 'rtl' },
]

export function dirFor(lang: Lang): 'ltr' | 'rtl' {
  return lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr'
}
