import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { CALENDAR_PANEL_STRINGS } from '../lib/i18n/calendarPanel'
import { CHALLENGE_TEMPLATES, CHALLENGE_TEMPLATE_IDS, type ChallengeTemplateId } from '../lib/nutritionChallengeTemplates'
import { CloseIcon, TrashIcon } from './icons'

export function AddGoalModal({
  initialName,
  onClose,
  onSave,
  onDelete,
}: {
  initialName?: string
  onClose: () => void
  onSave: (name: string) => void
  onDelete?: () => void
}) {
  const { lang, dir } = useLanguage()
  const t = CALENDAR_PANEL_STRINGS[lang]
  const isEditing = initialName !== undefined
  const [name, setName] = useState(initialName ?? '')
  const templates = CHALLENGE_TEMPLATES[lang]

  function applyTemplate(id: ChallengeTemplateId) {
    setName(templates[id].label)
  }

  function handleSave() {
    onSave(name.trim() || t.defaultGoalName)
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
              {isEditing ? t.editModalTitle : t.addModalTitle}
            </h2>
          </div>

          <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-0.5 pb-1">
            {!isEditing && (
              <div className="flex flex-col gap-1.5">
                <div className="grid grid-cols-2 gap-2">
                  {CHALLENGE_TEMPLATE_IDS.map((id) => {
                    const selected = name === templates[id].label
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => applyTemplate(id)}
                        className="flex min-h-[3rem] items-center justify-center gap-1.5 rounded-full px-3 py-2 text-center text-sm font-semibold transition"
                        style={{
                          backgroundColor: selected ? 'var(--accent)' : 'var(--surface-cream)',
                          border: '2px solid #000000',
                          color: selected ? 'white' : 'var(--text-primary)',
                        }}
                      >
                        <span aria-hidden>{templates[id].emoji}</span>
                        {templates[id].label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.goalNamePlaceholder}
              dir={dir}
              lang={lang}
              className="w-full rounded-full px-4 py-2.5 text-sm outline-none"
              style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', color: 'var(--text-primary)' }}
            />
          </div>

          <button
            onClick={handleSave}
            className="mt-3 flex shrink-0 items-center justify-center rounded-full py-2.5 text-sm font-semibold transition"
            style={{ backgroundColor: 'var(--accent)', color: 'white', border: '2px solid #000000' }}
          >
            {t.saveButtonLabel}
          </button>

          {isEditing && onDelete && (
            <button
              onClick={onDelete}
              className="mt-2 flex shrink-0 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold"
              style={{ color: 'var(--status-critical)' }}
            >
              <TrashIcon className="h-3.5 w-3.5" />
              {t.deleteGoalAriaLabel}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
