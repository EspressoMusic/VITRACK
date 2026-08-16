import { useEffect, useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { NavBar, type Tab } from './components/NavBar'
import { CameraPanel } from './components/CameraPanel'
import { CalendarPanel } from './components/CalendarPanel'
import { InsightsPanel } from './components/InsightsPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { OnboardingFlow } from './components/OnboardingFlow'
import { PaywallPanel } from './components/PaywallPanel'
import { hasOnboarded, isSubscribed, loadPersistedGoals } from './lib/profile'

function AppShell() {
  const [tab, setTab] = useState<Tab>('camera')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)
  const bumpRefresh = () => setRefreshSignal((n) => n + 1)

  const panelBg = { camera: 'background-camera', calendar: 'background-calendar', insights: 'background-insights' }[tab]

  return (
    <div
      className="app-shell relative mx-auto flex h-screen w-full max-w-md flex-col overflow-hidden"
      style={{ '--panel-bg': `url('/${panelBg}.png')` } as React.CSSProperties}
    >
      <div
        className="sticky top-0 z-20 mx-auto flex w-full max-w-md justify-end px-3 pt-3"
        style={{ pointerEvents: 'none' }}
      >
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className="flex h-12 w-12 items-center justify-center transition"
          style={{ pointerEvents: 'auto' }}
        >
          <img src="/icons/settings.png" alt="" className="h-9 w-9" />
        </button>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div key={tab} className="panel-enter">
          {tab === 'camera' && <CameraPanel onLogged={bumpRefresh} />}
          {tab === 'calendar' && <CalendarPanel refreshSignal={refreshSignal} />}
          {tab === 'insights' && <InsightsPanel refreshSignal={refreshSignal} />}
        </div>
      </main>

      <NavBar active={tab} onChange={setTab} />

      {settingsOpen && (
        <SettingsPanel onClose={() => setSettingsOpen(false)} onDataCleared={bumpRefresh} />
      )}
    </div>
  )
}

export default function App() {
  const [onboarded, setOnboarded] = useState(hasOnboarded)
  const [subscribed, setSubscribed] = useState(isSubscribed)

  useEffect(() => {
    loadPersistedGoals()
  }, [])

  if (!onboarded) {
    return (
      <ThemeProvider>
        <OnboardingFlow onComplete={() => setOnboarded(true)} />
      </ThemeProvider>
    )
  }

  if (!subscribed) {
    return (
      <ThemeProvider>
        <PaywallPanel onSubscribed={() => setSubscribed(true)} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  )
}
