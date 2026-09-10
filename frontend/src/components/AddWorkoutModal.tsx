import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { WorkoutExercise } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import { WORKOUTS_PANEL_STRINGS } from '../lib/i18n/workoutsPanel'
import { WORKOUT_TEMPLATES, WORKOUT_TEMPLATE_IDS, type WorkoutTemplateId } from '../lib/workoutTemplates'
import { CloseIcon, PlusIcon, TrashIcon } from './icons'

export function AddWorkoutModal({
  initialName,
  initialExercises,
  onClose,
  onSave,
}: {
  initialName?: string
  initialExercises?: WorkoutExercise[]
  onClose: () => void
  onSave: (name: string, exercises: WorkoutExercise[]) => void
}) {
  const { lang, dir } = useLanguage()
  const t = WORKOUTS_PANEL_STRINGS[lang]
  const isEditing = initialName !== undefined
  const [name, setName] = useState(initialName ?? '')
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialExercises ?? [])
  const templates = WORKOUT_TEMPLATES[lang]

  function applyTemplate(id: WorkoutTemplateId) {
    const template = templates[id]
    setName(template.label)
    setExercises(template.exercises.map((ex) => ({ id: crypto.randomUUID(), ...ex })))
  }

  function addExerciseRow() {
    setExercises((prev) => [...prev, { id: crypto.randomUUID(), name: '' }])
  }

  function updateExercise(id: string, patch: Partial<WorkoutExercise>) {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)))
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id))
  }

  function handleSave() {
    const cleanExercises = exercises.map((ex) => ({ ...ex, name: ex.name.trim() })).filter((ex) => ex.name)
    onSave(name.trim() || t.defaultWorkoutName, cleanExercises)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(60,42,16,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div className="modal-card-enter relative z-10 w-full max-w-md">
        <button
          onClick={onClose}
          aria-label={t.closeAriaLabel}
          className="absolute -top-3 -end-3 z-20 flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)', border: '2px solid #000000' }}
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div
          className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl p-4"
          style={{ backgroundColor: '#e5c184', border: '3px solid #000000' }}
        >
          <div className="mb-3 flex shrink-0 items-center justify-center">
            <h2 className="whitespace-nowrap py-1.5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {isEditing ? t.editModalTitle : t.modalTitle}
            </h2>
          </div>

          <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-0.5 pb-1">
            {!isEditing && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {t.templatesLabel}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {WORKOUT_TEMPLATE_IDS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => applyTemplate(id)}
                      className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold"
                      style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', color: 'var(--text-primary)' }}
                    >
                      <span aria-hidden>{templates[id].emoji}</span>
                      {templates[id].label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.workoutNamePlaceholder}
              dir={dir}
              lang={lang}
              className="w-full rounded-full px-4 py-2.5 text-sm outline-none"
              style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', color: 'var(--text-primary)' }}
            />

            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="flex flex-col gap-1.5 rounded-xl p-2.5"
                style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000' }}
              >
                <div className="flex items-center gap-1.5">
                  <input
                    value={ex.name}
                    onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                    placeholder={t.exerciseNamePlaceholder}
                    dir={dir}
                    lang={lang}
                    className="min-w-0 flex-1 bg-transparent text-xs font-medium outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  <button
                    onClick={() => removeExercise(ex.id)}
                    aria-label={t.removeExerciseAriaLabel}
                    className="flex h-6 w-6 shrink-0 items-center justify-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={ex.sets ?? ''}
                    onChange={(e) => updateExercise(ex.id, { sets: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder={t.setsPlaceholder}
                    className="min-w-0 flex-1 rounded-full px-2 py-1 text-center text-[11px] outline-none"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                  <input
                    type="number"
                    min={0}
                    value={ex.reps ?? ''}
                    onChange={(e) => updateExercise(ex.id, { reps: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder={t.repsPlaceholder}
                    className="min-w-0 flex-1 rounded-full px-2 py-1 text-center text-[11px] outline-none"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addExerciseRow}
              className="flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium"
              style={{ backgroundColor: 'rgba(0,0,0,0.05)', border: '2px dashed var(--border)', color: 'var(--text-secondary)' }}
            >
              <PlusIcon className="h-3.5 w-3.5" strokeWidth={3} />
              {t.addExerciseLabel}
            </button>
          </div>

          <button
            onClick={handleSave}
            className="mt-3 flex shrink-0 items-center justify-center rounded-full py-2.5 text-sm font-semibold transition"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            {t.saveButtonLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
