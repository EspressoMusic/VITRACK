const PREF_KEY = 'vitrack:notificationsEnabled'
const LAST_NOTIFIED_KEY = 'vitrack:lastVitaminNotification'

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied'
  return Notification.permission
}

export function getNotificationPref(): boolean {
  return localStorage.getItem(PREF_KEY) === 'true'
}

export function setNotificationPref(enabled: boolean): void {
  localStorage.setItem(PREF_KEY, String(enabled))
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied'
  return Notification.requestPermission()
}

/** Fires at most one local reminder per calendar day, summarizing this week's vitamin coverage. */
export function maybeNotifyVitaminStatus(params: { weeklyCompletion: number; deficientCount: number; loggedDayCount: number }): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted' || !getNotificationPref()) return
  if (params.loggedDayCount === 0) return

  const todayKey = new Date().toISOString().slice(0, 10)
  if (localStorage.getItem(LAST_NOTIFIED_KEY) === todayKey) return
  localStorage.setItem(LAST_NOTIFIED_KEY, todayKey)

  const title =
    params.deficientCount === 0 ? "You're on track!" : `${params.deficientCount} nutrient${params.deficientCount === 1 ? '' : 's'} running low`
  const body =
    params.deficientCount === 0
      ? `Weekly completion at ${params.weeklyCompletion}%. Keep it up.`
      : `Weekly completion at ${params.weeklyCompletion}%. Open Vitrack to see what's missing.`

  new Notification(title, { body, icon: '/icons/lemon.png' })
}
