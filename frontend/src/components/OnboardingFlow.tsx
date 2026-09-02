import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ActivityLevel, DietType, NutrientAmounts, OnboardingProfile, Sex, WeightGoal } from '../types'
import { computeNutrientGoals } from '../lib/goals'
import { completeOnboarding } from '../lib/profile'
import { NUTRIENT_MAP, NUTRIENTS, coverageStatus } from '../lib/nutrients'
import { CORE_NUTRIENT_COLOR } from '../lib/nutrientColors'
import { playConfirmSound, playTapSound } from '../lib/sound'
import { useLanguage } from '../contexts/LanguageContext'
import { ONBOARDING_STRINGS } from '../lib/i18n/onboarding'
import { NUTRIENT_CONTENT } from '../lib/i18n/nutrientContent'
import { CAMERA_PANEL_STRINGS } from '../lib/i18n/cameraPanel'
import { ActivityIcon, CakeIcon, CameraIcon, LeafIcon, LockIcon, RulerIcon, ScaleIcon, SparkleIcon, TargetIcon, UserIcon } from './icons'
import { STATUS_VAR, STATUS_SOFT_VAR } from './StatusDot'

type Step = 'welcome' | 'age' | 'sex' | 'weight' | 'height' | 'activity' | 'diet' | 'goal' | 'calculating' | 'summary'
type OnboardingStrings = (typeof ONBOARDING_STRINGS)['en']

const STEP_ORDER: Step[] = ['welcome', 'age', 'sex', 'weight', 'height', 'activity', 'diet', 'goal', 'calculating', 'summary']
const PROGRESS_STEPS: Step[] = ['age', 'sex', 'weight', 'height', 'activity', 'diet', 'goal']

const ACTIVITY_IDS: ActivityLevel[] = ['sedentary', 'moderate', 'active']
const DIET_IDS: DietType[] = ['omnivore', 'pescatarian', 'vegetarian', 'vegan']
const SEX_IDS: Sex[] = ['female', 'male', 'unspecified']
const GOAL_IDS: WeightGoal[] = ['lose', 'maintain', 'gain']

interface DraftProfile {
  age: string
  sex: Sex | null
  weightKg: string
  heightCm: string
  activityLevel: ActivityLevel | null
  diet: DietType | null
  goal: WeightGoal | null
}

const EMPTY_DRAFT: DraftProfile = {
  age: '',
  sex: null,
  weightKg: '',
  heightCm: '',
  activityLevel: null,
  diet: null,
  goal: null,
}

function isValid(step: Step, d: DraftProfile): boolean {
  switch (step) {
    case 'age': {
      const n = Number(d.age)
      return Number.isFinite(n) && n >= 18 && n <= 100
    }
    case 'sex':
      return d.sex !== null
    case 'weight': {
      const n = Number(d.weightKg)
      return Number.isFinite(n) && n >= 30 && n <= 250
    }
    case 'height': {
      const n = Number(d.heightCm)
      return Number.isFinite(n) && n >= 100 && n <= 230
    }
    case 'activity':
      return d.activityLevel !== null
    case 'diet':
      return d.diet !== null
    case 'goal':
      return d.goal !== null
    default:
      return true
  }
}

function draftToProfile(d: DraftProfile): OnboardingProfile | null {
  if (!d.sex || !d.activityLevel || !d.diet || !d.goal) return null
  const age = Number(d.age)
  const weightKg = Number(d.weightKg)
  const heightCm = Number(d.heightCm)
  if (!Number.isFinite(age) || !Number.isFinite(weightKg) || !Number.isFinite(heightCm)) return null
  return { age, sex: d.sex, weightKg, heightCm, activityLevel: d.activityLevel, diet: d.diet, goal: d.goal }
}

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { lang, dir } = useLanguage()
  const t = ONBOARDING_STRINGS[lang]
  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft] = useState<DraftProfile>(EMPTY_DRAFT)
  const [continuePulse, setContinuePulse] = useState(0)
  const step = STEP_ORDER[stepIndex]
  const canContinue = isValid(step, draft)

  const previewProfile = step === 'calculating' || step === 'summary' ? draftToProfile(draft) : null
  const previewGoals = previewProfile ? computeNutrientGoals(previewProfile) : null

  function goNext() {
    if (step === 'summary') {
      const profile = draftToProfile(draft)
      if (!profile) return
      completeOnboarding(profile)
      onComplete()
      return
    }
    setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1))
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  // Auto-advance past the "calculating" step — a deliberate short pause so the
  // personalization feels earned rather than instant, then reveal the reward.
  useEffect(() => {
    if (step !== 'calculating') return
    const t = setTimeout(() => setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1)), 1600)
    return () => clearTimeout(t)
  }, [step])

  return (
    <div
      dir={dir}
      className="relative mx-auto flex h-svh w-full max-w-md flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--surface-0)',
        backgroundImage: "url('/background-onboarding.png?v=3')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="flex items-center gap-3 px-5 pt-3">
        {step !== 'welcome' && step !== 'calculating' && step !== 'summary' ? (
          <button
            onClick={goBack}
            aria-label={t.backAriaLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.5)', color: 'var(--text-primary)' }}
          >
            {dir === 'rtl' ? '›' : '‹'}
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}
        <div className="flex flex-1 justify-center gap-1.5">
          {PROGRESS_STEPS.map((s) => (
            <span
              key={s}
              className="h-1.5 w-6 rounded-full transition-colors"
              style={{
                backgroundColor:
                  STEP_ORDER.indexOf(s) <= STEP_ORDER.indexOf(step) ? 'var(--accent)' : 'rgba(11,11,11,0.12)',
              }}
            />
          ))}
        </div>
        <div className="h-9 w-9" />
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pt-2 pb-24">
        <div key={step} className="step-enter flex min-h-0 flex-1 flex-col">
          {step === 'welcome' && <WelcomeStep t={t} />}
          {step === 'age' && <AgeStep t={t} value={draft.age} onChange={(age) => setDraft((d) => ({ ...d, age }))} />}
          {step === 'sex' && <SexStep t={t} value={draft.sex} onChange={(sex) => setDraft((d) => ({ ...d, sex }))} />}
          {step === 'weight' && (
            <WeightStep t={t} value={draft.weightKg} onChange={(weightKg) => setDraft((d) => ({ ...d, weightKg }))} />
          )}
          {step === 'height' && (
            <HeightStep t={t} value={draft.heightCm} onChange={(heightCm) => setDraft((d) => ({ ...d, heightCm }))} />
          )}
          {step === 'activity' && (
            <ActivityStep
              t={t}
              value={draft.activityLevel}
              onChange={(activityLevel) => setDraft((d) => ({ ...d, activityLevel }))}
            />
          )}
          {step === 'diet' && (
            <DietStep t={t} value={draft.diet} onChange={(diet) => setDraft((d) => ({ ...d, diet }))} />
          )}
          {step === 'goal' && (
            <GoalStep t={t} value={draft.goal} onChange={(goal) => setDraft((d) => ({ ...d, goal }))} />
          )}
          {step === 'calculating' && <CalculatingStep t={t} />}
          {step === 'summary' && <SummaryStep t={t} goals={previewGoals} />}
        </div>
      </main>

      {step !== 'calculating' && (
        <div className="absolute inset-x-0 bottom-0 px-6 pb-9 pt-8">
          <button
            key={continuePulse}
            onClick={() => {
              if (!canContinue) return
              playConfirmSound()
              setContinuePulse((p) => p + 1)
              goNext()
            }}
            disabled={!canContinue}
            className={`block mx-auto w-40 rounded-full py-3.5 text-base font-semibold text-white transition ${continuePulse > 0 ? 'tap-effect' : ''} ${step === 'welcome' ? 'welcome-cta-glow' : ''}`}
            style={{
              backgroundColor: canContinue ? 'var(--accent-strong)' : '#e8d9a6',
              border: '2px solid #000000', boxShadow: '0 2px 0 #000000',
            }}
          >
            {step === 'welcome' ? t.welcomeCta : step === 'summary' ? t.summaryCta : t.continueCta}
          </button>
        </div>
      )}
    </div>
  )
}

function StepCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div
      className="flex w-full max-w-xs flex-col items-center gap-1.5 rounded-3xl px-5 py-3 text-center"
      style={{
        backgroundColor: '#e5c184',
        border: '2px solid #000000',
        boxShadow: '0 10px 26px rgba(11,11,11,0.16)',
      }}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
      >
        {icon}
      </span>
      <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs leading-snug" style={{ color: 'var(--text-primary)' }}>
          {subtitle}
        </p>
      )}
      <div className="mt-1 flex w-full flex-col items-center gap-2">{children}</div>
    </div>
  )
}

const WHEEL_ITEM_H = 42
const WHEEL_VISIBLE_ROWS = 3

function WheelPicker({
  value,
  onChange,
  unit,
  min,
  max,
  initial,
}: {
  value: string
  onChange: (v: string) => void
  unit: string
  min: number
  max: number
  initial: number
}) {
  const numbers = useState(() => Array.from({ length: max - min + 1 }, (_, i) => min + i))[0]
  const parsed = value === '' ? NaN : Math.round(Number(value))
  const startValue = Math.min(max, Math.max(min, Number.isFinite(parsed) ? parsed : initial))
  const startIndex = startValue - min
  const containerRef = useRef<HTMLDivElement>(null)
  const [highlightIdx, setHighlightIdx] = useState(startIndex)
  const settleTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = startIndex * WHEEL_ITEM_H
    if (value === '') onChange(String(numbers[startIndex]))
    // Only run once, on mount — later updates come from the user's own scrolling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function commit(idx: number) {
    const next = numbers[idx]
    if (String(next) !== value) onChange(String(next))
  }

  function handleScroll() {
    const el = containerRef.current
    if (!el) return
    const idx = Math.min(numbers.length - 1, Math.max(0, Math.round(el.scrollTop / WHEEL_ITEM_H)))
    setHighlightIdx(idx)
    if (settleTimer.current) window.clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(() => {
      el.scrollTo({ top: idx * WHEEL_ITEM_H, behavior: 'smooth' })
      commit(idx)
    }, 120)
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative" style={{ height: WHEEL_ITEM_H * WHEEL_VISIBLE_ROWS, width: 108 }}>
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            backgroundColor: 'var(--accent-soft)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 rounded-lg"
          style={{
            top: WHEEL_ITEM_H,
            height: WHEEL_ITEM_H,
            backgroundColor: 'var(--surface-cream)',
            border: '1.5px solid var(--accent-strong)',
          }}
        />
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="wheel-scroll relative z-10 h-full snap-y snap-mandatory overflow-y-scroll"
        >
          <div style={{ height: WHEEL_ITEM_H }} />
          {numbers.map((n, i) => (
            <div
              key={n}
              className="flex snap-center items-center justify-center text-2xl font-semibold transition-opacity"
              style={{ height: WHEEL_ITEM_H, color: 'var(--text-primary)', opacity: i === highlightIdx ? 1 : 0.35 }}
            >
              {n}
            </div>
          ))}
          <div style={{ height: WHEEL_ITEM_H }} />
        </div>
      </div>
      <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
        {unit}
      </span>
    </div>
  )
}

function ChoiceButton({
  selected,
  onClick,
  label,
  description,
  compact,
}: {
  selected: boolean
  onClick: () => void
  label: string
  description?: string
  compact?: boolean
}) {
  const [pulse, setPulse] = useState(0)
  return (
    <button
      key={pulse}
      onClick={() => {
        playTapSound()
        setPulse((p) => p + 1)
        onClick()
      }}
      className={`flex flex-col items-start gap-0.5 rounded-2xl text-start transition ${compact ? 'px-3.5 py-2' : 'px-4 py-1.5'} ${pulse > 0 ? 'tap-effect' : ''}`}
      style={{
        backgroundColor: selected ? 'var(--accent-soft)' : 'var(--surface-cream)',
        border: selected ? '2px solid var(--accent-strong)' : '1px solid var(--border-strong)',
      }}
    >
      <span
        className={`font-semibold leading-tight ${compact ? 'text-[14px]' : 'text-sm'}`}
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
      </span>
      {description && (
        <span className={`leading-tight ${compact ? 'text-[12px]' : 'text-xs'}`} style={{ color: 'var(--text-secondary)' }}>
          {description}
        </span>
      )}
    </button>
  )
}

const LETTER_STAGGER_MS = 75

function AnimatedLetters({
  text,
  startIndex,
  letterStyle,
  letterClassName = 'letter-reveal',
}: {
  text: string
  startIndex: number
  letterStyle?: React.CSSProperties
  letterClassName?: string
}) {
  // Each letter is its own inline-block span (for the stagger animation), which lets the
  // browser wrap the line between any two letters — including mid-word. Grouping each word's
  // letters under a nowrap wrapper keeps line breaks at word boundaries, like normal text.
  const chunks = text.match(/\S+|\s+/g) ?? []
  let pos = 0
  return (
    <>
      {chunks.map((chunk) => {
        const start = pos
        pos += chunk.length
        if (/^\s/.test(chunk)) {
          return (
            <span key={startIndex + start} style={{ whiteSpace: 'pre-wrap' }}>
              {chunk}
            </span>
          )
        }
        return (
          <span key={startIndex + start} style={{ whiteSpace: 'nowrap' }}>
            {chunk.split('').map((ch, i) => (
              <span
                key={startIndex + start + i}
                className={letterClassName}
                style={{
                  whiteSpace: 'pre',
                  animationDelay: `${(startIndex + start + i) * LETTER_STAGGER_MS}ms`,
                  ...letterStyle,
                }}
              >
                {ch}
              </span>
            ))}
          </span>
        )
      })}
    </>
  )
}

type MiniScreen = 'off' | 'home' | 'loading' | 'scan' | 'result' | 'insights'
const OFF_MS = 650
const HOME_MS = 900
const LOADING_MS = 450
const SCAN_HOLD_MS = 2200
const RESULT_HOLD_MS = 2900
const INSIGHTS_HOLD_MS = 2600
const MINI_NUTRIENTS: { id: 'vitaminC' | 'vitaminD'; percent: number }[] = [
  { id: 'vitaminC', percent: 82 },
  { id: 'vitaminD', percent: 54 },
]
const MINI_INSIGHTS_ROWS: { id: 'vitaminD' | 'vitaminC' | 'iron'; percent: number }[] = [
  { id: 'vitaminD', percent: 54 },
  { id: 'vitaminC', percent: 78 },
  { id: 'iron', percent: 96 },
]
const WEEKLY_GOAL_PERCENT = 74

type ChipNutrientId = 'vitaminA' | 'vitaminC' | 'vitaminD' | 'vitaminB6' | 'vitaminB9' | 'vitaminB12' | 'calcium' | 'iron'
const VITAMIN_CHIPS: {
  id: ChipNutrientId
  top?: string
  bottom?: string
  start?: string
  end?: string
  rotate: number
  duration: string
  delay: string
}[] = [
  { id: 'vitaminC', top: '2%', start: '-10%', rotate: -6, duration: '4.8s', delay: '0s' },
  { id: 'vitaminD', top: '2%', end: '-9%', rotate: 5, duration: '5.6s', delay: '0.6s' },
  { id: 'calcium', top: '31%', start: '-12%', rotate: 3, duration: '5.3s', delay: '0.7s' },
  { id: 'vitaminA', top: '31%', end: '-13%', rotate: 6, duration: '4.6s', delay: '0.3s' },
  { id: 'vitaminB12', top: '61%', start: '-14%', rotate: -4, duration: '5.2s', delay: '1.1s' },
  { id: 'iron', top: '61%', end: '-11%', rotate: -3, duration: '5.4s', delay: '1.0s' },
  { id: 'vitaminB9', top: '90%', start: '-8%', rotate: 4, duration: '5.9s', delay: '0.9s' },
  { id: 'vitaminB6', top: '90%', end: '-10%', rotate: -5, duration: '5.1s', delay: '1.4s' },
]

/** Scan-corner bracket — matches the gold focus corners drawn over the real live viewfinder. */
function ScanCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const vertical = pos[0] === 't' ? 'borderTop' : 'borderBottom'
  const horizontal = pos[1] === 'l' ? 'borderInlineStart' : 'borderInlineEnd'
  return (
    <span
      className="status-pulse absolute h-5 w-5"
      style={{
        top: pos[0] === 't' ? 8 : undefined,
        bottom: pos[0] === 'b' ? 8 : undefined,
        insetInlineStart: pos[1] === 'l' ? 8 : undefined,
        insetInlineEnd: pos[1] === 'r' ? 8 : undefined,
        [vertical]: '4px solid #f4c542',
        [horizontal]: '4px solid #f4c542',
      }}
      aria-hidden
    />
  )
}

/** A scaled-down but faithful copy of NutrientFillBar's pill — same border, wave texture,
 *  gloss highlight and gradient, just resized to fit the onboarding phone mockup. */
function MiniFillBar({ percent }: { percent: number }) {
  return (
    <div
      className="relative h-[36px] w-full shrink-0 overflow-hidden rounded-full"
      style={{
        border: '3px solid #000000',
        backgroundColor: 'rgba(255,255,255,0.18)',
        boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.5), inset 0 -5px 10px rgba(0,0,0,0.08)',
      }}
    >
      <div
        className="welcome-jar-fill-h absolute inset-y-0 start-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(90deg, #a3e8fb 0%, #5fc9f3 55%, #0ea5e9 100%)', '--bar-target': `${percent}%` } as React.CSSProperties}
      >
        <div className="liquid-wave-layer-v absolute inset-y-0 start-0" aria-hidden>
          <svg viewBox="0 0 20 400" preserveAspectRatio="none" className="liquid-wave-svg-v block h-[200%] w-4">
            <path d="M10 0 C 20 50, 0 150, 10 200 C 20 250, 0 350, 10 400 L20 400 L20 0 Z" fill="rgba(255,255,255,0.55)" />
          </svg>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -start-1 top-0.5 h-8 w-6 rounded-full"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.85), transparent 70%)', transform: 'rotate(15deg)' }}
      />
      <span
        className="relative z-10 flex h-full w-full items-center justify-center text-sm font-bold"
        style={{ color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.35)' }}
      >
        {percent}%
      </span>
    </div>
  )
}

/** A scaled-down but faithful copy of NutrientBar's row card. */
function MiniNutrientRow({ id, percent }: { id: 'vitaminC' | 'vitaminD'; percent: number }) {
  const { lang } = useLanguage()
  return (
    <div className="w-full rounded-xl px-[10px] py-[6px]" style={{ backgroundColor: '#fdf6e8', boxShadow: '0 2px 6px rgba(26,26,25,0.14)' }}>
      <div className="mb-[4px] flex items-baseline justify-between gap-[8px]">
        <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {NUTRIENT_CONTENT[lang][id].name}
        </span>
        <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
          {percent}%
        </span>
      </div>
      <div className="h-[6px] w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surface-2)' }}>
        <span
          className="welcome-mini-bar-fill block h-full rounded-full"
          style={{ backgroundColor: CORE_NUTRIENT_COLOR[id], '--bar-target': `${percent}%` } as React.CSSProperties}
        />
      </div>
    </div>
  )
}

/** A scaled-down but faithful copy of WeeklyGoalGlass — same border, liquid wave texture,
 *  gloss highlight and gradient fill, just resized to fit the onboarding phone mockup. */
function MiniWeeklyGoalGlass({ percent }: { percent: number }) {
  const lightFill = percent < 45
  return (
    <div
      className="relative mx-auto flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        border: '3px solid #000000',
        backgroundColor: 'rgba(255,255,255,0.18)',
        boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -6px 12px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.12)',
      }}
    >
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: `${percent}%`, background: 'linear-gradient(180deg, #a3e8fb 0%, #5fc9f3 45%, #0ea5e9 100%)' }}
      >
        <div className="liquid-wave-layer absolute inset-x-0 top-0" aria-hidden>
          <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="liquid-wave-svg block h-3 w-[200%]">
            <path d="M0 10 C 50 20, 150 0, 200 10 C 250 20, 350 0, 400 10 L400 20 L0 20 Z" fill="rgba(255,255,255,0.55)" />
          </svg>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -start-2 top-3 h-14 w-6 rounded-full"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.85), transparent 70%)', transform: 'rotate(15deg)' }}
      />
      <span
        className="relative z-10 text-sm font-bold"
        style={{ color: lightFill ? 'var(--text-primary)' : 'white', textShadow: lightFill ? 'none' : '0 1px 3px rgba(0,0,0,0.35)' }}
      >
        {percent}%
      </span>
    </div>
  )
}

/** A scaled-down but faithful copy of NutrientRow — cream card, thin border, and a status-colored
 *  progress bar, matching the real insights list instead of a flat nutrient accent color. */
function MiniInsightsRow({ id, percent }: { id: 'vitaminD' | 'vitaminC' | 'iron'; percent: number }) {
  const { lang } = useLanguage()
  const status = coverageStatus(percent)
  return (
    <div
      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5"
      style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)', boxShadow: '0 4px 10px rgba(26,26,25,0.14)' }}
    >
      <span className="w-[68px] shrink-0 truncate text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {NUTRIENT_CONTENT[lang][id].name}
      </span>
      <span className="block h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: STATUS_SOFT_VAR[status] }}>
        <span className="block h-full rounded-full" style={{ width: `${Math.min(100, percent)}%`, backgroundColor: STATUS_VAR[status] }} />
      </span>
    </div>
  )
}

const MINI_CONFETTI_COLORS = ['#f5b942', '#e8952c', '#ffd166', '#f28c28', '#ffcb69', '#d9a441']

/** A small-scale confetti burst confined to the phone's own mini screen, celebrating the
 *  result reveal — reuses the app's confetti look but sized for a 204x368 mockup instead
 *  of the full viewport. */
function MiniConfetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1.3 + Math.random() * 0.9,
        color: MINI_CONFETTI_COLORS[i % MINI_CONFETTI_COLORS.length],
        width: 4 + Math.random() * 4,
        height: 6 + Math.random() * 5,
      })),
    []
  )
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="mini-confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

/** A small fingertip that taps down onto a button right as its own press animation lands,
 *  timed to the same phase duration so the two stay in sync. */
function TapFinger({ durationMs }: { durationMs: number }) {
  return (
    <span
      className="finger-tap text-2xl"
      style={{ insetInlineEnd: 8, bottom: -14, animationDuration: `${durationMs}ms` }}
      aria-hidden
    >
      👆
    </span>
  )
}

const WELCOME_SCAN_SCALE = 0.56
const MOCKUP_WIDTH = 340
const MOCKUP_HEIGHT = 500
// The floating vitamin chips bleed past the phone frame via negative insets (see VITAMIN_CHIPS)
// — this is how far left/right that bleed reaches at its most extreme, so we know the true
// on-screen footprint to fit within the viewport, not just the frame itself.
const MOCKUP_BLEED_LEFT = 0.14
const MOCKUP_BLEED_RIGHT = 0.13
const MOCKUP_FULL_BLEED_WIDTH = MOCKUP_WIDTH * (1 + MOCKUP_BLEED_LEFT + MOCKUP_BLEED_RIGHT)

function WelcomeScanAnimation() {
  const { lang } = useLanguage()
  const camera = CAMERA_PANEL_STRINGS[lang]
  const [screen, setScreen] = useState<MiniScreen>('off')
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(WELCOME_SCAN_SCALE)

  // Real phones are often narrower than whatever desktop window this got designed against, and
  // the mockup's fixed-pixel size doesn't shrink with the root font-size the way the rest of the
  // layout does — so on narrow viewports the bleeding vitamin chips were getting clipped by the
  // page's overflow:hidden. Measuring the actual available width keeps the whole thing on-screen.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      setScale(Math.min(WELCOME_SCAN_SCALE, el.clientWidth / MOCKUP_FULL_BLEED_WIDTH))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const delay =
      screen === 'off'
        ? OFF_MS
        : screen === 'home'
          ? HOME_MS
          : screen === 'loading'
            ? LOADING_MS
            : screen === 'scan'
              ? SCAN_HOLD_MS
              : screen === 'result'
                ? RESULT_HOLD_MS
                : INSIGHTS_HOLD_MS
    const id = setTimeout(() => {
      setScreen((s) =>
        s === 'off' || s === 'insights'
          ? 'home'
          : s === 'home'
            ? 'loading'
            : s === 'loading'
              ? 'scan'
              : s === 'scan'
                ? 'result'
                : 'insights'
      )
    }, delay)
    return () => clearTimeout(id)
  }, [screen])

  return (
    <div ref={containerRef} className="w-full">
    <div className="relative mx-auto mt-4" style={{ width: MOCKUP_WIDTH * scale, height: MOCKUP_HEIGHT * scale }}>
    <div
      className="absolute left-0 top-0 flex items-center justify-center"
      style={{ width: MOCKUP_WIDTH, height: MOCKUP_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {VITAMIN_CHIPS.map((chip) => (
          <span
            key={chip.id}
            className="vitamin-chip-drift absolute flex flex-col gap-1.5 rounded-xl px-3.5 py-2.5"
            style={
              {
                top: chip.top,
                bottom: chip.bottom,
                insetInlineStart: chip.start,
                insetInlineEnd: chip.end,
                width: 128,
                backgroundColor: 'var(--surface-cream)',
                border: '2px solid #e0554f',
                boxShadow: '0 4px 10px rgba(26,26,25,0.14)',
                animationDuration: `${chip.duration}, ${chip.duration}`,
                animationDelay: `${chip.delay}, ${chip.delay}`,
                '--chip-rotate': `${chip.rotate}deg`,
                transform: `rotate(${chip.rotate}deg)`,
              } as React.CSSProperties
            }
          >
            <span className="truncate text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {NUTRIENT_CONTENT[lang][chip.id].name}
            </span>
            <span className="block h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surface-2)' }}>
              <span
                className="chip-level-fill block h-full rounded-full"
                style={{
                  backgroundColor: CORE_NUTRIENT_COLOR[chip.id],
                  animationDuration: chip.duration,
                  animationDelay: chip.delay,
                }}
              />
            </span>
          </span>
        ))}
      </div>

      <div
        className="relative z-10 shrink-0 overflow-hidden rounded-[38px]"
        style={{ backgroundColor: '#000000', width: 204, height: 368, padding: 9, boxShadow: '0 20px 40px rgba(11,11,11,0.32)' }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-2.5 z-10 flex justify-center">
          <span className="h-1.5 w-10 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }} />
        </div>

        <span className="power-on-flash pointer-events-none absolute inset-1.5 z-30 rounded-[29px]" aria-hidden />

        {screen === 'off' ? (
          <div className="relative h-full w-full overflow-hidden rounded-[29px]" style={{ backgroundColor: '#000000' }} />
        ) : screen === 'home' ? (
          <div
            className="relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[29px]"
            style={{
              backgroundImage: "url('/background-onboarding-phone-home.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <span
              className="tap-effect flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl"
              style={{ backgroundColor: '#ffffff', border: '3px solid #000000', animationDelay: '380ms' }}
            >
              <img src="/icons/lemon-appicon.png" alt="" className="h-full w-full object-cover" />
            </span>
            <span className="text-[11px] font-semibold text-white" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              Vitrack
            </span>
          </div>
        ) : screen === 'loading' ? (
          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[29px]"
            style={{ backgroundColor: '#ff5da1' }}
          >
            <span className="status-pulse flex h-16 w-16 items-center justify-center">
              <img src="/icons/lemon-appicon.png" alt="" className="h-full w-full object-contain" />
            </span>
          </div>
        ) : screen === 'insights' ? (
          <div
            className="relative flex h-full w-full flex-col items-center gap-2 overflow-hidden rounded-[29px] px-3 pt-6"
            style={{
              backgroundColor: 'var(--surface-0)',
              backgroundImage: "url('/background-progress.png?v=3')",
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <MiniWeeklyGoalGlass percent={WEEKLY_GOAL_PERCENT} />
            <div className="mt-1 flex w-full flex-col gap-1.5">
              {MINI_INSIGHTS_ROWS.map(({ id, percent }) => (
                <MiniInsightsRow key={id} id={id} percent={percent} />
              ))}
            </div>
          </div>
        ) : (
      <div
        className="relative h-full w-full overflow-hidden rounded-[29px]"
        style={{
          backgroundColor: 'var(--surface-0)',
          backgroundImage: "url('/background-camera.png?v=3')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35), transparent)' }}
        />

        {screen === 'result' && <MiniConfetti />}

        {screen === 'scan' ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 pt-6">
            <div
              className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl"
              style={{ background: 'linear-gradient(160deg, var(--accent-soft) 0%, #eaf7d8 55%, var(--surface-cream) 100%)', border: '4px solid #000000' }}
            >
              <img src="/icons/fruits/avocado.png" alt="" className="h-[70%] w-[70%] object-contain" />
              <ScanCorner pos="tl" />
              <ScanCorner pos="tr" />
              <ScanCorner pos="bl" />
              <ScanCorner pos="br" />
            </div>
            <div className="relative w-full">
              <span
                className="mini-button-press flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold text-white"
                style={{
                  backgroundColor: 'var(--accent)',
                  border: '3px solid #000000',
                  boxShadow: '0 3px 0 #000000',
                  animationDuration: `${SCAN_HOLD_MS}ms`,
                }}
                aria-hidden
              >
                <CameraIcon className="h-3.5 w-3.5" />
                {camera.actions.scanFood}
              </span>
              <TapFinger durationMs={SCAN_HOLD_MS} />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center gap-[8px] px-[16px] pt-[20px]">
            <img src="/icons/fruits/avocado.png" alt="" className="h-[40px] w-[40px] object-contain" />
            <div className="w-full">
              <MiniFillBar percent={78} />
            </div>
            <div className="mt-[4px] flex w-full flex-col gap-[6px]">
              {MINI_NUTRIENTS.map(({ id, percent }) => (
                <MiniNutrientRow key={id} id={id} percent={percent} />
              ))}
            </div>
            <div className="relative mt-auto mb-[16px] w-[70%]">
              <span
                className="mini-button-press flex w-full items-center justify-center rounded-full py-[8px] text-[11px] font-semibold text-white"
                style={{
                  backgroundColor: 'var(--accent)',
                  border: '3px solid #000000',
                  boxShadow: '0 3px 0 #000000',
                  animationDuration: `${RESULT_HOLD_MS}ms`,
                }}
                aria-hidden
              >
                {camera.result.save}
              </span>
              <TapFinger durationMs={RESULT_HOLD_MS} />
            </div>
          </div>
        )}
      </div>
      )}
      </div>
      </div>
    </div>
    </div>
  )
}

function WelcomeStep({ t }: { t: OnboardingStrings }) {
  const subtitle = t.welcome.subtitle
  const highlightWord = t.welcome.highlightWord
  const hlStart = highlightWord ? subtitle.indexOf(highlightWord) : -1
  const hlEnd = hlStart >= 0 ? hlStart + highlightWord.length : -1

  const before = hlStart >= 0 ? subtitle.slice(0, hlStart) : subtitle
  const highlighted = hlStart >= 0 ? subtitle.slice(hlStart, hlEnd) : ''
  const after = hlEnd >= 0 ? subtitle.slice(hlEnd) : ''

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 pt-1 text-center">
      <div className="flex flex-col gap-1">
        <p
          className="mx-auto max-w-[85%] text-2xl"
          style={{
            color: '#4a3418',
            fontFamily: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontWeight: 700,
          }}
        >
          <AnimatedLetters text={before} startIndex={0} />
          {highlighted && (
            <span
              style={{
                display: 'inline-block',
                whiteSpace: 'nowrap',
                background:
                  'linear-gradient(104deg, rgba(249,203,96,0) 0.9%, rgba(249,203,96,0.85) 2.4%, rgba(249,203,96,0.85) 5.8%, rgba(249,203,96,0.85) 93%, rgba(249,203,96,0) 96%)',
                padding: '0 4px',
              }}
            >
              <AnimatedLetters text={highlighted} startIndex={before.length} letterStyle={{ fontSize: '1.3em' }} />
            </span>
          )}
          {highlighted && <br />}
          <AnimatedLetters text={after} startIndex={before.length + highlighted.length} />
        </p>
      </div>

      <WelcomeScanAnimation />
    </div>
  )
}

function AgeStep({ t, value, onChange }: { t: OnboardingStrings; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard icon={<CakeIcon className="h-5 w-5" />} title={t.age.title} subtitle={t.age.subtitle}>
        <WheelPicker value={value} onChange={onChange} unit={t.age.unit} min={18} max={100} initial={25} />
      </StepCard>
    </div>
  )
}

function SexStep({ t, value, onChange }: { t: OnboardingStrings; value: Sex | null; onChange: (v: Sex) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard icon={<UserIcon className="h-5 w-5" />} title={t.sex.title} subtitle={t.sex.subtitle}>
        <div className="flex w-full flex-col gap-1">
          {SEX_IDS.map((id) => (
            <ChoiceButton key={id} selected={value === id} onClick={() => onChange(id)} label={t.sex.options[id]} />
          ))}
        </div>
      </StepCard>
    </div>
  )
}

function WeightStep({ t, value, onChange }: { t: OnboardingStrings; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard icon={<ScaleIcon className="h-5 w-5" />} title={t.weight.title} subtitle={t.weight.subtitle}>
        <WheelPicker value={value} onChange={onChange} unit={t.weight.unit} min={30} max={250} initial={70} />
      </StepCard>
    </div>
  )
}

function HeightStep({ t, value, onChange }: { t: OnboardingStrings; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard icon={<RulerIcon className="h-5 w-5" />} title={t.height.title} subtitle={t.height.subtitle}>
        <WheelPicker value={value} onChange={onChange} unit={t.height.unit} min={100} max={230} initial={170} />
      </StepCard>
    </div>
  )
}

function ActivityStep({
  t,
  value,
  onChange,
}: {
  t: OnboardingStrings
  value: ActivityLevel | null
  onChange: (v: ActivityLevel) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard icon={<ActivityIcon className="h-5 w-5" />} title={t.activity.title} subtitle={t.activity.subtitle}>
        <div className="flex w-full flex-col gap-1">
          {ACTIVITY_IDS.map((id) => (
            <ChoiceButton
              key={id}
              selected={value === id}
              onClick={() => onChange(id)}
              label={t.activity.options[id].label}
              description={t.activity.options[id].desc}
            />
          ))}
        </div>
      </StepCard>
    </div>
  )
}

function DietStep({ t, value, onChange }: { t: OnboardingStrings; value: DietType | null; onChange: (v: DietType) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard icon={<LeafIcon className="h-5 w-5" />} title={t.diet.title} subtitle={t.diet.subtitle}>
        <div className="flex w-full flex-col gap-1.5">
          {DIET_IDS.map((id) => (
            <ChoiceButton
              key={id}
              selected={value === id}
              onClick={() => onChange(id)}
              label={t.diet.options[id].label}
              description={t.diet.options[id].desc}
              compact
            />
          ))}
        </div>
      </StepCard>
    </div>
  )
}

function GoalStep({ t, value, onChange }: { t: OnboardingStrings; value: WeightGoal | null; onChange: (v: WeightGoal) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard icon={<TargetIcon className="h-5 w-5" />} title={t.goal.title} subtitle={t.goal.subtitle}>
        <div className="flex w-full flex-col gap-1.5">
          {GOAL_IDS.map((id) => (
            <ChoiceButton
              key={id}
              selected={value === id}
              onClick={() => onChange(id)}
              label={t.goal.options[id].label}
              description={t.goal.options[id].desc}
              compact
            />
          ))}
        </div>
      </StepCard>
    </div>
  )
}

function CalculatingStep({ t }: { t: OnboardingStrings }) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setMsgIndex((i) => (i + 1) % t.calculating.messages.length), 550)
    return () => clearInterval(timer)
  }, [t])

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
      >
        <span className="spin-slow flex h-7 w-7 items-center justify-center">
          <SparkleIcon className="h-7 w-7" />
        </span>
      </span>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        {t.calculating.messages[msgIndex]}
      </p>
    </div>
  )
}

const PREVIEW_NUTRIENTS: ('vitaminD' | 'iron' | 'vitaminB12')[] = ['vitaminD', 'iron', 'vitaminB12']
const LOCKED_COUNT = NUTRIENTS.length - PREVIEW_NUTRIENTS.length

function SummaryStep({ t, goals }: { t: OnboardingStrings; goals: NutrientAmounts | null }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <div
        className="flex w-full max-w-xs flex-col items-center gap-1.5 rounded-3xl px-4 py-3 text-center"
        style={{
          backgroundColor: '#e5c184',
          border: '2px solid var(--accent-strong)',
          boxShadow: '0 10px 26px rgba(11,11,11,0.16)',
        }}
      >
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t.summary.title}
          </h2>
        </div>

        {goals && (
          <div className="flex w-full flex-col gap-1">
            {PREVIEW_NUTRIENTS.map((id) => (
              <div
                key={id}
                className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-start"
                style={{ backgroundColor: 'var(--accent-soft)', border: '1px solid var(--border-strong)' }}
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {t.summary.nutrientNames[id]}
                  </div>
                  <div className="truncate text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {t.summary.nutrientBenefits[id]}
                  </div>
                </div>
                <div className="shrink-0 text-xs font-bold" style={{ color: 'var(--accent-strong)' }}>
                  {goals[id]}
                  {NUTRIENT_MAP[id].unit}
                </div>
              </div>
            ))}
            <div
              className="flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5"
              style={{ backgroundColor: 'var(--accent-strong)', border: '1px solid #7a4c14' }}
            >
              <LockIcon className="h-3.5 w-3.5 shrink-0 text-white" />
              <span className="text-[11px] font-bold text-white">{t.summary.lockedMore(LOCKED_COUNT)}</span>
            </div>
          </div>
        )}

        <p className="px-2 text-[11px]" style={{ color: '#000000' }}>
          {t.summary.disclaimer}
        </p>
      </div>
    </div>
  )
}
