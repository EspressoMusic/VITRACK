import type { Lang } from './i18n/lang'

/** Local YYYY-MM-DD, avoiding UTC-shift bugs from toISOString(). */
export function toLocalDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayKey(): string {
  return toLocalDateKey(new Date())
}

export function daysAgoKey(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return toLocalDateKey(d)
}

/** The 7 date keys (Sunday-first) of the week containing `dateKey`. */
export function getWeekDateKeys(dateKey: string): string[] {
  const [year, month, day] = dateKey.split('-').map(Number)
  const start = new Date(year, month - 1, day - new Date(year, month - 1, day).getDay())
  return Array.from({ length: 7 }, (_, i) => toLocalDateKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)))
}

const MONTH_NAMES: Record<Lang, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  he: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
}

const MONTH_NAMES_SHORT: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  he: MONTH_NAMES.he,
  ar: MONTH_NAMES.ar,
}

/** Single-glyph weekday labels, Sunday-first to match buildCalendarGrid(). */
const WEEKDAY_LETTERS: Record<Lang, string[]> = {
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  he: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
  ar: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
}

export function weekdayLetters(lang: Lang = 'en'): string[] {
  return WEEKDAY_LETTERS[lang]
}

export function monthLabel(year: number, month: number, lang: Lang = 'en'): string {
  return `${MONTH_NAMES[lang][month]} ${year}`
}

export function shortMonthLabel(year: number, month: number, lang: Lang = 'en'): string {
  return `${MONTH_NAMES_SHORT[lang][month]} ${String(year).slice(-2)}`
}

/** Builds a calendar grid (leading/trailing days from adjacent months included), 5 rows when
 *  the month fits in 5, 6 rows only when a 6th is actually needed — no row that's entirely
 *  next month's overflow. */
export function buildCalendarGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)

  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i))
  }
  if (days[35].getMonth() !== firstOfMonth.getMonth()) days.length = 35
  return days
}

/** ISO 8601 week number for the given date. */
export function isoWeekNumber(d: Date): number {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayNum = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - dayNum + 3)
  const firstThursday = new Date(date.getFullYear(), 0, 4)
  const firstDayNum = (firstThursday.getDay() + 6) % 7
  firstThursday.setDate(firstThursday.getDate() - firstDayNum + 3)
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86400000))
}

const WEEKDAY_NAMES_FULL: Record<Lang, string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
}

/** Short "Sep 8–14" style label for the 7-day week starting at `weekStartKey`. */
export function formatWeekRangeLabel(weekStartKey: string, lang: Lang = 'en'): string {
  const [y, m, d] = weekStartKey.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const end = new Date(y, m - 1, d + 6)
  const startMonth = MONTH_NAMES_SHORT[lang][start.getMonth()]
  const endMonth = MONTH_NAMES_SHORT[lang][end.getMonth()]
  if (start.getMonth() === end.getMonth()) {
    return lang === 'en' ? `${startMonth} ${start.getDate()}–${end.getDate()}` : `${start.getDate()}–${end.getDate()} ${startMonth}`
  }
  return lang === 'en'
    ? `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}`
    : `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth}`
}

export function formatFriendlyDate(dateKey: string, lang: Lang = 'en'): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (lang === 'en') {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }
  const weekday = WEEKDAY_NAMES_FULL[lang][date.getDay()]
  const month = MONTH_NAMES[lang][m - 1]
  return lang === 'he' ? `יום ${weekday}, ${d} ב${month} ${y}` : `${weekday}، ${d} ${month} ${y}`
}
