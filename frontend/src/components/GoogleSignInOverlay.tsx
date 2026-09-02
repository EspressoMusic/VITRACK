import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Invisible layer that sits on top of a visually-styled sign-in button and triggers the real
 * Google sign-in flow on click — the real Google button must receive the actual click for the
 * account picker to show our own domain instead of the Supabase project's supabase.co URL.
 * Place inside a `relative`-positioned wrapper alongside the visible (aria-hidden) fake button.
 *
 * When `disabled` (e.g. the user hasn't agreed to the Terms/Privacy Policy yet), the real
 * Google button is kept out of the click path entirely — clicks land on a transparent catcher
 * that fires `onBlockedClick` instead, so sign-in can never fire without consent.
 */
export function GoogleSignInOverlay({ disabled, onBlockedClick }: { disabled?: boolean; onBlockedClick?: () => void }) {
  const { renderGoogleButton } = useAuth()
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (ref.current) renderGoogleButton(ref.current)
  }, [renderGoogleButton])

  return (
    <>
      {/* A <span>, not a <div>: this can end up nested inside a <p> (e.g. PaywallPanel's
          "Already purchased?" link), and <p> only permits inline/phrasing content in valid HTML. */}
      <span
        ref={ref}
        className="absolute inset-0 block overflow-hidden opacity-0"
        style={{ pointerEvents: disabled ? 'none' : 'auto' }}
      />
      {disabled && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={onBlockedClick}
          className="absolute inset-0 cursor-pointer"
        />
      )}
    </>
  )
}
