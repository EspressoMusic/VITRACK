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
import { ThankYouPage } from './components/ThankYouPage'
import { activateSubscription, hasOnboarded, isSubscribed, loadPersistedGoals } from './lib/profile'
import { getAllMeals } from './lib/db'
import { computeWeeklyInsights } from './lib/insights'
import { coverageStatus } from './lib/nutrients'
import { maybeNotifyVitaminStatus } from './lib/notifications'

function AppShell() {
  const [tab, setTab] = useState<Tab>('camera')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)
  const bumpRefresh = () => setRefreshSignal((n) => n + 1)

  const panelBg = { camera: 'background-camera', calendar: 'background-calendar', insights: 'background-insights' }[tab]

  useEffect(() => {
    getAllMeals().then((meals) => {
      const { loggedDayCount, ranked, weeklyCompletion } = computeWeeklyInsights(meals)
      const deficientCount = ranked.filter((r) => coverageStatus(r.percent) !== 'good').length
      maybeNotifyVitaminStatus({ weeklyCompletion, deficientCount, loggedDayCount })
    })
  }, [refreshSignal])

  return (
    <div
      className="app-shell relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden"
      style={{ '--panel-bg': `url('/${panelBg}.png')` } as React.CSSProperties}
    >
      <div
        className="sticky top-0 z-20 mx-auto flex w-full max-w-md justify-end px-3 pt-1.5"
        style={{ pointerEvents: 'none' }}
      >
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className="flex h-11 w-11 items-center justify-center transition"
          style={{ pointerEvents: 'auto' }}
        >
          <img src="/icons/settings.png" alt="" className="h-9 w-9 object-contain" />
        </button>
      </div>

      <main className="min-h-0 flex-1 overflow-hidden">
        <div key={tab} className="panel-enter h-full">
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

/** Dev-only paywall bypass for local testing: visit `?unlock=1`. Compiled out of production builds. */
function shouldDevUnlock(): boolean {
  return import.meta.env.DEV && new URLSearchParams(window.location.search).get('unlock') === '1'
}

export default function App() {
  const [onboarded, setOnboarded] = useState(hasOnboarded)
  const [subscribed, setSubscribed] = useState(() => {
    if (shouldDevUnlock()) {
      activateSubscription('yearly')
      return true
    }
    return isSubscribed()
  })
  const [showThankYou, setShowThankYou] = useState(() => window.location.hash === '#thank-you')

  useEffect(() => {
    loadPersistedGoals()
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        {showThankYou ? (
          <ThankYouPage
            onContinue={() => {
              window.location.hash = ''
              setShowThankYou(false)
            }}
          />
        ) : !onboarded ? (
          <OnboardingFlow onComplete={() => setOnboarded(true)} />
        ) : !subscribed ? (
          <PaywallPanel
            onSubscribed={() => {
              window.location.hash = 'thank-you'
              setSubscribed(true)
              setShowThankYou(true)
            }}
          />
        ) : (
          <AppShell />
        )}
      </AuthProvider>
    </ThemeProvider>
  )
}
