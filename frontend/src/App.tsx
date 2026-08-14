import { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { NavBar, type Tab } from './components/NavBar'
import { CameraPanel } from './components/CameraPanel'
import { CalendarPanel } from './components/CalendarPanel'
import { InsightsPanel } from './components/InsightsPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { GearIcon } from './components/icons'

function AppShell() {
  const [tab, setTab] = useState<Tab>('camera')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)
  const bumpRefresh = () => setRefreshSignal((n) => n + 1)

  return (
    <div className="app-shell relative mx-auto flex h-screen w-full max-w-md flex-col overflow-hidden">
      <div
        className="sticky top-0 z-20 mx-auto flex w-full max-w-md justify-end px-3 pt-3"
        style={{ pointerEvents: 'none' }}
      >
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className="flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition"
          style={{ pointerEvents: 'auto', backgroundColor: '#eec978', border: '4px solid #d9a441' }}
        >
          <span style={{ color: 'var(--text-primary)' }}>
            <GearIcon className="h-7 w-7" />
          </span>
        </button>
      </div>

      <main className="flex-1 overflow-y-auto">
        {tab === 'camera' && <CameraPanel onLogged={bumpRefresh} />}
        {tab === 'calendar' && <CalendarPanel refreshSignal={refreshSignal} />}
        {tab === 'insights' && <InsightsPanel refreshSignal={refreshSignal} />}
      </main>

      <NavBar active={tab} onChange={setTab} />

      {settingsOpen && (
        <SettingsPanel onClose={() => setSettingsOpen(false)} onDataCleared={bumpRefresh} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  )
}
