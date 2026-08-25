type IconProps = { className?: string; style?: React.CSSProperties }

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 8a1 1 0 0 1 1-1h2.2l1-1.6A1 1 0 0 1 9.05 5h5.9a1 1 0 0 1 .85.4L16.8 7H19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Z" />
      <circle cx="12" cy="13" r="3.3" />
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

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 122.88 122.88" fill="currentColor">
      <path d="M81.61,4.73c0-2.61,2.58-4.73,5.77-4.73s5.77,2.12,5.77,4.73v20.72c0,2.61-2.58,4.73-5.77,4.73 s-5.77-2.12-5.77-4.73V4.73L81.61,4.73z M29.61,4.73c0-2.61,2.58-4.73,5.77-4.73s5.77,2.12,5.77,4.73v20.72 c0,2.61-2.58,4.73-5.77,4.73s-5.77-2.12-5.77-4.73V4.73L29.61,4.73z M40.99,84.56c-1.27-1.22-1.31-3.24-0.09-4.51 c1.22-1.27,3.24-1.31,4.51-0.09l9.9,9.57l22.02-23.58c1.2-1.29,3.22-1.36,4.51-0.16c1.29,1.2,1.36,3.22,0.16,4.51L57.77,96.26l0,0 l-0.04,0.04c-1.22,1.27-3.24,1.31-4.51,0.09L40.99,84.56L40.99,84.56z M6.4,45.32h110.08V21.47c0-0.8-0.33-1.53-0.86-2.07 c-0.53-0.53-1.26-0.86-2.07-0.86H103c-1.77,0-3.2-1.43-3.2-3.2c0-1.77,1.43-3.2,3.2-3.2h10.55c2.57,0,4.9,1.05,6.59,2.74 c1.69,1.69,2.74,4.02,2.74,6.59v27.06v65.03c0,2.57-1.05,4.9-2.74,6.59c-1.69,1.69-4.02,2.74-6.59,2.74H9.33 c-2.57,0-4.9-1.05-6.59-2.74C1.05,118.45,0,116.12,0,113.55V48.53V21.47c0-2.57,1.05-4.9,2.74-6.59c1.69-1.69,4.02-2.74,6.59-2.74 H20.6c1.77,0,3.2,1.43,3.2,3.2c0,1.77-1.43,3.2-3.2,3.2H9.33c-0.8,0-1.53,0.33-2.07,0.86c-0.53,0.53-0.86,1.26-0.86,2.07V45.32 L6.4,45.32z M116.48,51.73H6.4v61.82c0,0.8,0.33,1.53,0.86,2.07c0.53,0.53,1.26,0.86,2.07,0.86h104.22c0.8,0,1.53-0.33,2.07-0.86 c0.53-0.53,0.86-1.26,0.86-2.07V51.73L116.48,51.73z M50.43,18.54c-1.77,0-3.2-1.43-3.2-3.2c0-1.77,1.43-3.2,3.2-3.2h21.49 c1.77,0,3.2,1.43,3.2,3.2c0,1.77-1.43,3.2-3.2,3.2H50.43L50.43,18.54z" />
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

export function GearIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 122.88 122.878" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M101.589,14.7l8.818,8.819c2.321,2.321,2.321,6.118,0,8.439l-7.101,7.101 c1.959,3.658,3.454,7.601,4.405,11.752h9.199c3.283,0,5.969,2.686,5.969,5.968V69.25c0,3.283-2.686,5.969-5.969,5.969h-10.039 c-1.231,4.063-2.992,7.896-5.204,11.418l6.512,6.51c2.321,2.323,2.321,6.12,0,8.44l-8.818,8.819c-2.321,2.32-6.119,2.32-8.439,0 l-7.102-7.102c-3.657,1.96-7.601,3.456-11.753,4.406v9.199c0,3.282-2.685,5.968-5.968,5.968H53.629 c-3.283,0-5.969-2.686-5.969-5.968v-10.039c-4.063-1.232-7.896-2.993-11.417-5.205l-6.511,6.512c-2.323,2.321-6.12,2.321-8.441,0 l-8.818-8.818c-2.321-2.321-2.321-6.118,0-8.439l7.102-7.102c-1.96-3.657-3.456-7.6-4.405-11.751H5.968 C2.686,72.067,0,69.382,0,66.099V53.628c0-3.283,2.686-5.968,5.968-5.968h10.039c1.232-4.063,2.993-7.896,5.204-11.418l-6.511-6.51 c-2.321-2.322-2.321-6.12,0-8.44l8.819-8.819c2.321-2.321,6.118-2.321,8.439,0l7.101,7.101c3.658-1.96,7.601-3.456,11.753-4.406 V5.969C50.812,2.686,53.498,0,56.78,0h12.471c3.282,0,5.968,2.686,5.968,5.969v10.036c4.064,1.231,7.898,2.992,11.422,5.204 l6.507-6.509C95.471,12.379,99.268,12.379,101.589,14.7L101.589,14.7z M61.44,36.92c13.54,0,24.519,10.98,24.519,24.519 c0,13.538-10.979,24.519-24.519,24.519c-13.539,0-24.519-10.98-24.519-24.519C36.921,47.9,47.901,36.92,61.44,36.92L61.44,36.92z"
      />
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
