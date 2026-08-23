import type { NutrientAmounts, NutrientId } from '../types'
import { getVisibleNutrients } from '../lib/nutrients'

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
        className="mx-auto w-[70%] min-h-0 flex-1 overflow-hidden rounded-2xl"
        style={{ border: '3px solid #000000' }}
      >
        <div
          className="thin-scroll grid h-full grid-cols-1 gap-1.5 overflow-y-auto py-2 pl-2 pr-3"
          style={{ backgroundColor: '#e5c184' }}
        >
          {getVisibleNutrients().map((n) => (
            <label
              key={n.id}
              className="flex min-w-0 items-center justify-between gap-2 rounded-xl px-2 py-1"
              style={{ backgroundColor: '#fdf6e8' }}
            >
              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
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
                className="h-9 w-9 shrink-0 rounded-lg p-0 text-center text-xs"
                style={{ backgroundColor: 'var(--surface-2)', border: '2px solid #000000', color: 'var(--text-primary)' }}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
