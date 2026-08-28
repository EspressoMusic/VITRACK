import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

export const isNative = Capacitor.isNativePlatform()

/** Matches the status bar to the app's cream background so it doesn't show as a stray black/white strip. */
export async function initNativeChrome() {
  if (!isNative) return
  try {
    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: '#fde3a3' })
    await StatusBar.setOverlaysWebView({ overlay: false })
  } catch {
    // StatusBar plugin is unavailable on web/unsupported platforms — safe to ignore.
  }
}
