import type { NutrientAmounts, NutrientId } from '../types'
import { NUTRIENTS } from '../lib/nutrients'

/**
 * Lets the user key in nutrient amounts straight off a product's nutrition-facts label —
 * used for foods (e.g. vitamin-fortified cereal) or supplements that aren't in the food
 * list and shouldn't go through the AI estimator. Always saved as a single (1x) serving.
 */
export function CustomNutritionForm({
  name,
  onNameChange,
  values,
  onValueChange,
}: {
  name: string
  onNameChange: (v: string) => void
  values: NutrientAmounts
  onValueChange: (id: NutrientId, v: number) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Food or supplement name…"
        className="mx-auto w-[70%] rounded-xl px-3 py-2 text-sm"
        style={{ backgroundColor: 'var(--surface-2)', border: '2px solid #000000', color: 'var(--text-primary)' }}
      />
      <div
        className="thin-scroll mx-auto grid w-[70%] min-h-0 flex-1 grid-cols-1 gap-1.5 overflow-y-auto rounded-2xl p-2"
        style={{ backgroundColor: '#e5c184', border: '3px solid #000000' }}
      >
        {NUTRIENTS.map((n) => (
          <label
            key={n.id}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5"
            style={{ backgroundColor: '#fdf6e8' }}
          >
            <span className="w-[92px] shrink-0 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {n.shortLabel} <span style={{ color: 'var(--text-secondary)' }}>({n.unit})</span>
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={values[n.id] === 0 ? '' : values[n.id]}
              onChange={(e) => onValueChange(n.id, e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="0"
              className="w-full min-w-0 flex-1 rounded-lg px-1.5 py-1 text-base"
              style={{ backgroundColor: 'var(--surface-2)', border: '3px solid #000000', color: 'var(--text-primary)' }}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
