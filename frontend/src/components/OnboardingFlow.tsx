import { useState, type ReactNode } from 'react'
import type { ActivityLevel, DietType, NutrientAmounts, NutrientId, OnboardingProfile, Sex } from '../types'
import { computeNutrientGoals } from '../lib/goals'
import { completeOnboarding } from '../lib/profile'
import { NUTRIENT_MAP } from '../lib/nutrients'
import { ActivityIcon, CakeIcon, LeafIcon, RulerIcon, ScaleIcon, SparkleIcon, UserIcon } from './icons'

type Step = 'welcome' | 'age' | 'sex' | 'weight' | 'height' | 'activity' | 'diet' | 'summary'

const STEP_ORDER: Step[] = ['welcome', 'age', 'sex', 'weight', 'height', 'activity', 'diet', 'summary']
const PROGRESS_STEPS: Step[] = ['age', 'sex', 'weight', 'height', 'activity', 'diet']

const ACTIVITY_OPTIONS: { id: ActivityLevel; label: string; desc: string }[] = [
  { id: 'sedentary', label: 'Mostly still', desc: 'Little to no exercise, a desk-based day' },
  { id: 'moderate', label: 'Somewhat active', desc: 'Exercise or on your feet 1–3 times a week' },
  { id: 'active', label: 'Very active', desc: 'Exercise 4+ times a week, or a physical job' },
]

const DIET_OPTIONS: { id: DietType; label: string; desc: string }[] = [
  { id: 'omnivore', label: 'Omnivore', desc: 'Meat, fish, dairy — everything' },
  { id: 'pescatarian', label: 'Pescatarian', desc: 'Fish and dairy, no other meat' },
  { id: 'vegetarian', label: 'Vegetarian', desc: 'Dairy and eggs, no meat or fish' },
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
      return Number.isFinite(n) && n >= 13 && n <= 100
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
  const step = STEP_ORDER[stepIndex]
  const canContinue = isValid(step, draft)

  const previewProfile = step === 'summary' ? draftToProfile(draft) : null
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

  return (
    <div
      className="mx-auto flex h-screen w-full max-w-md flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--surface-0)' }}
    >
      <div className="flex items-center gap-3 px-5 pt-6">
        {step !== 'welcome' && step !== 'summary' ? (
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
                  PROGRESS_STEPS.indexOf(s) <= PROGRESS_STEPS.indexOf(step)
                    ? 'var(--accent)'
                    : 'rgba(11,11,11,0.12)',
              }}
            />
          ))}
        </div>
        <div className="h-9 w-9" />
      </div>

      <main className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
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
        {step === 'summary' && <SummaryStep goals={previewGoals} />}
      </main>

      <div className="px-6 pb-8 pt-2">
        <button
          onClick={goNext}
          disabled={!canContinue}
          className="w-full rounded-full py-3.5 text-base font-semibold text-white transition"
          style={{ backgroundColor: canContinue ? 'var(--accent-strong)' : 'var(--border-strong)' }}
        >
          {step === 'welcome' ? "Let's go" : step === 'summary' ? 'See my plan' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

function StepHeading({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-6 flex flex-col items-center gap-3 text-center">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
      >
        {icon}
      </span>
      <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-[85%] text-sm" style={{ color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>
      )}
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
  return (
    <div
      className="flex items-center justify-center gap-2 rounded-2xl px-5 py-4"
      style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-strong)' }}
    >
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-0.5 rounded-2xl px-4 py-3 text-left transition"
      style={{
        backgroundColor: selected ? 'var(--accent-soft)' : 'var(--surface-1)',
        border: selected ? '2px solid var(--accent-strong)' : '1px solid var(--border-strong)',
      }}
    >
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        {label}
      </span>
      {description && (
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </span>
      )}
    </button>
  )
}

function WelcomeStep() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
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
        A few quick questions about you, so Vitrack can estimate roughly how much of each vitamin and mineral you
        should aim for each day.
      </p>
    </div>
  )
}

function AgeStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <StepHeading icon={<CakeIcon className="h-6 w-6" />} title="How old are you?" subtitle="Nutrient needs shift with age." />
      <NumberField value={value} onChange={onChange} unit="years" min={13} max={100} />
    </div>
  )
}

function SexStep({ value, onChange }: { value: Sex | null; onChange: (v: Sex) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <StepHeading
        icon={<UserIcon className="h-6 w-6" />}
        title="Biological sex"
        subtitle="Used only to estimate nutrient needs more accurately — several RDAs differ by sex."
      />
      <div className="flex w-full max-w-xs flex-col gap-2.5">
        {(['female', 'male'] as Sex[]).map((s) => (
          <ChoiceButton key={s} selected={value === s} onClick={() => onChange(s)} label={s === 'female' ? 'Female' : 'Male'} />
        ))}
      </div>
    </div>
  )
}

function WeightStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <StepHeading
        icon={<ScaleIcon className="h-6 w-6" />}
        title="What's your weight?"
        subtitle="Helps scale targets like magnesium to your body size."
      />
      <NumberField value={value} onChange={onChange} unit="kg" min={30} max={250} />
    </div>
  )
}

function HeightStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <StepHeading
        icon={<RulerIcon className="h-6 w-6" />}
        title="And your height?"
        subtitle="Combined with weight and age to estimate your energy needs."
      />
      <NumberField value={value} onChange={onChange} unit="cm" min={100} max={230} />
    </div>
  )
}

function ActivityStep({ value, onChange }: { value: ActivityLevel | null; onChange: (v: ActivityLevel) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <StepHeading
        icon={<ActivityIcon className="h-6 w-6" />}
        title="How active are you?"
        subtitle="More activity generally means higher energy and B-vitamin needs."
      />
      <div className="flex w-full max-w-xs flex-col gap-2.5">
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
    </div>
  )
}

function DietStep({ value, onChange }: { value: DietType | null; onChange: (v: DietType) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <StepHeading
        icon={<LeafIcon className="h-6 w-6" />}
        title="What's your main diet?"
        subtitle="Some nutrients, like iron and B12, are harder to get from plant-based diets."
      />
      <div className="flex w-full max-w-xs flex-col gap-2.5">
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
    </div>
  )
}

const PREVIEW_NUTRIENTS: NutrientId[] = ['vitaminD', 'iron', 'vitaminB12']

function SummaryStep({ goals }: { goals: NutrientAmounts | null }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--status-good-soft)', color: 'var(--status-good)' }}
      >
        <SparkleIcon className="h-7 w-7" />
      </span>
      <div>
        <h2 className="mb-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Your daily targets are ready
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Estimated for all 16 vitamins & minerals we track, based on your answers.
        </p>
      </div>

      {goals && (
        <div className="grid w-full max-w-xs grid-cols-3 gap-2">
          {PREVIEW_NUTRIENTS.map((id) => (
            <div
              key={id}
              className="rounded-xl px-2 py-3"
              style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {NUTRIENT_MAP[id].shortLabel}
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {goals[id]}
                {NUTRIENT_MAP[id].unit}
              </div>
            </div>
          ))}
        </div>
      )}

      <p
        className="max-w-[85%] rounded-xl px-3 py-2.5 text-xs"
        style={{ backgroundColor: 'var(--status-warning-soft)', color: 'var(--text-primary)' }}
      >
        These numbers are a rough, automated estimate — not medical advice. They're meant to give you a general
        sense of direction, not a precise prescription. Always check with a doctor or dietitian for anything
        specific to your health.
      </p>
    </div>
  )
}
