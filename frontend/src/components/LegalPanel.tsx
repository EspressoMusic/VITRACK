import { LEGAL_PARTS, LEGAL_LAST_UPDATED } from '../lib/legalContent'
import { CloseIcon } from './icons'

export function LegalPanel({ onClose }: { onClose: () => void }) {
  function scrollToPart(id: string) {
    document.getElementById(`legal-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl"
        style={{ backgroundColor: '#f7e4ad', border: '1px solid #1a1a19' }}
      >
        <div
          className="relative flex shrink-0 items-center justify-center p-5"
          style={{ borderBottom: '1px solid rgba(26,26,25,0.15)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Terms & Privacy Policy
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-full"
            style={{ color: 'var(--text-secondary)' }}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4" style={{ color: 'var(--text-primary)' }}>
          <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            Last updated: {LEGAL_LAST_UPDATED}
          </p>

          <div className="mb-5 flex flex-wrap gap-1.5">
            {LEGAL_PARTS.map((part) => (
              <button
                key={part.id}
                onClick={() => scrollToPart(part.id)}
                className="rounded-full px-3 py-1.5 text-[11px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-strong)', boxShadow: '0 1px 0 var(--border-strong)', color: 'var(--text-primary)' }}
              >
                {part.title}
              </button>
            ))}
          </div>

          {LEGAL_PARTS.map((part) => (
            <section key={part.id} id={`legal-${part.id}`} className="mb-7 scroll-mt-2">
              <h3 className="mb-3 text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {part.title}
              </h3>
              {part.blocks.map((block, i) => (
                <div key={i} className="mb-4">
                  {block.heading && (
                    <h4 className="mb-1.5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {block.heading}
                    </h4>
                  )}
                  <div className="flex flex-col gap-2">
                    {block.paragraphs.map((p, j) =>
                      p.startsWith('• ') ? (
                        <p key={j} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {p}
                        </p>
                      ) : (
                        <p key={j} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {p}
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
