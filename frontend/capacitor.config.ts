import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vitrack.app',
  appName: 'Vitrack',
  webDir: 'dist',
  // Live reload on a USB phone: `CAP_LIVE_URL=http://localhost:5180 npx cap sync android` (+ `adb reverse tcp:5180 tcp:5180`).
  // A plain `npx cap sync` drops it again, so shipped builds always load the bundled dist.
  ...(process.env.CAP_LIVE_URL
    ? { server: { url: process.env.CAP_LIVE_URL, cleartext: true }, loggingBehavior: 'production' as const }
    : {}),
  backgroundColor: '#fde3a3',
  android: {
    backgroundColor: '#fde3a3',
  },
  ios: {
    backgroundColor: '#fde3a3',
    contentInset: 'never',
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#fde3a3',
      launchAutoHide: true,
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
}

export default config
