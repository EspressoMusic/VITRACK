import { lazy, Suspense, useEffect, useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NavBar, type Tab } from './components/NavBar'
import { CalendarPanel } from './components/CalendarPanel'
import { InsightsPanel } from './components/InsightsPanel'
import { SuperfoodsPanel } from './components/SuperfoodsPanel'
import { ChatPanel } from './components/ChatPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { GearIcon } from './components/icons'
import { NAV_BAR_STRINGS } from './lib/i18n/navBar'
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
import { getAllMeals, getAllWorkouts } from './lib/db'
import { computeWeeklyInsights } from './lib/insights'
import { coverageStatus } from './lib/nutrients'
import { maybeNotifyVitaminStatus } from './lib/notifications'
import { installButtonClickSounds } from './lib/sound'
import { getTodaysBotMood } from './lib/botMood'
import { getBotPersonality } from './lib/botPersonality'
import { shouldShowBotAlertToast, markBotAlertToastSeen } from './lib/botAlertToastSeen'
import { peekShouldSendCheckIn } from './lib/botCheckIn'
import {
  peekPendingChallengeAnnounce,
  peekPendingChallengeCompleted,
  shouldShowChallengeToast,
  markChallengeToastSeen,
} from './lib/challengeAnnounce'
import { BotAlertToast, type BotAlertPayload } from './components/BotAlertToast'

// Lazy-loaded so the food-detection model (TensorFlow.js + COCO-SSD, several MB) ships in its
// own chunk instead of blocking the initial app bundle for users who haven't reached this tab yet.
const CameraPanel = lazy(() => import('./components/CameraPanel').then((m) => ({ default: m.CameraPanel })))

function AppShell() {
  const { lang } = useLanguage()
  const { loading: authLoading } = useAuth()
  const [tab, setTab] = useState<Tab>('camera')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)
  const [weeklyCompletion, setWeeklyCompletion] = useState(0)
  const [botAlert, setBotAlert] = useState(false)
  const [toastAlert, setToastAlert] = useState<BotAlertPayload | null>(null)
  const bumpRefresh = () => setRefreshSignal((n) => n + 1)

  const panelBg = {
    camera: 'background-camera',
    calendar: 'background-plain',
    insights: 'background-insights',
    superfoods: 'background-plain',
    chat: 'background-plain',
  }[tab]

  const navT = NAV_BAR_STRINGS[lang]

  useEffect(() => {
    // Wait for auth to resolve first: getAllMeals() reads from the cloud only once the
    // signed-in user id is known (see db.ts's useCloud), so firing before that resolves
    // would read the (empty) local store and leave the nav badge stuck at 0%.
    if (authLoading) return
    // Also reruns on tab change: panels like CalendarPanel mutate data without bumping
    // refreshSignal, so without this the nav badge can go stale relative to the panel the
    // user is actually looking at.
    Promise.all([getAllMeals(), getAllWorkouts(), getTodaysBotMood()]).then(([meals, workouts, mood]) => {
      const { loggedDayCount, ranked, weeklyCompletion } = computeWeeklyInsights(meals, workouts)
      const deficientCount = ranked.filter((r) => coverageStatus(r.percent) !== 'good').length
      maybeNotifyVitaminStatus({ weeklyCompletion, deficientCount, loggedDayCount })
      setWeeklyCompletion(weeklyCompletion)
      // Same "something to be upset about" condition ChatPanel uses to turn the header red —
      // mirrored here so the chat tab icon can flag it while the user is on a different tab.
      const isAngryMood = getBotPersonality() === 'superAngry' && (!!mood.junkFoodName || mood.challengeBroken)
      // Challenge start/completion greetings are queued by CalendarPanel as one-shot flags for
      // ChatPanel to consume on next open (see challengeAnnounce.ts) — peeked (not consumed)
      // here too, so the bot icon/toast can flag them before the user ever opens chat.
      const startedChallenge = peekPendingChallengeAnnounce()
      const completedChallenge = peekPendingChallengeCompleted()
      // Unprompted check-ins (see botCheckIn.ts) are the third source of a bot-initiated message
      // besides these two — peeked the same way so the badge doesn't miss them.
      const checkInPending = tab !== 'chat' && peekShouldSendCheckIn()
      setBotAlert(isAngryMood || !!startedChallenge || !!completedChallenge || checkInPending)
      // Pop the heads-up card at most once per distinct trigger so it doesn't reappear on every
      // tab switch while the same thing (junk food, broken challenge, pending greeting) stands.
      if (tab === 'chat') {
        // already in the panel — nothing to surface over itself
      } else if (isAngryMood && shouldShowBotAlertToast(mood)) {
        setToastAlert({ kind: 'angry', mood })
        markBotAlertToastSeen(mood)
      } else if (startedChallenge && shouldShowChallengeToast('started', startedChallenge)) {
        setToastAlert({ kind: 'challengeStarted', challengeName: startedChallenge })
        markChallengeToastSeen('started', startedChallenge)
      } else if (completedChallenge && shouldShowChallengeToast('completed', completedChallenge)) {
        setToastAlert({ kind: 'challengeCompleted', challengeName: completedChallenge })
        markChallengeToastSeen('completed', completedChallenge)
      }
    })
  }, [refreshSignal, authLoading, tab])

  // Opening the chat tab means the user is now "in the panel" — dismiss the heads-up card so
  // it doesn't float over the real conversation.
  useEffect(() => {
    if (tab === 'chat') setToastAlert(null)
  }, [tab])

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
          {tab === 'calendar' && <CalendarPanel refreshSignal={refreshSignal} onChallengeUpdate={bumpRefresh} />}
          {tab === 'insights' && <InsightsPanel refreshSignal={refreshSignal} />}
          {tab === 'superfoods' && <SuperfoodsPanel />}
          {tab === 'chat' && <ChatPanel />}
        </div>

        {tab !== 'calendar' && tab !== 'superfoods' && tab !== 'chat' && !settingsOpen && (
          <button
            onClick={() => setSettingsOpen((open) => !open)}
            aria-label={navT.settings}
            aria-pressed={settingsOpen}
            className="nav-tab-transition absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center"
            style={{ color: '#3a2a06' }}
          >
            <GearIcon className="h-5 w-5" strokeWidth={2.2} />
          </button>
        )}

        {settingsOpen && (
          <SettingsPanel
            onClose={() => setSettingsOpen(false)}
            onDataCleared={bumpRefresh}
            onNutrientModeChange={bumpRefresh}
          />
        )}

        {toastAlert && (
          <BotAlertToast
            alert={toastAlert}
            personality={getBotPersonality()}
            onOpenChat={() => {
              setToastAlert(null)
              setTab('chat')
              setSettingsOpen(false)
            }}
            onDismiss={() => setToastAlert(null)}
          />
        )}
      </main>

      <NavBar
        active={tab}
        onChange={(next) => {
          setTab(next)
          setSettingsOpen(false)
        }}
        settingsActive={settingsOpen}
        insightsPercent={weeklyCompletion}
        chatAlert={botAlert && tab !== 'chat'}
      />
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
