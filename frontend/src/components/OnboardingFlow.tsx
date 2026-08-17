import { useEffect, useState, type ReactNode, type WheelEvent } from 'react'
import type { ActivityLevel, DietType, NutrientAmounts, NutrientId, OnboardingProfile, Sex } from '../types'
import { computeNutrientGoals } from '../lib/goals'
import { completeOnboarding } from '../lib/profile'
import { NUTRIENT_MAP, NUTRIENTS } from '../lib/nutrients'
import { playConfirmSound, playTapSound } from '../lib/sound'
import { ActivityIcon, CakeIcon, LeafIcon, LockIcon, RulerIcon, ScaleIcon, SparkleIcon, UserIcon } from './icons'

type Step = 'welcome' | 'age' | 'sex' | 'weight' | 'height' | 'activity' | 'diet' | 'calculating' | 'summary'

const STEP_ORDER: Step[] = ['welcome', 'age', 'sex', 'weight', 'height', 'activity', 'diet', 'calculating', 'summary']
const PROGRESS_STEPS: Step[] = ['age', 'sex', 'weight', 'height', 'activity', 'diet']

const ACTIVITY_OPTIONS: { id: ActivityLevel; label: string; desc: string }[] = [
  { id: 'sedentary', label: 'Mostly still', desc: 'Little exercise, desk job' },
  { id: 'moderate', label: 'Somewhat active', desc: 'Active 1–3 times a week' },
  { id: 'active', label: 'Very active', desc: '4+ workouts a week' },
]

const DIET_OPTIONS: { id: DietType; label: string; desc: string }[] = [
  { id: 'omnivore', label: 'Omnivore', desc: 'Meat, fish, dairy — everything' },
  { id: 'pescatarian', label: 'Pescatarian', desc: 'Fish and dairy, no other meat' },
  { id: 'vegetarian', label: 'Vegetarian', desc: 'Dairy & eggs, no meat/fish' },
  { id: 'vegan', label: 'Vegan', desc: 'No animal products at all' },
]

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
      className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--surface-0)',
        backgroundImage: "url('/background-calendar.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="flex items-center gap-3 px-5 pt-3">
        {step !== 'welcome' && step !== 'calculating' && step !== 'summary' ? (
          <button
            onClick={goBack}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.5)', color: 'var(--text-primary)' }}
          >
            ‹
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

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-2">
        <div key={step} className="step-enter flex min-h-0 flex-1 flex-col">
          {step === 'welcome' && <WelcomeStep />}
          {step === 'age' && <AgeStep value={draft.age} onChange={(age) => setDraft((d) => ({ ...d, age }))} />}
          {step === 'sex' && <SexStep value={draft.sex} onChange={(sex) => setDraft((d) => ({ ...d, sex }))} />}
          {step === 'weight' && (
            <WeightStep value={draft.weightKg} onChange={(weightKg) => setDraft((d) => ({ ...d, weightKg }))} />
          )}
          {step === 'height' && (
            <HeightStep value={draft.heightCm} onChange={(heightCm) => setDraft((d) => ({ ...d, heightCm }))} />
          )}
          {step === 'activity' && (
            <ActivityStep
              value={draft.activityLevel}
              onChange={(activityLevel) => setDraft((d) => ({ ...d, activityLevel }))}
            />
          )}
          {step === 'diet' && <DietStep value={draft.diet} onChange={(diet) => setDraft((d) => ({ ...d, diet }))} />}
          {step === 'calculating' && <CalculatingStep />}
          {step === 'summary' && <SummaryStep goals={previewGoals} />}
        </div>
      </main>

      {step !== 'calculating' && (
        <div className="px-6 pb-4 pt-2">
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
            style={{ backgroundColor: canContinue ? 'var(--accent-strong)' : '#e8d9a6' }}
          >
            {step === 'welcome' ? "Let's go" : step === 'summary' ? 'See my plan' : 'Continue'}
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
      className="flex w-full max-w-xs flex-col items-center gap-2 rounded-3xl px-5 py-4 text-center"
      style={{
        backgroundColor: '#e5c184',
        border: '3px solid var(--accent-strong)',
        boxShadow: '0 10px 26px rgba(11,11,11,0.16)',
      }}
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
      >
        {icon}
      </span>
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>
      )}
      <div className="mt-2 flex w-full flex-col items-center gap-2.5">{children}</div>
    </div>
  )
}

function NumberField({
  value,
  onChange,
  unit,
  min,
  max,
}: {
  value: string
  onChange: (v: string) => void
  unit: string
  min: number
  max: number
}) {
  function handleWheel(e: WheelEvent<HTMLInputElement>) {
    e.preventDefault()
    const current = Math.round(Number(value) || min)
    const next = Math.min(max, Math.max(min, current + (e.deltaY < 0 ? 1 : -1)))
    onChange(String(next))
  }

  return (
    <div
      className="flex items-center justify-center gap-2 rounded-2xl px-5 py-4"
      style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border-strong)' }}
    >
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onWheel={handleWheel}
        placeholder="—"
        min={min}
        max={max}
        className="w-24 bg-transparent text-center text-3xl font-semibold outline-none"
        style={{ color: 'var(--text-primary)' }}
      />
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
}: {
  selected: boolean
  onClick: () => void
  label: string
  description?: string
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
      className={`flex flex-col items-start gap-0.5 rounded-2xl px-4 py-1.5 text-left transition ${pulse > 0 ? 'tap-effect' : ''}`}
      style={{
        backgroundColor: selected ? 'var(--accent-soft)' : 'var(--surface-cream)',
        border: selected ? '2px solid var(--accent-strong)' : '1px solid var(--border-strong)',
      }}
    >
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        {label}
      </span>
      {description && (
        <span className="text-xs leading-tight" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </span>
      )}
    </button>
  )
}

function WelcomeStep() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
      >
        <SparkleIcon className="h-8 w-8" />
      </span>
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        Let's set up your targets
      </h1>
      <p className="max-w-[80%] text-sm" style={{ color: 'var(--text-secondary)' }}>
        A few quick questions — no cardio required.
      </p>
    </div>
  )
}

function AgeStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard icon={<CakeIcon className="h-6 w-6" />} title="How old are you?" subtitle="Your vitamin needs age too, just less gracefully.">
        <NumberField value={value} onChange={onChange} unit="years" min={18} max={100} />
      </StepCard>
    </div>
  )
}

const SEX_OPTIONS: { id: Sex; label: string }[] = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'unspecified', label: 'Prefer not to say' },
]

function SexStep({ value, onChange }: { value: Sex | null; onChange: (v: Sex) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard
        icon={<UserIcon className="h-6 w-6" />}
        title="Male or female?"
        subtitle="Biology plays favorites with a few nutrients."
      >
        <div className="flex w-full flex-col gap-1.5">
          {SEX_OPTIONS.map((opt) => (
            <ChoiceButton key={opt.id} selected={value === opt.id} onClick={() => onChange(opt.id)} label={opt.label} />
          ))}
        </div>
      </StepCard>
    </div>
  )
}

function WeightStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard
        icon={<ScaleIcon className="h-6 w-6" />}
        title="What's your weight?"
        subtitle="Bigger frame, bigger nutrient budget."
      >
        <NumberField value={value} onChange={onChange} unit="kg" min={30} max={250} />
      </StepCard>
    </div>
  )
}

function HeightStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard
        icon={<RulerIcon className="h-6 w-6" />}
        title="And your height?"
        subtitle="Tall or short, we still crunch the numbers."
      >
        <NumberField value={value} onChange={onChange} unit="cm" min={100} max={230} />
      </StepCard>
    </div>
  )
}

function ActivityStep({ value, onChange }: { value: ActivityLevel | null; onChange: (v: ActivityLevel) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard
        icon={<ActivityIcon className="h-6 w-6" />}
        title="How active are you?"
        subtitle="Couch or gym — we adjust."
      >
        <div className="flex w-full flex-col gap-1.5">
          {ACTIVITY_OPTIONS.map((opt) => (
            <ChoiceButton
              key={opt.id}
              selected={value === opt.id}
              onClick={() => onChange(opt.id)}
              label={opt.label}
              description={opt.desc}
            />
          ))}
        </div>
      </StepCard>
    </div>
  )
}

function DietStep({ value, onChange }: { value: DietType | null; onChange: (v: DietType) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <StepCard
        icon={<LeafIcon className="h-6 w-6" />}
        title="What's your diet?"
        subtitle="Salad fans, mind the B12."
      >
        <div className="flex w-full flex-col gap-1.5">
          {DIET_OPTIONS.map((opt) => (
            <ChoiceButton
              key={opt.id}
              selected={value === opt.id}
              onClick={() => onChange(opt.id)}
              label={opt.label}
              description={opt.desc}
            />
          ))}
        </div>
      </StepCard>
    </div>
  )
}

const CALCULATING_MESSAGES = ['Analyzing your profile…', 'Calculating vitamin needs…', 'Personalizing your targets…']

function CalculatingStep() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setMsgIndex((i) => (i + 1) % CALCULATING_MESSAGES.length), 550)
    return () => clearInterval(t)
  }, [])

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
        {CALCULATING_MESSAGES[msgIndex]}
      </p>
    </div>
  )
}

const PREVIEW_NUTRIENTS: NutrientId[] = ['vitaminD', 'iron', 'vitaminB12']
const LOCKED_COUNT = NUTRIENTS.length - PREVIEW_NUTRIENTS.length

const NUTRIENT_BENEFITS: Partial<Record<NutrientId, string>> = {
  vitaminD: 'Bones, mood & immunity',
  iron: 'Energy & focus, less fatigue',
  vitaminB12: 'Nerve health & steady energy',
}

function SummaryStep({ goals }: { goals: NutrientAmounts | null }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <div
        className="flex w-full max-w-xs flex-col items-center gap-2.5 rounded-3xl px-5 py-5 text-center"
        style={{
          backgroundColor: '#e5c184',
          border: '3px solid var(--accent-strong)',
          boxShadow: '0 10px 26px rgba(11,11,11,0.16)',
        }}
      >
        <div>
          <h2 className="mb-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Your daily targets are ready
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Based on your answers — here's what your body needs each day, and why it matters.
          </p>
        </div>

        {goals && (
          <div className="flex w-full flex-col gap-1.5">
            {PREVIEW_NUTRIENTS.map((id) => (
              <div
                key={id}
                className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left"
                style={{ backgroundColor: 'var(--accent-soft)', border: '1px solid var(--border-strong)' }}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {NUTRIENT_MAP[id].name}
                  </div>
                  <div className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {NUTRIENT_BENEFITS[id]}
                  </div>
                </div>
                <div className="shrink-0 text-sm font-bold" style={{ color: 'var(--accent-strong)' }}>
                  {goals[id]}
                  {NUTRIENT_MAP[id].unit}
                </div>
              </div>
            ))}
            <div
              className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2"
              style={{ backgroundColor: 'var(--accent-strong)', border: '2px solid #7a4c14' }}
            >
              <LockIcon className="h-4 w-4 shrink-0 text-white" />
              <span className="text-xs font-bold text-white">+{LOCKED_COUNT} more targets unlock next</span>
            </div>
          </div>
        )}

        <p className="px-2 text-xs" style={{ color: '#000000' }}>
          A rough estimate, not medical advice — check a doctor for anything specific.
        </p>
      </div>
    </div>
  )
}
