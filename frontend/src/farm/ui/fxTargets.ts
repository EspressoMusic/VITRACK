/** HUD elements that rewards fly toward. Registered by the components that render them. */
export type FxTarget = 'coins' | 'xp' | 'barn'

export const fxTargets: Partial<Record<FxTarget, HTMLElement | null>> = {}

export function fxTargetRef(name: FxTarget) {
  return (el: HTMLElement | null) => {
    fxTargets[name] = el
  }
}
