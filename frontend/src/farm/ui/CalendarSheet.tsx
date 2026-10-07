import { CalendarPanel } from '../../components/CalendarPanel'
import { CloseIcon } from '../../components/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { BROWN, INK, WHEAT } from './kit'

/** The food calendar board's window: the full calendar of everything eaten, over the town. */
export function CalendarSheet({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  return (
    <div
      className="modal-backdrop-enter absolute inset-0 z-[47] flex flex-col"
      style={{
        backgroundColor: 'var(--surface-0)',
        backgroundImage: "url('/background-plain.png?v=3')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      <div className="flex shrink-0 justify-end px-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="flex h-9 w-9 items-center justify-center rounded-full active:translate-y-0.5"
          style={{ backgroundColor: BROWN, color: WHEAT, border: `2px solid ${INK}`, boxShadow: `0 2px 0 ${INK}` }}
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <CalendarPanel refreshSignal={0} />
      </div>
    </div>
  )
}
