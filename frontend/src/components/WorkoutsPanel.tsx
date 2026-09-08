import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { WorkoutEntry, WorkoutExercise } from '../types'
import { addWorkout, deleteWorkout, getAllWorkouts, updateWorkout } from '../lib/db'
import { buildCalendarGrid, formatFriendlyDate, shortMonthLabel, todayKey, toLocalDateKey, weekdayLetters } from '../lib/date'
import { useLanguage } from '../contexts/LanguageContext'
import { WORKOUTS_PANEL_STRINGS } from '../lib/i18n/workoutsPanel'
import { CheckIcon, ClockIcon, CloseIcon, PauseIcon, PlayIcon, PlusIcon, RefreshIcon, TrashIcon } from './icons'
import { AddWorkoutModal } from './AddWorkoutModal'
import { playTimerDoneSound } from '../lib/sound'

const GRID_COLS = 'grid-cols-7'
const TIMER_PRESETS = [30, 60, 90, 120]

function exerciseSummary(ex: WorkoutExercise): string {
  return ex.sets && ex.reps ? `${ex.name} ${ex.sets}x${ex.reps}` : ex.name
}

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function RestTimerModal({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage()
  const t = WORKOUTS_PANEL_STRINGS[lang]
  const [duration, setDuration] = useState(60)
  const [remaining, setRemaining] = useState(60)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) {
      setRunning(false)
      playTimerDoneSound()
      if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [running, remaining])

  function selectPreset(seconds: number) {
    setDuration(seconds)
    setRemaining(seconds)
    setRunning(false)
  }

  function toggleRunning() {
    if (remaining <= 0) {
      setRemaining(duration)
      setRunning(true)
      return
    }
    setRunning((r) => !r)
  }

  function reset() {
    setRemaining(duration)
    setRunning(false)
  }

  const done = remaining <= 0

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(60,42,16,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl p-5"
        style={{ backgroundColor: '#e5c184', border: '4px solid #000000', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #000000' }}
      >
        <button
          onClick={onClose}
          aria-label={t.closeAriaLabel}
          className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>

        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          {t.timerModalTitle}
        </h2>

        <span className="text-5xl font-extrabold" style={{ color: done ? 'var(--status-critical)' : '#3a2a06' }}>
          {formatTimer(Math.max(0, remaining))}
        </span>

        {done && (
          <span className="text-xs font-bold" style={{ color: 'var(--status-critical)' }}>
            {t.timeUpMessage}
          </span>
        )}

        <div className="flex gap-1.5">
          {TIMER_PRESETS.map((seconds) => (
            <button
              key={seconds}
              onClick={() => selectPreset(seconds)}
              className="rounded-full px-2.5 py-1 text-xs font-bold"
              style={{
                backgroundColor: duration === seconds ? '#6b4423' : 'var(--surface-cream)',
                color: duration === seconds ? '#f5deb3' : 'var(--text-primary)',
                border: '2px solid #000000',
              }}
            >
              {formatTimer(seconds)}
            </button>
          ))}
        </div>

        <div className="mt-1 flex items-center gap-3">
          <button
            onClick={reset}
            aria-label={t.resetLabel}
            className="flex h-10 w-10 items-center justify-center rounded-full transition active:translate-y-0.5"
            style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)', border: '2px solid #000000' }}
          >
            <RefreshIcon className="h-4 w-4" />
          </button>
          <button
            onClick={toggleRunning}
            aria-label={running ? t.pauseLabel : t.startLabel}
            className="flex h-14 w-14 items-center justify-center rounded-full transition active:translate-y-0.5"
            style={{ backgroundColor: 'var(--accent)', color: 'white', border: '2px solid #000000' }}
          >
            {running ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function WorkoutDatePickerModal({
  selectedDate,
  hasWorkoutOn,
  onSelect,
  onClose,
}: {
  selectedDate: string
  hasWorkoutOn: (key: string) => boolean
  onSelect: (key: string) => void
  onClose: () => void
}) {
  const { lang, dir } = useLanguage()
  const t = WORKOUTS_PANEL_STRINGS[lang]
  const [cursor, setCursor] = useState(() => {
    const [y, m] = selectedDate.split('-').map(Number)
    return { year: y, month: m - 1 }
  })
  const today = todayKey()

  const grid = useMemo(() => buildCalendarGrid(cursor.year, cursor.month), [cursor])
  const weeks = useMemo(() => {
    const rows: Date[][] = []
    for (let i = 0; i < grid.length; i += 7) rows.push(grid.slice(i, i + 7))
    return rows
  }, [grid])

  function changeMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(60,42,16,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 w-full max-w-xs rounded-3xl p-3"
        style={{ backgroundColor: '#e5c184', border: '4px solid #000000', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #000000' }}
      >
        <button
          onClick={onClose}
          aria-label={t.closeAriaLabel}
          className="absolute end-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>

        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={() => changeMonth(-1)}
            aria-label={t.prevMonthAriaLabel}
            className="flex h-7 w-7 items-center justify-center text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            {dir === 'rtl' ? '›' : '‹'}
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {shortMonthLabel(cursor.year, cursor.month, lang)}
          </span>
          <button
            onClick={() => changeMonth(1)}
            aria-label={t.nextMonthAriaLabel}
            className="flex h-7 w-7 items-center justify-center text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            {dir === 'rtl' ? '‹' : '›'}
          </button>
        </div>

        <div className={`mb-1 grid ${GRID_COLS} gap-0.5 text-center text-[10px] font-medium`}>
          {weekdayLetters(lang).map((w, i) => (
            <span key={i} style={{ color: '#000000' }}>
              {w}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-0.5">
          {weeks.map((week) => (
            <div key={toLocalDateKey(week[0])} className={`grid ${GRID_COLS} items-center gap-0.5`}>
              {week.map((date) => {
                const key = toLocalDateKey(date)
                const inMonth = date.getMonth() === cursor.month
                const hasActivity = hasWorkoutOn(key)
                const isToday = key === today
                const isSelected = key === selectedDate
                const background = hasActivity ? undefined : isToday ? 'var(--accent-strong)' : '#f0dcab'
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onSelect(key)
                      onClose()
                    }}
                    className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs font-semibold transition ${hasActivity ? 'calendar-day-gold' : ''}`}
                    style={{
                      color: hasActivity ? '#3a2a06' : isToday ? '#ffffff' : inMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                      background,
                      border: isSelected ? '4px solid #000000' : '3px solid #000000',
                      opacity: inMonth ? 1 : 0.4,
                    }}
                  >
                    <span className="leading-none">{date.getDate()}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

export function WorkoutsPanel({ refreshSignal }: { refreshSignal: number }) {
  const { lang, dir } = useLanguage()
  const t = WORKOUTS_PANEL_STRINGS[lang]
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<WorkoutEntry | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [timerOpen, setTimerOpen] = useState(false)

  useEffect(() => {
    getAllWorkouts().then((all) => {
      setWorkouts(all)
      setLoaded(true)
    })
  }, [refreshSignal])

  const workoutsByDate = useMemo(() => {
    const map = new Map<string, WorkoutEntry[]>()
    for (const w of workouts) {
      const list = map.get(w.date) ?? []
      list.push(w)
      map.set(w.date, list)
    }
    return map
  }, [workouts])

  const today = todayKey()
  const dayWorkouts = workoutsByDate.get(selectedDate) ?? []
  const selectedLabel = selectedDate === today ? t.todayPrefix : formatFriendlyDate(selectedDate, lang)
  const allDone = dayWorkouts.length > 0 && dayWorkouts.every((w) => w.done)

  function changeDay(delta: number) {
    setSelectedDate((key) => {
      const [y, m, d] = key.split('-').map(Number)
      return toLocalDateKey(new Date(y, m - 1, d + delta))
    })
  }

  async function handleSaveWorkout(name: string, exercises: WorkoutExercise[]) {
    const entry: WorkoutEntry = {
      id: crypto.randomUUID(),
      date: selectedDate,
      createdAt: new Date().toISOString(),
      name,
      done: false,
      exercises,
    }
    setShowAddModal(false)
    setWorkouts((prev) => [...prev, entry])
    await addWorkout(entry)
  }

  async function handleUpdateWorkout(name: string, exercises: WorkoutExercise[]) {
    if (!editingWorkout) return
    const updated: WorkoutEntry = { ...editingWorkout, name, exercises }
    setEditingWorkout(null)
    setWorkouts((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
    await updateWorkout(updated)
  }

  async function handleToggle(entry: WorkoutEntry) {
    const updated = { ...entry, done: !entry.done }
    setWorkouts((prev) => prev.map((w) => (w.id === entry.id ? updated : w)))
    await updateWorkout(updated)
  }

  async function handleDelete(id: string) {
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
    await deleteWorkout(id)
  }

  if (!loaded) return null

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-20 pt-12 text-center">
      <div
        className="mx-auto flex w-[80%] shrink-0 items-center justify-between rounded-3xl p-2.5"
        style={{ backgroundColor: '#e5c184', border: '4px solid #000000', boxShadow: '0 7px 0 #c9a463, 0 10px 26px rgba(11,11,11,0.16)' }}
      >
        <button
          onClick={() => changeDay(-1)}
          aria-label={t.prevDayAriaLabel}
          className="flex h-7 w-7 items-center justify-center text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          {dir === 'rtl' ? '›' : '‹'}
        </button>
        <button
          onClick={() => setPickerOpen(true)}
          aria-label={t.openDatePickerAriaLabel}
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {selectedLabel}
        </button>
        <button
          onClick={() => changeDay(1)}
          aria-label={t.nextDayAriaLabel}
          className="flex h-7 w-7 items-center justify-center text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          {dir === 'rtl' ? '‹' : '›'}
        </button>
      </div>

      {allDone && (
        <p className="mt-3 shrink-0 text-[13px] font-bold" style={{ color: 'var(--accent-strong)' }}>
          {t.allDoneMessage}
        </p>
      )}

      <div className="thin-scroll mt-8 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-0.5 pb-1">
        {dayWorkouts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              {t.noWorkoutsThisDay}
            </p>
          </div>
        ) : (
          dayWorkouts.map((w) => (
            <div
              key={w.id}
              role="button"
              tabIndex={0}
              onClick={() => setEditingWorkout(w)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setEditingWorkout(w)
                }
              }}
              className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-start transition active:scale-[0.98] ${w.done ? 'calendar-day-gold gold-sparkle-slow' : ''}`}
              style={{
                backgroundColor: w.done ? undefined : 'var(--surface-cream)',
                border: '2px solid #000000',
                boxShadow: w.done ? undefined : '0 2px 0 #000000',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggle(w)
                }}
                aria-label={w.done ? t.markNotDoneAriaLabel : t.markDoneAriaLabel}
                aria-pressed={w.done}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition"
                style={{ backgroundColor: w.done ? '#6b4423' : 'transparent', color: '#f5deb3', border: '2px solid #000000' }}
              >
                {w.done && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />}
              </button>
              <span
                className="min-w-0 flex-1 truncate text-start text-[15px] font-medium"
                style={{ color: 'var(--text-primary)', opacity: w.done ? 0.6 : 1 }}
              >
                {w.name}
              </span>
              {w.exercises && w.exercises.length > 0 && (
                <span
                  className="pointer-events-none absolute inset-x-12 truncate text-center text-[13px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {w.exercises.map(exerciseSummary).join(' · ')}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(w.id)
                }}
                aria-label={t.deleteAriaLabel}
                className="flex h-6 w-6 shrink-0 items-center justify-center"
                style={{ color: 'var(--status-critical)' }}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mx-auto mt-2 flex shrink-0 items-center gap-3">
        <button
          onClick={() => setTimerOpen(true)}
          aria-label={t.timerAriaLabel}
          className="flex h-10 w-10 items-center justify-center rounded-full transition active:translate-y-0.5"
          style={{ backgroundColor: 'var(--surface-cream)', color: '#3a2a06', border: '2px solid #000000' }}
        >
          <ClockIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          aria-label={t.addAriaLabel}
          className="flex h-12 w-12 items-center justify-center rounded-full transition active:translate-y-0.5"
          style={{ backgroundColor: 'var(--accent)', color: 'white', border: '2px solid #000000' }}
        >
          <PlusIcon className="h-5 w-5" strokeWidth={3} />
        </button>
      </div>

      {timerOpen && <RestTimerModal onClose={() => setTimerOpen(false)} />}

      {showAddModal && <AddWorkoutModal onClose={() => setShowAddModal(false)} onSave={handleSaveWorkout} />}

      {editingWorkout && (
        <AddWorkoutModal
          initialName={editingWorkout.name}
          initialExercises={editingWorkout.exercises ?? []}
          onClose={() => setEditingWorkout(null)}
          onSave={handleUpdateWorkout}
        />
      )}

      {pickerOpen && (
        <WorkoutDatePickerModal
          selectedDate={selectedDate}
          hasWorkoutOn={(key) => (workoutsByDate.get(key)?.length ?? 0) > 0}
          onSelect={setSelectedDate}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}
