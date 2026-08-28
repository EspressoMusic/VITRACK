import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vitrack.app',
  appName: 'Vitrack',
  webDir: 'dist',
  backgroundColor: '#fde3a3',
  android: {
    backgroundColor: '#fde3a3',
  },
  ios: {
    backgroundColor: '#fde3a3',
    contentInset: 'never',
  },
  server: {
    url: 'http://localhost:5173',
    cleartext: true,
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
