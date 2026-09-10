import { useEffect, useMemo, useState } from 'react'
import type { MealEntry, WorkoutEntry } from '../types'
import { addWorkout, deleteWorkout, getAllMeals, getAllWorkouts, updateWorkout } from '../lib/db'
import { buildCalendarGrid, formatFriendlyDate, getWeekDateKeys, shortMonthLabel, toLocalDateKey, todayKey, weekdayLetters } from '../lib/date'
import { EMPTY_MACROS, isMacroTrackingEnabled, sumMacros } from '../lib/macros'
import { useLanguage } from '../contexts/LanguageContext'
import { CALENDAR_PANEL_STRINGS } from '../lib/i18n/calendarPanel'
import type { Lang } from '../lib/i18n/lang'
import { MealDetailModal } from './MealDetailModal'
import { AddGoalModal } from './AddGoalModal'
import { CompletedChallengesModal, type CompletedChallenge } from './CompletedChallengesModal'
import { ChallengeCompletedModal } from './ChallengeCompletedModal'
import { CheckIcon, MedalIcon, PlusIcon } from './icons'
import { resolveFoodEmoji } from '../lib/foodEmoji'

const GRID_COLS = 'grid-cols-7'

/** One weekly challenge, embedded below the calendar card — only one can be active per week
 *  (picked from a quick-start template or custom name) and it's tracked with a 7-day strip
 *  instead of a single done/not-done toggle. */
function WeeklyChallengeCard({
  lang,
  weekDates,
  goals,
  selectedDate,
  onAdd,
  onEdit,
  onToggleDay,
  onShowCompleted,
}: {
  lang: Lang
  weekDates: string[]
  goals: WorkoutEntry[]
  selectedDate: string
  onAdd: () => void
  onEdit: () => void
  onToggleDay: (dateKey: string) => void
  onShowCompleted: () => void
}) {
  const ct = CALENDAR_PANEL_STRINGS[lang]
  const challengeName = goals[0]?.name
  const letters = weekdayLetters(lang)

  return (
    <div
      className="mx-auto flex w-[92%] flex-col overflow-hidden rounded-2xl"
      style={{ border: '3px solid #000000', boxShadow: '0 5px 0 #c9a463' }}
    >
      <div className="relative flex shrink-0 items-center justify-center px-4 py-3" style={{ backgroundColor: '#6b4423' }}>
        <span className="text-xs font-semibold" style={{ color: '#f5deb3' }}>
          {ct.goalsTitle}
        </span>
        <button
          onClick={onShowCompleted}
          aria-label={ct.completedGoalsAriaLabel}
          className="absolute start-3 flex h-6 w-6 items-center justify-center"
          style={{ color: '#f5deb3' }}
        >
          <MedalIcon className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>

      <div
        className="flex flex-col gap-2.5 p-2.5"
        style={{ backgroundColor: '#f6e4bb' }}
      >
        {!challengeName ? (
          <div className="flex flex-col items-center justify-center py-6">
            <button
              onClick={onAdd}
              aria-label={ct.addGoalAriaLabel}
              className="flex h-12 w-12 items-center justify-center rounded-full transition active:translate-y-0.5"
              style={{ backgroundColor: '#6b4423', color: 'white', border: '2px solid #000000' }}
            >
              <PlusIcon className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>
        ) : (
          <>
            <div
              role="button"
              tabIndex={0}
              onClick={onEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onEdit()
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl px-2.5 py-1.5 transition active:scale-[0.98]"
              style={{ backgroundColor: 'var(--surface-cream)', boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}
            >
              <span className="min-w-0 truncate text-center text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {challengeName}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDates.map((dateKey, i) => {
                const done = goals.find((g) => g.date === dateKey)?.done ?? false
                const isSelected = dateKey === selectedDate
                return (
                  <button
                    key={dateKey}
                    onClick={() => onToggleDay(dateKey)}
                    aria-label={`${letters[i]} ${done ? ct.markNotDoneAriaLabel : ct.markDoneAriaLabel}`}
                    aria-pressed={done}
                    className="flex w-full flex-col items-center gap-1"
                  >
                    <span
                      className="text-[9px] font-semibold"
                      style={{ color: isSelected ? 'var(--accent-strong)' : 'var(--text-secondary)' }}
                    >
                      {letters[i]}
                    </span>
                    <span
                      className="flex h-7 w-full items-center justify-center rounded-md transition"
                      style={{
                        backgroundColor: done ? '#6b4423' : 'transparent',
                        color: '#f5deb3',
                        border: `2px solid ${isSelected ? 'var(--accent-strong)' : '#000000'}`,
                      }}
                    >
                      {done && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function CalendarPanel({ refreshSignal }: { refreshSignal: number }) {
  const { lang, dir } = useLanguage()
  const t = CALENDAR_PANEL_STRINGS[lang]
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([])
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [view, setView] = useState<'month' | 'day'>('month')
  const [selectedMeal, setSelectedMeal] = useState<MealEntry | null>(null)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState(false)
  const [showCompletedChallenges, setShowCompletedChallenges] = useState(false)
  const [justCompletedChallenge, setJustCompletedChallenge] = useState<string | null>(null)

  useEffect(() => {
    getAllMeals().then(setMeals)
    getAllWorkouts().then(setWorkouts)
  }, [refreshSignal])

  const mealsByDate = useMemo(() => {
    const map = new Map<string, MealEntry[]>()
    for (const meal of meals) {
      const list = map.get(meal.date) ?? []
      list.push(meal)
      map.set(meal.date, list)
    }
    return map
  }, [meals])

  const goalsByDate = useMemo(() => {
    const map = new Map<string, WorkoutEntry[]>()
    for (const goal of workouts) {
      if (goal.archived) continue
      const list = map.get(goal.date) ?? []
      list.push(goal)
      map.set(goal.date, list)
    }
    return map
  }, [workouts])

  const grid = useMemo(() => buildCalendarGrid(cursor.year, cursor.month), [cursor])
  const weeks = useMemo(() => {
    const rows: Date[][] = []
    for (let i = 0; i < grid.length; i += 7) rows.push(grid.slice(i, i + 7))
    return rows
  }, [grid])
  const today = todayKey()

  const selectedMeals = mealsByDate.get(selectedDate) ?? []
  const trackNutrition = isMacroTrackingEnabled()
  const dayCalories = useMemo(() => sumMacros(selectedMeals.map((m) => m.macros ?? EMPTY_MACROS)).calories, [selectedMeals])

  function changeMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const selectedLabel = selectedDate === today ? t.todayPrefix : formatFriendlyDate(selectedDate, lang)
  const weekDates = useMemo(() => getWeekDateKeys(selectedDate), [selectedDate])
  const weekGoals = useMemo(() => weekDates.flatMap((d) => goalsByDate.get(d) ?? []), [weekDates, goalsByDate])

  const completedChallenges = useMemo(() => {
    const byWeek = new Map<string, WorkoutEntry[]>()
    for (const goal of workouts) {
      const weekStart = getWeekDateKeys(goal.date)[0]
      const list = byWeek.get(weekStart) ?? []
      list.push(goal)
      byWeek.set(weekStart, list)
    }
    const result: CompletedChallenge[] = []
    for (const [weekStart, entries] of byWeek) {
      const doneDates = new Set(entries.filter((e) => e.done).map((e) => e.date))
      if (doneDates.size === 7) result.push({ weekStart, name: entries[0].name })
    }
    return result.sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1))
  }, [workouts])

  async function handleAddGoal(name: string) {
    const entry: WorkoutEntry = {
      id: crypto.randomUUID(),
      date: selectedDate,
      createdAt: new Date().toISOString(),
      name,
      done: false,
    }
    setShowAddGoal(false)
    setWorkouts((prev) => [...prev, entry])
    await addWorkout(entry)
  }

  async function handleUpdateChallengeName(name: string) {
    setEditingChallenge(false)
    const updated = weekGoals.map((g) => ({ ...g, name }))
    const byId = new Map(updated.map((g) => [g.id, g]))
    setWorkouts((prev) => prev.map((g) => byId.get(g.id) ?? g))
    await Promise.all(updated.map((g) => updateWorkout(g)))
  }

  async function handleToggleDayGoal(dateKey: string) {
    const challengeName = weekGoals[0]?.name
    if (!challengeName) return
    const existing = weekGoals.find((g) => g.date === dateKey)
    let updatedEntry: WorkoutEntry
    if (existing) {
      updatedEntry = { ...existing, done: !existing.done }
      setWorkouts((prev) => prev.map((g) => (g.id === existing.id ? updatedEntry : g)))
      await updateWorkout(updatedEntry)
    } else {
      updatedEntry = {
        id: crypto.randomUUID(),
        date: dateKey,
        createdAt: new Date().toISOString(),
        name: challengeName,
        done: true,
      }
      setWorkouts((prev) => [...prev, updatedEntry])
      await addWorkout(updatedEntry)
    }

    if (!updatedEntry.done) return
    const nextGoals = weekGoals.filter((g) => g.date !== dateKey).concat(updatedEntry)
    const allDone = weekDates.every((d) => nextGoals.find((g) => g.date === d)?.done)
    if (!allDone) return

    const archived = nextGoals.map((g) => ({ ...g, archived: true }))
    const byId = new Map(archived.map((g) => [g.id, g]))
    setWorkouts((prev) => prev.map((g) => byId.get(g.id) ?? g))
    setJustCompletedChallenge(challengeName)
    await Promise.all(archived.map((g) => updateWorkout(g)))
  }

  async function handleDeleteChallenge() {
    const ids = weekGoals.map((g) => g.id)
    setWorkouts((prev) => prev.filter((g) => !ids.includes(g.id)))
    await Promise.all(ids.map((id) => deleteWorkout(id)))
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-2.5 pt-5 text-center">
      <div
        className="mx-auto w-[92%] shrink-0 rounded-3xl p-2.5"
        style={{ backgroundColor: '#e5c184', border: '4px solid #000000', boxShadow: '0 7px 0 #c9a463, 0 10px 26px rgba(11,11,11,0.16)' }}
      >
        <div className="relative overflow-hidden">
          <div
            aria-hidden={view !== 'month'}
            style={{
              transform: `translateX(${view === 'day' ? (dir === 'rtl' ? '101%' : '-101%') : '0%'})`,
              transition: 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1)',
              pointerEvents: view === 'month' ? 'auto' : 'none',
            }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <button
                onClick={() => changeMonth(-1)}
                aria-label={t.prevMonthAriaLabel}
                className="flex h-6 w-6 items-center justify-center text-sm"
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
                className="flex h-6 w-6 items-center justify-center text-sm"
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
                    const hasActivity = (mealsByDate.get(key)?.length ?? 0) > 0
                    const isToday = key === today
                    const isSelected = key === selectedDate
                    const background = hasActivity
                      ? undefined
                      : isToday
                        ? 'var(--accent-strong)'
                        : '#f0dcab'
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedDate(key)
                          setView('day')
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

          <div
            className="absolute inset-0 flex flex-col"
            aria-hidden={view !== 'day'}
            style={{
              transform: `translateX(${view === 'day' ? '0%' : dir === 'rtl' ? '-101%' : '101%'})`,
              transition: 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1)',
              pointerEvents: view === 'day' ? 'auto' : 'none',
            }}
          >
            <div className="mb-1.5 flex shrink-0 items-center justify-between">
              <button
                onClick={() => setView('month')}
                aria-label={t.backAriaLabel}
                className="flex h-6 w-6 items-center justify-center text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {dir === 'rtl' ? '›' : '‹'}
              </button>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {selectedLabel}
              </span>
              <span className="h-6 w-6" />
            </div>

            {trackNutrition && (
              <div className="mb-1.5 flex shrink-0 items-center justify-center">
                <span className="text-3xl font-extrabold" style={{ color: '#000000' }}>
                  {Math.round(dayCalories).toLocaleString()}
                </span>
              </div>
            )}

            <div className="thin-scroll flex min-h-0 flex-1 flex-wrap content-start justify-center gap-1.5 overflow-y-auto pe-1 pb-1">
              {selectedMeals.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center">
                  <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {t.noMealsLoggedThisDay}
                  </p>
                </div>
              ) : (
                selectedMeals.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => setSelectedMeal(meal)}
                    aria-label={meal.foods.length > 0 ? meal.foods[0].name : t.mealFallbackName}
                    className="relative flex aspect-square w-[30%] shrink-0 items-center justify-center rounded-lg transition-transform active:translate-y-1 active:shadow-none"
                    style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', boxShadow: '0 3px 0 #000000' }}
                  >
                    <span className="text-3xl leading-none">{resolveFoodEmoji(meal.foods[0]?.name)}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col justify-center pb-20">
        <WeeklyChallengeCard
          lang={lang}
          weekDates={weekDates}
          goals={weekGoals}
          selectedDate={selectedDate}
          onAdd={() => setShowAddGoal(true)}
          onEdit={() => setEditingChallenge(true)}
          onToggleDay={handleToggleDayGoal}
          onShowCompleted={() => setShowCompletedChallenges(true)}
        />
      </div>

      {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}

      {showAddGoal && <AddGoalModal onClose={() => setShowAddGoal(false)} onSave={handleAddGoal} />}

      {editingChallenge && (
        <AddGoalModal
          initialName={weekGoals[0]?.name}
          onClose={() => setEditingChallenge(false)}
          onSave={handleUpdateChallengeName}
          onDelete={() => {
            setEditingChallenge(false)
            handleDeleteChallenge()
          }}
        />
      )}

      {showCompletedChallenges && (
        <CompletedChallengesModal challenges={completedChallenges} onClose={() => setShowCompletedChallenges(false)} />
      )}

      {justCompletedChallenge && (
        <ChallengeCompletedModal
          challengeName={justCompletedChallenge}
          onClose={() => setJustCompletedChallenge(null)}
        />
      )}
    </div>
  )
}
