/** A small collectible plush-doll figure, filled with a tier color when unlocked or a flat gray
 *  silhouette when locked. Matches the app's thick-black-outline, flat-color cartoon style
 *  (see BodyFillGauge's bust silhouette). */
export function AchievementDoll({ color, locked, className = 'h-11 w-11' }: { color: string; locked: boolean; className?: string }) {
  const fill = locked ? '#d9d3c4' : color

  return (
    <svg viewBox="0 0 64 76" className={className} role="img" aria-hidden>
      <path
        d="M14 74 C14 52 20 40 32 40 C44 40 50 52 50 74 Z"
        fill={fill}
        stroke="#000000"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M14 58 C7 58 5 66 8 71" fill="none" stroke="#000000" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M50 58 C57 58 59 66 56 71" fill="none" stroke="#000000" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="32" cy="16" r="13" fill={fill} stroke="#000000" strokeWidth="2.6" />
      {locked ? (
        <>
          <circle cx="27" cy="15.5" r="1.6" fill="rgba(0,0,0,0.35)" />
          <circle cx="37" cy="15.5" r="1.6" fill="rgba(0,0,0,0.35)" />
        </>
      ) : (
        <>
          <circle cx="27" cy="15.5" r="1.8" fill="#1a1a19" />
          <circle cx="37" cy="15.5" r="1.8" fill="#1a1a19" />
          <path d="M27 20.5c1.6 1.6 5.4 1.6 7 0" fill="none" stroke="#1a1a19" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}
