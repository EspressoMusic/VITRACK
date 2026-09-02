import { lazy, Suspense, useEffect, useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import { NavBar, type Tab } from './components/NavBar'
import { CalendarPanel } from './components/CalendarPanel'
import { InsightsPanel } from './components/InsightsPanel'
import { SuperfoodsPanel } from './components/SuperfoodsPanel'
import { NutritionChatModal } from './components/NutritionChatModal'
import { SettingsPanel } from './components/SettingsPanel'
import { OnboardingFlow } from './components/OnboardingFlow'
import { PaywallPanel } from './components/PaywallPanel'
import { ThankYouPage } from './components/ThankYouPage'
import {
  activateSubscription,
  deactivateSubscription,
  devSkipOnboarding,
  hasOnboarded,
  isSubscribed,
  loadPersistedGoals,
} from './lib/profile'
import { getAllMeals } from './lib/db'
import { computeWeeklyInsights } from './lib/insights'
import { coverageStatus } from './lib/nutrients'
import { maybeNotifyVitaminStatus } from './lib/notifications'
import { installButtonClickSounds } from './lib/sound'

// Lazy-loaded so the food-detection model (TensorFlow.js + COCO-SSD, several MB) ships in its
// own chunk instead of blocking the initial app bundle for users who haven't reached this tab yet.
const CameraPanel = lazy(() => import('./components/CameraPanel').then((m) => ({ default: m.CameraPanel })))

function AppShell() {
  const { lang } = useLanguage()
  const [tab, setTab] = useState<Tab>('camera')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)
  const bumpRefresh = () => setRefreshSignal((n) => n + 1)

  const panelBg = {
    camera: 'background-camera',
    calendar: 'background-plain',
    insights: 'background-insights',
    superfoods: 'background-plain',
  }[tab]

  useEffect(() => {
    getAllMeals().then((meals) => {
      const { loggedDayCount, ranked, weeklyCompletion } = computeWeeklyInsights(meals)
      const deficientCount = ranked.filter((r) => coverageStatus(r.percent) !== 'good').length
      maybeNotifyVitaminStatus({ weeklyCompletion, deficientCount, loggedDayCount })
    })
  }, [refreshSignal])

  return (
    <div
      className="app-shell relative mx-auto flex h-svh w-full max-w-md flex-col overflow-hidden"
      style={{ '--panel-bg': `url('/${panelBg}.png?v=3')` } as React.CSSProperties}
    >
      <main className="relative min-h-0 flex-1 overflow-hidden">
        <div key={tab} className="panel-enter h-full">
          {tab === 'camera' && (
            <Suspense fallback={null}>
              <CameraPanel onLogged={bumpRefresh} />
            </Suspense>
          )}
          {tab === 'calendar' && <CalendarPanel refreshSignal={refreshSignal} />}
          {tab === 'insights' && <InsightsPanel refreshSignal={refreshSignal} />}
          {tab === 'superfoods' && <SuperfoodsPanel />}
        </div>

        {settingsOpen && (
          <SettingsPanel
            onClose={() => setSettingsOpen(false)}
            onDataCleared={bumpRefresh}
            onNutrientModeChange={bumpRefresh}
          />
        )}
      </main>

      <NavBar
        active={tab}
        onChange={(next) => {
          setTab(next)
          setSettingsOpen(false)
        }}
        onOpenSettings={() => setSettingsOpen((open) => !open)}
        settingsActive={settingsOpen}
      />

      {chatOpen && <NutritionChatModal lang={lang} onClose={() => setChatOpen(false)} />}
    </div>
  )
}

/** Dev-only paywall bypass for local testing: visit `?unlock=1`. Compiled out of production builds. */
function shouldDevUnlock(): boolean {
  return import.meta.env.DEV && new URLSearchParams(window.location.search).get('unlock') === '1'
}

/** Dev-only: jump straight to the paywall screen for local testing. Visit `?paywall=1`. */
function shouldDevShowPaywall(): boolean {
  return import.meta.env.DEV && new URLSearchParams(window.location.search).get('paywall') === '1'
}

/** Dev-only: jump straight to the onboarding questionnaire for local testing, regardless of
 *  whether it was already completed on this device. Visit `?onboarding=1`. */
function shouldDevShowOnboarding(): boolean {
  return import.meta.env.DEV && new URLSearchParams(window.location.search).get('onboarding') === '1'
}

export default function App() {
  const [onboarded, setOnboarded] = useState(() => {
    if (shouldDevShowOnboarding()) return false
    if (shouldDevUnlock() || shouldDevShowPaywall()) {
      devSkipOnboarding()
      return true
    }
    return hasOnboarded()
  })
  const [subscribed, setSubscribed] = useState(() => {
    if (shouldDevShowPaywall()) {
      deactivateSubscription()
      return false
    }
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

  useEffect(() => installButtonClickSounds(), [])

  return (
    <LanguageProvider>
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
    </LanguageProvider>
  )
}
