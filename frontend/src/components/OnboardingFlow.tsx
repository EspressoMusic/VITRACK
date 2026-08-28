import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ActivityLevel, DietType, NutrientAmounts, OnboardingProfile, Sex } from '../types'
import { computeNutrientGoals } from '../lib/goals'
import { completeOnboarding } from '../lib/profile'
import { NUTRIENT_MAP, NUTRIENTS } from '../lib/nutrients'
import { playConfirmSound, playTapSound } from '../lib/sound'
import { useLanguage } from '../contexts/LanguageContext'
import { LANGUAGES } from '../lib/i18n/lang'
import { ONBOARDING_STRINGS } from '../lib/i18n/onboarding'
import { ActivityIcon, CakeIcon, GlobeIcon, LeafIcon, LockIcon, RulerIcon, ScaleIcon, SparkleIcon, UserIcon } from './icons'

type Step = 'welcome' | 'age' | 'sex' | 'weight' | 'height' | 'activity' | 'diet' | 'calculating' | 'summary'
type OnboardingStrings = (typeof ONBOARDING_STRINGS)['en']

const STEP_ORDER: Step[] = ['welcome', 'age', 'sex', 'weight', 'height', 'activity', 'diet', 'calculating', 'summary']
const PROGRESS_STEPS: Step[] = ['age', 'sex', 'weight', 'height', 'activity', 'diet']

const ACTIVITY_IDS: ActivityLevel[] = ['sedentary', 'moderate', 'active']
const DIET_IDS: DietType[] = ['omnivore', 'pescatarian', 'vegetarian', 'vegan']
const SEX_IDS: Sex[] = ['female', 'male', 'unspecified']

interface DraftProfile {
  age: string
  sex: Sex | null
  weightKg: string
  heightCm: string
  activityLevel: ActivityLevel | null
  diet: DietType | null
}

const EMPTY_DRAFT: DraftProfile = {
  age: '',
  sex: null,
  weightKg: '',
  heightCm: '',
  activityLevel: null,
  diet: null,
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
    default:
      return true
  }
}

function draftToProfile(d: DraftProfile): OnboardingProfile | null {
  if (!d.sex || !d.activityLevel || !d.diet) return null
  const age = Number(d.age)
  const weightKg = Number(d.weightKg)
  const heightCm = Number(d.heightCm)
  if (!Number.isFinite(age) || !Number.isFinite(weightKg) || !Number.isFinite(heightCm)) return null
  return { age, sex: d.sex, weightKg, heightCm, activityLevel: d.activityLevel, diet: d.diet }
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
      className="mx-auto flex h-svh w-full max-w-md flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--surface-0)',
        backgroundImage: "url('/background-onboarding.png')",
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
        {step === 'welcome' ? <LanguageSwitcher /> : <div className="h-9 w-9" />}
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-2">
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
          {step === 'calculating' && <CalculatingStep t={t} />}
          {step === 'summary' && <SummaryStep t={t} goals={previewGoals} />}
        </div>
      </main>

      {step !== 'calculating' && (
        <div className="px-6 pb-10 pt-2">
          <button
            key={continuePulse}
            onClick={() => {
              if (!canContinue) return
              playConfirmSound()
              setContinuePulse((p) => p + 1)
              goNext()
            }}
            disabled={!canContinue}
            className={`w-full rounded-full py-3.5 text-base font-semibold text-white transition ${continuePulse > 0 ? 'tap-effect' : ''}`}
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

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={ONBOARDING_STRINGS[lang].languageButtonLabel}
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.5)', color: 'var(--text-primary)' }}
      >
        <GlobeIcon className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute end-0 top-11 z-30 flex flex-col overflow-hidden rounded-2xl py-1"
          style={{
            backgroundColor: 'var(--surface-cream)',
            border: '1.5px solid var(--accent-strong)',
            boxShadow: '0 8px 20px rgba(11,11,11,0.18)',
            minWidth: 132,
          }}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setLang(l.id)
                setOpen(false)
              }}
              className="px-4 py-2 text-start text-sm font-medium transition"
              style={{
                backgroundColor: l.id === lang ? 'var(--accent-soft)' : 'transparent',
                color: 'var(--text-primary)',
              }}
            >
              {l.nativeLabel}
            </button>
          ))}
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
        <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
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
      <span className="text-base font-medium" style={{ color: 'var(--text-muted)' }}>
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
        className={`font-semibold leading-tight ${compact ? 'text-[13px]' : 'text-sm'}`}
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
      </span>
      {description && (
        <span className={`leading-tight ${compact ? 'text-[11px]' : 'text-xs'}`} style={{ color: 'var(--text-secondary)' }}>
          {description}
        </span>
      )}
    </button>
  )
}

function WelcomeStep({ t }: { t: OnboardingStrings }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
      >
        <SparkleIcon className="h-8 w-8" />
      </span>
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        {t.welcome.title}
      </h1>
      <p className="max-w-[80%] text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t.welcome.subtitle}
      </p>
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
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {t.summary.subtitle}
          </p>
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
