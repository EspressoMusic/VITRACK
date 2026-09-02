type IconProps = { className?: string; style?: React.CSSProperties; strokeWidth?: number }

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
}

export function CameraIcon({ className, style, strokeWidth }: IconProps) {
  return (
    <svg className={className} style={style} {...base} strokeWidth={strokeWidth ?? base.strokeWidth}>
      <path d="M4 8.2a1.2 1.2 0 0 1 1.2-1.2h2.1l1.15-1.75A1.2 1.2 0 0 1 9.45 4.7h5.1a1.2 1.2 0 0 1 1 .55L16.7 7h2.1A1.2 1.2 0 0 1 20 8.2v9.6A1.2 1.2 0 0 1 18.8 19H5.2A1.2 1.2 0 0 1 4 17.8Z" />
      <circle cx="12" cy="13" r="3.1" />
    </svg>
  )
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5c2.6 2.4 4 5.3 4 8.5s-1.4 6.1-4 8.5c-2.6-2.4-4-5.3-4-8.5s1.4-6.1 4-8.5Z" />
      <path d="M4 12h16" />
    </svg>
  )
}

export function CalendarIcon({ className, style, strokeWidth }: IconProps) {
  return (
    <svg className={className} style={style} {...base} strokeWidth={strokeWidth ?? base.strokeWidth}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.4" />
      <path d="M4 9.7h16" />
      <path d="M8.4 3.3v3.6M15.6 3.3v3.6" />
      <circle cx="8.4" cy="13.6" r="0.35" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.6" r="0.35" fill="currentColor" stroke="none" />
      <circle cx="15.6" cy="13.6" r="0.35" fill="currentColor" stroke="none" />
      <circle cx="8.4" cy="16.8" r="0.35" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16.8" r="0.35" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function InsightsIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 7.5c-1-1.4-2.6-2-4.2-1.6C5.8 6.4 4.5 8.2 4.5 10.6c0 4.2 3.4 8.6 6.4 10.7.7.5 1.5.5 2.2 0 3-2.1 6.4-6.5 6.4-10.7 0-2.4-1.3-4.2-3.3-4.7-1.6-.4-3.2.2-4.2 1.6Z" />
      <path d="M12 7.5c0-1.8.6-3.2 1.8-4.3" />
    </svg>
  )
}

export function GearIcon({ className, style, strokeWidth }: IconProps) {
  return (
    <svg className={className} style={style} {...base} strokeWidth={strokeWidth ?? base.strokeWidth}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
    </svg>
  )
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.5 4.4-5.5 7.5-5.5s6.1 2 7.5 5.5" />
    </svg>
  )
}

export function LogOutIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M13 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 8l-4 4 4 4M3.5 12H15" />
    </svg>
  )
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3.5l2.4 5 5.4.6-4 3.8.9 5.5-4.7-2.6-4.7 2.6.9-5.5-4-3.8 5.4-.6z" />
    </svg>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function MedalIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="15" r="5.5" />
      <path d="M9.5 15.2l1.6 1.6 3.2-3.4" />
      <path d="M8.2 10.2 5.5 3.5h3.4l2 5M15.8 10.2l2.7-6.7h-3.4l-2 5" />
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 7h16M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M6.5 7l.7 12.1a2 2 0 0 0 2 1.9h5.6a2 2 0 0 0 2-1.9L17.5 7" />
    </svg>
  )
}

export function ScaleIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="14.5" r="6.5" />
      <path d="M12 11v3.5l2.2 2.2" />
      <path d="M9.5 4.5h5M12 4.5V8" />
    </svg>
  )
}

export function RulerIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="4" y="8" width="16" height="8" rx="1.5" transform="rotate(-45 12 12)" />
      <path d="M9.5 9.5 11 11M12.5 6.5 14 8M6.5 12.5 8 14" />
    </svg>
  )
}

export function ActivityIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M3 13h3.5l2-6 3 12 2-9 1.5 3H21" />
    </svg>
  )
}

export function LeafIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M19 5c-8.5 0-14 5.5-14 14 8.5 0 14-5.5 14-14Z" />
      <path d="M6 18 16 8" />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3.5c.5 3 2 5 5 5.5-3 .5-4.5 2.5-5 5.5-.5-3-2-5-5-5.5 3-.5 4.5-2.5 5-5.5Z" />
      <path d="M18.5 15.5c.3 1.5 1 2.2 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.3 2.2-1 2.5-2.5Z" />
    </svg>
  )
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M7 3.5h7.2L18 7.3V19a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 19V4.7A1.2 1.2 0 0 1 7 3.5Z" />
      <path d="M14 3.5V7a1 1 0 0 0 1 1h3" />
      <path d="M8.5 12h7M8.5 15.3h7M8.5 8.7h2.5" />
    </svg>
  )
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  )
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3.5v11.5M8 11l4 4 4-4" />
      <path d="M4.5 16.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2.5" />
    </svg>
  )
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14.5 6 10.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function SwapIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 8h13M13 4.5 17 8l-4 3.5" />
      <path d="M20 16H7M11 12.5 7 16l4 3.5" />
    </svg>
  )
}

export function HeadsetIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.5" y="13" width="4" height="6.5" rx="1.6" />
      <rect x="17.5" y="13" width="4" height="6.5" rx="1.6" />
      <path d="M19.5 19.5v.5a2.5 2.5 0 0 1-2.5 2.5h-2.5" />
    </svg>
  )
}

export function CakeIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 20v-6.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2V20" />
      <path d="M3 20h18" />
      <path d="M8 11.5V8M12 11.5V8M16 11.5V8" />
      <path d="M8 5.5c0-1 .6-1.3.6-2S8 2 8 2M12 5.5c0-1 .6-1.3.6-2S12 2 12 2M16 5.5c0-1 .6-1.3.6-2S16 2 16 2" />
    </svg>
  )
}

export function SendIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4.5 19.5 20 12 4.5 4.5l1.8 6.3L15 12l-8.7 1.2-1.8 6.3Z" />
    </svg>
  )
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 5.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9l-4.5 4V16H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

export function HeartIcon({ className, style, strokeWidth, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg className={className} style={style} {...base} strokeWidth={strokeWidth ?? base.strokeWidth} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20.2s-7.3-4.5-9.7-9C0.6 7.9 1.8 4.6 5 3.5c2.2-0.7 4.4 0.1 5.9 2 .4.5.7 1 1.1 1.6.4-.6.7-1.1 1.1-1.6 1.5-1.9 3.7-2.7 5.9-2 3.2 1.1 4.4 4.4 2.7 7.7-2.4 4.5-9.7 9-9.7 9Z" />
    </svg>
  )
}

export function AppleIcon({ className, style, strokeWidth }: IconProps) {
  return (
    <svg className={className} style={style} {...base} strokeWidth={strokeWidth ?? base.strokeWidth}>
      <path d="M12.3 8.7c-3.2-2.7-7.7-.7-7.7 4.3 0 4.4 3.1 8.3 5.8 8.3.8 0 1.3-.4 1.8-.4s1 .4 1.8.4c2.7 0 5.8-3.9 5.8-8.3 0-5-4.5-7-7.7-4.3Z" />
      <path d="M12.3 8.7c-.15-1.9.7-3.5 2.3-4.4" />
    </svg>
  )
}

export function PlusIcon({ className, style, strokeWidth }: IconProps) {
  return (
    <svg className={className} style={style} {...base} strokeWidth={strokeWidth ?? base.strokeWidth}>
      <path d="M12 4.5v15M4.5 12h15" />
    </svg>
  )
}

export function TargetIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.5" />
    </svg>
  )
}

export function ChevronDownIcon({ className, style, strokeWidth }: IconProps) {
  return (
    <svg className={className} style={style} {...base} strokeWidth={strokeWidth ?? base.strokeWidth}>
      <path d="M5.5 9l6.5 6.5L18.5 9" />
    </svg>
  )
}
