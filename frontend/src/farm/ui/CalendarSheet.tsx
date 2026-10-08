import { CalendarPanel } from '../../components/CalendarPanel'
import { CloseIcon } from '../../components/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { BROWN, INK, NAV_CLEARANCE, WHEAT } from './kit'

/** The food calendar board's window: the calendar of everything eaten, floating over the town. Tap the map around it to close. */
export function CalendarSheet({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  return (
    <div
      className="modal-backdrop-enter absolute inset-x-0 top-0 z-[47] flex items-center justify-center px-3 pt-14"
      style={{ bottom: NAV_CLEARANCE, backgroundColor: 'rgba(20,14,4,0.2)' }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-card-enter relative w-full max-w-md">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="absolute end-5 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full active:translate-y-0.5"
          style={{ backgroundColor: BROWN, color: WHEAT, border: `2px solid ${INK}`, boxShadow: `0 2px 0 ${INK}` }}
        >
          <CloseIcon className="h-4 w-4" />
        </button>
        <CalendarPanel refreshSignal={0} />
      </div>
    </div>
  )
}
