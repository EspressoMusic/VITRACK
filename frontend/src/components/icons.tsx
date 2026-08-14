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

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
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

export function TrashIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 7h16M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M6.5 7l.7 12.1a2 2 0 0 0 2 1.9h5.6a2 2 0 0 0 2-1.9L17.5 7" />
    </svg>
  )
}
