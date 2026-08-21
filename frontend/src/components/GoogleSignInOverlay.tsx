import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Invisible layer that sits on top of a visually-styled sign-in button and triggers the real
 * Google sign-in flow on click — the real Google button must receive the actual click for the
 * account picker to show our own domain instead of the Supabase project's supabase.co URL.
 * Place inside a `relative`-positioned wrapper alongside the visible (aria-hidden) fake button.
 */
export function GoogleSignInOverlay() {
  const { renderGoogleButton } = useAuth()
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (ref.current) renderGoogleButton(ref.current)
  }, [renderGoogleButton])

  // A <span>, not a <div>: this can end up nested inside a <p> (e.g. PaywallPanel's
  // "Already purchased?" link), and <p> only permits inline/phrasing content in valid HTML.
  return <span ref={ref} className="absolute inset-0 block overflow-hidden opacity-0" />
}
