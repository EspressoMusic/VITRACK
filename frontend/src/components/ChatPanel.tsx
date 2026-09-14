import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { NUTRITION_CHAT_STRINGS } from '../lib/i18n/nutritionChat'
import { SUPERFOODS_PANEL_CHROME } from '../lib/i18n/superfoodsPanel'
import { askNutritionBot, AnalyzeError, type ChatFoodSuggestion, type ChatMealSuggestion } from '../lib/api'
import { getSavedMeals, saveMeal, unsaveMeal, type SavedMeal } from '../lib/savedMeals'
import { getSavedChatFoods, saveChatFood, unsaveChatFood, type SavedChatFood } from '../lib/savedChatFoods'
import { getBotPersonality, setBotPersonality, type BotPersonality } from '../lib/botPersonality'
import { getTodaysBotMood, type BotMoodStatus } from '../lib/botMood'
import { getChatHistory, setChatHistory, type ChatTurn } from '../lib/chatHistory'
import { consumePendingChallengeAnnounce, consumePendingChallengeCompleted } from '../lib/challengeAnnounce'
import { shouldSendCheckIn, markCheckInSent } from '../lib/botCheckIn'
import { CHALLENGE_TEMPLATES, CHALLENGE_TEMPLATE_IDS, type ChallengeTemplateId } from '../lib/nutritionChallengeTemplates'
import { addWorkout } from '../lib/db'
import { todayKey } from '../lib/date'
import type { WorkoutEntry } from '../types'
import { FAVORITES_PANEL_STRINGS } from '../lib/i18n/favoritesPanel'
import { MACRO_LABELS } from '../lib/i18n/macros'
import { SendIcon, StarIcon, BotIcon, CloseIcon } from './icons'
import { MacroSummaryRow } from './MacroSummaryRow'
import { BotPersonalityModal } from './BotPersonalityModal'
import { SavedMealCard } from './FavoritesPanel'

const CHAT_HEADER = '#6b4423'
const CHAT_HEADER_ANGRY = 'var(--status-critical)'
const CHAT_WALLPAPER = '#f6e4bb'
const CHAT_OUTGOING = '#eec978'

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/** Styled to match the Superfoods tab's own food cards (FoodCard in SuperfoodsPanel.tsx) — same
 *  border, shadow, emoji size and name/tagline typography — so a bot-suggested food doesn't look
 *  like a different UI language. Tapping the card opens a detail popup; the star stays a separate
 *  action so saving/unsaving never also opens the popup. */
function ChatFoodCard({
  food,
  saved,
  onToggleSave,
  onOpenDetail,
  saveLabel,
  unsaveLabel,
}: {
  food: ChatFoodSuggestion
  saved: boolean
  onToggleSave: () => void
  onOpenDetail: () => void
  saveLabel: string
  unsaveLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onOpenDetail}
      className="relative flex w-full shrink-0 flex-col items-center justify-start gap-0.5 rounded-xl px-1 py-2 text-center transition active:translate-y-0.5"
      style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000' }}
    >
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation()
          onToggleSave()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation()
            e.preventDefault()
            onToggleSave()
          }
        }}
        aria-label={saved ? unsaveLabel : saveLabel}
        aria-pressed={saved}
        className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center"
        style={{ color: saved ? 'var(--accent)' : 'var(--text-secondary)' }}
      >
        <StarIcon className="h-3.5 w-3.5" filled={saved} />
      </span>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center text-2xl" aria-hidden>
        {food.emoji}
      </span>
      <span className="w-full truncate text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {food.name}
      </span>
      {food.tip && (
        <span className="line-clamp-2 flex min-h-[2.2em] w-full items-center justify-center text-[9px] font-bold leading-tight" style={{ color: 'var(--accent-strong)' }}>
          {food.tip}
        </span>
      )}
    </button>
  )
}

/** Detail popup for a tapped chat food card. The bot only ever gives us name/emoji/tip for a
 *  suggested food, so this just presents that same data larger and readably, matching the visual
 *  language of the Superfoods tab's own NutrientInfoModal rather than introducing a new style. */
function ChatFoodDetailModal({
  food,
  saved,
  onToggleSave,
  saveLabel,
  unsaveLabel,
  onClose,
}: {
  food: ChatFoodSuggestion
  saved: boolean
  onToggleSave: () => void
  saveLabel: string
  unsaveLabel: string
  onClose: () => void
}) {
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex w-full max-w-xs flex-col items-center gap-2 rounded-3xl p-4 text-center"
        style={{ backgroundColor: 'var(--surface-cream)', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
      >
        <button
          onClick={onToggleSave}
          aria-label={saved ? unsaveLabel : saveLabel}
          aria-pressed={saved}
          className="absolute start-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: saved ? 'var(--accent)' : 'var(--text-primary)' }}
        >
          <StarIcon className="h-3.5 w-3.5" filled={saved} />
        </button>
        <button
          onClick={onClose}
          aria-label={food.name}
          className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
        <span className="text-4xl" aria-hidden>
          {food.emoji}
        </span>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {food.name}
        </h2>
        {food.tip && (
          <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
            {food.tip}
          </p>
        )}
      </div>
    </div>,
    document.body
  )
}

/** Groups the bot's food suggestions into one bordered square, matching the app's card
 *  language, instead of loose pills floating in the chat bubble area — each card inside is
 *  the same FoodCard-style tile used in the Superfoods tab. */
function ChatFoodGrid({
  foods,
  savedFoodNames,
  onToggleSave,
  onOpenDetail,
  saveLabel,
  unsaveLabel,
}: {
  foods: ChatFoodSuggestion[]
  savedFoodNames: Set<string>
  onToggleSave: (food: ChatFoodSuggestion) => void
  onOpenDetail: (food: ChatFoodSuggestion) => void
  saveLabel: string
  unsaveLabel: string
}) {
  return (
    <div
      className="grid w-full max-w-[92%] grid-cols-2 gap-1.5 rounded-2xl p-2"
      style={{ backgroundColor: CHAT_WALLPAPER }}
    >
      {foods.map((food, fi) => (
        <ChatFoodCard
          key={fi}
          food={food}
          saved={savedFoodNames.has(food.name)}
          onToggleSave={() => onToggleSave(food)}
          onOpenDetail={() => onOpenDetail(food)}
          saveLabel={saveLabel}
          unsaveLabel={unsaveLabel}
        />
      ))}
    </div>
  )
}

/** A full meal suggestion, styled as the same portrait tile as ChatFoodCard (2 per row) instead
 *  of a full-width card dominated by a giant calorie number — that number only belongs in the
 *  detail view below, which also carries the recipe. Tapping the tile opens that detail; the
 *  star stays a separate action so saving/unsaving never also opens it. */
function ChatMealCard({
  meal,
  saved,
  onToggleSave,
  onOpenDetail,
  saveLabel,
  unsaveLabel,
  caloriesLabel,
}: {
  meal: ChatMealSuggestion
  saved: boolean
  onToggleSave: () => void
  onOpenDetail: () => void
  saveLabel: string
  unsaveLabel: string
  caloriesLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onOpenDetail}
      className="relative flex w-full shrink-0 flex-col items-center justify-start gap-0.5 rounded-xl px-1.5 py-2.5 text-center transition active:translate-y-0.5"
      style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000' }}
    >
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation()
          onToggleSave()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation()
            e.preventDefault()
            onToggleSave()
          }
        }}
        aria-label={saved ? unsaveLabel : saveLabel}
        aria-pressed={saved}
        className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center"
        style={{ color: saved ? 'var(--accent)' : 'var(--text-secondary)' }}
      >
        <StarIcon className="h-3.5 w-3.5" filled={saved} />
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center text-2xl" aria-hidden>
        {meal.emoji}
      </span>
      <span className="line-clamp-2 w-full text-[11px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
        {meal.name}
      </span>
      {meal.tip && (
        <span className="line-clamp-2 flex min-h-[2.2em] w-full items-center justify-center text-[9px] font-bold leading-tight" style={{ color: 'var(--accent-strong)' }}>
          {meal.tip}
        </span>
      )}
      <span className="mt-0.5 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
        {Math.round(meal.calories)} <span className="text-[8px] font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>{caloriesLabel}</span>
      </span>
    </button>
  )
}

/** Groups the bot's meal suggestions the same way ChatFoodGrid groups foods — a 2-column grid
 *  of portrait tiles instead of one full-width card per meal. */
function ChatMealGrid({
  meals,
  savedMealNames,
  onToggleSave,
  onOpenDetail,
  saveLabel,
  unsaveLabel,
  caloriesLabel,
}: {
  meals: ChatMealSuggestion[]
  savedMealNames: Set<string>
  onToggleSave: (meal: ChatMealSuggestion) => void
  onOpenDetail: (meal: ChatMealSuggestion) => void
  saveLabel: string
  unsaveLabel: string
  caloriesLabel: string
}) {
  return (
    <div className="grid w-full max-w-[92%] grid-cols-2 gap-1.5 rounded-2xl p-2" style={{ backgroundColor: CHAT_WALLPAPER }}>
      {meals.map((meal, mi) => (
        <ChatMealCard
          key={mi}
          meal={meal}
          saved={savedMealNames.has(meal.name)}
          onToggleSave={() => onToggleSave(meal)}
          onOpenDetail={() => onOpenDetail(meal)}
          saveLabel={saveLabel}
          unsaveLabel={unsaveLabel}
          caloriesLabel={caloriesLabel}
        />
      ))}
    </div>
  )
}

/** Detail popup for a tapped meal tile — same visual language as ChatFoodDetailModal, plus the
 *  full calorie/macro breakdown (via MacroSummaryRow) and the recipe the bot suggested, since
 *  that's too much to fit in the compact grid tile itself. Header (emoji/name/close/star) stays
 *  fixed; only the recipe body scrolls internally if it runs long, matching every other bounded
 *  scroll area in this app — the page itself never scrolls. */
function ChatMealDetailModal({
  meal,
  saved,
  onToggleSave,
  saveLabel,
  unsaveLabel,
  ingredientsLabel,
  stepsLabel,
  onClose,
}: {
  meal: ChatMealSuggestion
  saved: boolean
  onToggleSave: () => void
  saveLabel: string
  unsaveLabel: string
  ingredientsLabel: string
  stepsLabel: string
  onClose: () => void
}) {
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-[80vh] w-full max-w-xs flex-col items-center gap-2 rounded-3xl p-4 text-center"
        style={{ backgroundColor: 'var(--surface-cream)', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
      >
        <button
          onClick={onToggleSave}
          aria-label={saved ? unsaveLabel : saveLabel}
          aria-pressed={saved}
          className="absolute start-3 top-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: saved ? 'var(--accent)' : 'var(--text-primary)' }}
        >
          <StarIcon className="h-3.5 w-3.5" filled={saved} />
        </button>
        <button
          onClick={onClose}
          aria-label={meal.name}
          className="absolute end-3 top-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
        <span className="pt-1 text-4xl" aria-hidden>
          {meal.emoji}
        </span>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {meal.name}
        </h2>

        <div className="thin-scroll flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto pe-1">
          {meal.tip && (
            <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
              {meal.tip}
            </p>
          )}
          <MacroSummaryRow macros={{ calories: meal.calories, carbsG: meal.carbsG, fatG: meal.fatG, proteinG: meal.proteinG }} />
          {meal.recipe.ingredients.length > 0 && (
            <div className="w-full text-start">
              <h3 className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                {ingredientsLabel}
              </h3>
              <ul className="ms-4 list-disc text-xs leading-snug" style={{ color: 'var(--text-primary)' }}>
                {meal.recipe.ingredients.map((ingredient, i) => (
                  <li key={i}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}
          {meal.recipe.steps.length > 0 && (
            <div className="w-full text-start">
              <h3 className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                {stepsLabel}
              </h3>
              <ol className="ms-4 list-decimal text-xs leading-snug" style={{ color: 'var(--text-primary)' }}>
                {meal.recipe.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

/** Short tappable choice chips shown under a clarifying question, so the user can pick one
 *  instead of typing a free-form reply. Picking a chip sends its label back into the chat. */
function ChatOptionRow({ options, disabled, onChoose }: { options: string[]; disabled: boolean; onChoose: (option: string) => void }) {
  return (
    <div className="flex max-w-[92%] flex-wrap gap-1.5">
      {options.map((option, oi) => (
        <button
          key={oi}
          onClick={() => onChoose(option)}
          disabled={disabled}
          className="rounded-md px-3 py-1.5 text-[11px] font-semibold transition active:translate-y-0.5"
          style={{ backgroundColor: 'var(--surface-cream)', boxShadow: '0 6px 14px rgba(11,11,11,0.18), 0 3px 0 rgba(0,0,0,0.25)', color: 'var(--text-primary)', opacity: disabled ? 0.6 : 1 }}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

/** Same visual language as SavedMealCard (FavoritesPanel.tsx) minus the macro row, since a
 *  bot-suggested single food never carries calorie/macro data. */
function SavedChatFoodCard({ food, removeAriaLabel, onRemove }: { food: SavedChatFood; removeAriaLabel: string; onRemove: () => void }) {
  return (
    <div
      className="relative flex flex-col gap-1.5 rounded-2xl p-2.5"
      style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000' }}
    >
      <button
        onClick={onRemove}
        aria-label={removeAriaLabel}
        className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center"
        style={{ color: 'var(--accent)' }}
      >
        <StarIcon className="h-4 w-4" filled />
      </button>
      <div className="flex items-center gap-2 pe-6">
        <span className="text-xl leading-none" aria-hidden>
          {food.emoji}
        </span>
        <span className="truncate text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
          {food.name}
        </span>
      </div>
      {food.tip && (
        <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {food.tip}
        </p>
      )}
    </div>
  )
}

/** Quick-access list of foods and meals starred from the chat (see ChatFoodCard, ChatMealCard) —
 *  opened from the header star so they don't only live, undiscoverable, inside the Superfoods tab. */
function SavedChatItemsModal({
  foods,
  meals,
  onClose,
  onRemoveFood,
  onRemoveMeal,
}: {
  foods: SavedChatFood[]
  meals: SavedMeal[]
  onClose: () => void
  onRemoveFood: (name: string) => void
  onRemoveMeal: (name: string) => void
}) {
  const { lang } = useLanguage()
  const ft = FAVORITES_PANEL_STRINGS[lang]

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(60,42,16,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-[75vh] w-full max-w-md flex-col overflow-hidden rounded-2xl p-4"
        style={{ backgroundColor: '#e5c184', border: '3px solid #000000' }}
      >
        <div className="relative flex shrink-0 items-center justify-center pb-2">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {ft.title}
          </h2>
          <button
            onClick={onClose}
            aria-label={ft.ariaLabel}
            className="absolute end-0 top-0 flex h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--text-primary)' }}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pe-1">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              {ft.savedFoodsTitle}
            </span>
            {foods.length === 0 ? (
              <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {ft.emptyFoods}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {foods.map((food) => (
                  <SavedChatFoodCard key={food.name} food={food} removeAriaLabel={ft.removeAriaLabel} onRemove={() => onRemoveFood(food.name)} />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              {ft.savedMealsTitle}
            </span>
            {meals.length === 0 ? (
              <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {ft.emptyMeals}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {meals.map((meal) => (
                  <SavedMealCard key={meal.name} meal={meal} removeAriaLabel={ft.removeAriaLabel} onRemove={() => onRemoveMeal(meal.name)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

/** The nutrition bot, shown as its own tab (replaces the old workouts tab) so it's always
 *  reachable instead of living behind an overlay trigger. */
export function ChatPanel() {
  const { lang, dir } = useLanguage()
  const t = NUTRITION_CHAT_STRINGS[lang]
  const st = SUPERFOODS_PANEL_CHROME[lang]
  // Restored from localStorage (see chatHistory.ts) so switching tabs — which remounts this
  // component — doesn't wipe the conversation; falls back to the greeting after 48h of inactivity.
  const [turns, setTurns] = useState<ChatTurn[]>(() => getChatHistory() ?? [{ role: 'assistant', content: t.greeting }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(() => getSavedMeals())
  const [savedChatFoods, setSavedChatFoods] = useState<SavedChatFood[]>(() => getSavedChatFoods())
  const [personality, setPersonality] = useState<BotPersonality>(() => getBotPersonality())
  const [showPersonalityModal, setShowPersonalityModal] = useState(false)
  const [showSavedItems, setShowSavedItems] = useState(false)
  const [detailFood, setDetailFood] = useState<ChatFoodSuggestion | null>(null)
  const [detailMeal, setDetailMeal] = useState<ChatMealSuggestion | null>(null)
  const [mood, setMood] = useState<BotMoodStatus | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const savedMealNames = new Set(savedMeals.map((m) => m.name))
  const savedChatFoodNames = new Set(savedChatFoods.map((f) => f.name))

  // Tracks whether this instance is still mounted, so an in-flight sendMessage that resolves
  // after a tab switch (which unmounts this component) persists its reply straight to storage
  // instead of calling setTurns — React silently drops state updates on unmounted components,
  // which otherwise swallows the bot's reply entirely.
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Re-read fresh each time the chat tab is opened (this component remounts on tab switch),
  // so the angry state always reflects today's latest food log and challenge status.
  useEffect(() => {
    getTodaysBotMood().then(setMood)
  }, [])

  // One-shot per chat visit: at most one bot-initiated message beyond the static greeting.
  // Priority is a just-started challenge, then a just-completed one (both flagged by
  // CalendarPanel since this component remounts on every tab switch and can't hold that state
  // itself), and only otherwise — occasionally, gated by shouldSendCheckIn — an unprompted
  // check-in so the bot doesn't feel silent between events.
  useEffect(() => {
    const startedChallenge = consumePendingChallengeAnnounce()
    const completedChallenge = consumePendingChallengeCompleted()
    const isGrumpy = personality === 'angry' || personality === 'superAngry'

    if (startedChallenge) {
      const template = pickRandom(isGrumpy ? t.challengeStartedGrumpy : t.challengeStartedGentle)
      const content = template.replace('{challenge}', startedChallenge)
      setTurns((prev) => [...prev, { role: 'assistant', content, options: [t.tipsYes, t.tipsNo] }])
    } else if (completedChallenge) {
      const template = pickRandom(isGrumpy ? t.challengeCompletedGrumpy : t.challengeCompletedGentle)
      const content = template.replace('{challenge}', completedChallenge)
      setTurns((prev) => [...prev, { role: 'assistant', content, options: [t.nextChallengeYes, t.tipsNo] }])
    } else if (shouldSendCheckIn()) {
      const content = pickRandom(isGrumpy ? t.checkInGrumpy : t.checkInGentle)
      setTurns((prev) => [...prev, { role: 'assistant', content }])
      markCheckInSent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isAngry = personality === 'superAngry' && !!mood && (!!mood.junkFoodName || mood.challengeBroken)

  function toggleSavedMeal(meal: ChatMealSuggestion) {
    if (savedMealNames.has(meal.name)) unsaveMeal(meal.name)
    else saveMeal(meal)
    setSavedMeals(getSavedMeals())
  }

  function toggleSavedChatFood(food: ChatFoodSuggestion) {
    if (savedChatFoodNames.has(food.name)) unsaveChatFood(food.name)
    else saveChatFood(food)
    setSavedChatFoods(getSavedChatFoods())
  }

  function handleSelectPersonality(next: BotPersonality) {
    setPersonality(next)
    setBotPersonality(next)
    setShowPersonalityModal(false)
  }

  function handleBotIconClick() {
    if (!isAngry || !mood) return
    const template = mood.junkFoodName ? pickRandom(t.angryRantFood) : pickRandom(t.angryRantChallenge)
    const content = template.replace('{food}', mood.junkFoodName ?? '').replace('{challenge}', mood.challengeName ?? '')
    setTurns((prev) => [...prev, { role: 'assistant', content, angry: true }])
  }

  /** Proposes a challenge from the same template list the manual "add goal" flow uses, with a
   *  plain confirm / different-one choice — resolved locally so this never round-trips through
   *  the nutrition Q&A bot, which has no concept of challenges and would otherwise just answer
   *  as if it were asked a food question (see ChatOptionRow onChoose below). */
  function suggestChallenge(excludeId?: ChallengeTemplateId) {
    const templates = CHALLENGE_TEMPLATES[lang]
    const pool = CHALLENGE_TEMPLATE_IDS.filter((id) => id !== excludeId)
    const id = pickRandom(pool.length > 0 ? pool : CHALLENGE_TEMPLATE_IDS)
    const content = t.challengeSuggestPrompt.replace('{challenge}', templates[id].label)
    setTurns((prev) => [
      ...prev,
      { role: 'assistant', content, options: [t.confirmChallengeOption, t.differentChallengeOption], challengeSuggestionId: id },
    ])
  }

  async function confirmChallenge(id: ChallengeTemplateId) {
    const name = CHALLENGE_TEMPLATES[lang][id].label
    const entry: WorkoutEntry = { id: crypto.randomUUID(), date: todayKey(), createdAt: new Date().toISOString(), name, done: false }
    await addWorkout(entry)
    const isGrumpy = personality === 'angry' || personality === 'superAngry'
    const template = pickRandom(isGrumpy ? t.challengeStartedGrumpy : t.challengeStartedGentle)
    const content = template.replace('{challenge}', name)
    setTurns((prev) => [...prev, { role: 'assistant', content, options: [t.tipsYes, t.tipsNo] }])
  }

  /** Routes a tapped option chip: challenge suggestions and the "suggest one" prompt that leads
   *  into them are handled locally, everything else is sent to the bot as a normal chat reply. */
  function handleOptionChoose(option: string, turn: ChatTurn) {
    if (turn.challengeSuggestionId) {
      if (option === t.confirmChallengeOption) confirmChallenge(turn.challengeSuggestionId)
      else suggestChallenge(turn.challengeSuggestionId)
      return
    }
    if (option === t.nextChallengeYes) {
      suggestChallenge()
      return
    }
    sendMessage(option)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, loading])

  useEffect(() => {
    setChatHistory(turns)
  }, [turns])

  async function sendMessage(text: string) {
    if (!text || loading) return
    const next: ChatTurn[] = [...turns, { role: 'user', content: text }]
    setTurns(next)
    setLoading(true)

    function appendReply(reply: ChatTurn) {
      if (mountedRef.current) {
        setTurns((prev) => [...prev, reply])
      } else {
        // Component unmounted (tab switch) while the request was in flight — write straight to
        // storage so the reply is there next time the chat tab remounts, instead of being lost.
        setChatHistory([...(getChatHistory() ?? next), reply])
      }
    }

    try {
      const res = await askNutritionBot(
        next.map(({ role, content }) => ({ role, content })),
        lang,
        'nutrition',
        personality
      )
      appendReply({ role: 'assistant', content: res.reply, options: res.options, foods: res.foods, meals: res.meals })
    } catch (err) {
      appendReply({ role: 'assistant', content: err instanceof AnalyzeError ? err.message : t.errorMessage })
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    sendMessage(text)
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-20 pt-12">
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl ${isAngry ? 'border-blink-critical' : ''}`}
        style={{ border: '3px solid #000000', boxShadow: '0 5px 0 #c9a463' }}
      >
        <div
          className="relative flex shrink-0 items-center justify-center gap-1.5 px-3 py-2.5 transition-colors"
          style={{ backgroundColor: isAngry ? CHAT_HEADER_ANGRY : CHAT_HEADER }}
        >
          <button
            type="button"
            onClick={handleBotIconClick}
            aria-label={isAngry ? t.angryIconAriaLabel : t.title}
            className={`flex h-5 w-5 shrink-0 items-center justify-center ${isAngry ? 'bot-angry-shake' : ''}`}
            style={{ color: '#f5deb3' }}
          >
            <BotIcon className="h-full w-full" />
          </button>
          <button type="button" onClick={() => setShowPersonalityModal(true)} className="text-sm font-semibold" style={{ color: '#f5deb3' }}>
            {t.title}
          </button>
          <button
            type="button"
            onClick={() => setShowSavedItems(true)}
            aria-label={FAVORITES_PANEL_STRINGS[lang].title}
            className="absolute end-3 flex h-6 w-6 items-center justify-center"
            style={{ color: '#f5deb3' }}
          >
            <StarIcon className="h-4 w-4" filled={savedMeals.length > 0 || savedChatFoods.length > 0} />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="thin-scroll flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-3"
          style={{ backgroundColor: CHAT_WALLPAPER }}
        >
          {turns.map((turn, i) => (
            <div key={i} className={`flex flex-col gap-1 ${turn.role === 'user' ? 'items-start' : 'items-end'}`}>
              <p
                className={`max-w-[85%] px-3 py-2 text-start text-xs leading-snug ${
                  turn.role === 'user' ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'
                }`}
                style={{
                  backgroundColor: turn.angry ? 'var(--status-critical-soft)' : turn.role === 'user' ? CHAT_OUTGOING : 'var(--surface-cream)',
                  color: turn.angry ? 'var(--status-critical)' : 'var(--text-primary)',
                  boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                }}
              >
                {turn.content}
              </p>
              {turn.options && turn.options.length > 0 && (
                <ChatOptionRow options={turn.options} disabled={loading} onChoose={(option) => handleOptionChoose(option, turn)} />
              )}
              {turn.foods && turn.foods.length > 0 && (
                <ChatFoodGrid
                  foods={turn.foods}
                  savedFoodNames={savedChatFoodNames}
                  onToggleSave={toggleSavedChatFood}
                  onOpenDetail={setDetailFood}
                  saveLabel={st.save}
                  unsaveLabel={st.unsave}
                />
              )}
              {turn.meals && turn.meals.length > 0 && (
                <ChatMealGrid
                  meals={turn.meals}
                  savedMealNames={savedMealNames}
                  onToggleSave={toggleSavedMeal}
                  onOpenDetail={setDetailMeal}
                  saveLabel={st.save}
                  unsaveLabel={st.unsave}
                  caloriesLabel={MACRO_LABELS[lang].calories}
                />
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-1 self-end rounded-2xl rounded-bl-sm px-3 py-2.5" aria-hidden style={{ backgroundColor: 'var(--surface-cream)', boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="typing-dot h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--text-secondary)', animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex shrink-0 items-center gap-1.5 p-2.5"
          style={{ backgroundColor: CHAT_WALLPAPER }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            dir={dir}
            lang={lang}
            className="min-w-0 flex-1 rounded-full px-3 py-2 text-xs outline-none"
            style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)', border: '2px solid #000000' }}
          />
          <button
            type="submit"
            aria-label={t.sendAriaLabel}
            disabled={loading || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition"
            style={{ backgroundColor: CHAT_HEADER, color: '#f5deb3', opacity: loading || !input.trim() ? 0.5 : 1 }}
          >
            <SendIcon className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      <p className="shrink-0 px-2 pt-1.5 text-center text-[10px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
        {t.disclaimer}
      </p>

      {showPersonalityModal && (
        <BotPersonalityModal current={personality} onClose={() => setShowPersonalityModal(false)} onSelect={handleSelectPersonality} />
      )}

      {detailFood && (
        <ChatFoodDetailModal
          food={detailFood}
          saved={savedChatFoodNames.has(detailFood.name)}
          onToggleSave={() => toggleSavedChatFood(detailFood)}
          saveLabel={st.save}
          unsaveLabel={st.unsave}
          onClose={() => setDetailFood(null)}
        />
      )}

      {detailMeal && (
        <ChatMealDetailModal
          meal={detailMeal}
          saved={savedMealNames.has(detailMeal.name)}
          onToggleSave={() => toggleSavedMeal(detailMeal)}
          saveLabel={st.save}
          unsaveLabel={st.unsave}
          ingredientsLabel={t.recipeIngredients}
          stepsLabel={t.recipeSteps}
          onClose={() => setDetailMeal(null)}
        />
      )}

      {showSavedItems && (
        <SavedChatItemsModal
          foods={savedChatFoods}
          meals={savedMeals}
          onClose={() => setShowSavedItems(false)}
          onRemoveFood={(name) => {
            unsaveChatFood(name)
            setSavedChatFoods(getSavedChatFoods())
          }}
          onRemoveMeal={(name) => {
            unsaveMeal(name)
            setSavedMeals(getSavedMeals())
          }}
        />
      )}
    </div>
  )
}
