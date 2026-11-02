// Shared brand + icon components.
import {
  MapPin, Tag, Eye, House, CircleCheck, ShieldCheck, Phone, Mail, Building2, KeyRound, BadgeCheck, Map as MapIcon,
  Clock, Landmark, Gift, Users, FileText, ArrowRight, Download, Navigation,
} from 'lucide-react'

// Official logo image. `size` is the height in px; `dark` puts it on a white tile for dark backgrounds.
export function Logo({ dark = false, size = 44 }) {
  return (
    <span className={dark ? 'brand brand-tile' : 'brand'}>
      <img src="/images/logo.png" alt="Pandit Estate – Property Dealers & Consultants" height={size} style={{ height: size, width: 'auto' }} />
    </span>
  )
}

// Lucide: the open-source icon set used by many production sites.
const ICONS = {
  pin: MapPin, tag: Tag, eye: Eye, home: House, check: CircleCheck, shield: ShieldCheck, phone: Phone, mail: Mail,
  building: Building2, key: KeyRound, badge: BadgeCheck, plot: MapIcon, clock: Clock, bank: Landmark, gift: Gift,
  users: Users, file: FileText, arrow: ArrowRight, download: Download, directions: Navigation,
}

export const Ic = ({ n, size = 22, stroke = 1.9 }) => {
  const C = ICONS[n] || CircleCheck
  return <C size={size} strokeWidth={stroke} aria-hidden />
}

const filled = {
  facebook: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />,
  linkedin: <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />,
  whatsapp: <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41z" />,
}

export function Social({ name, size = 20, mono = false }) {
  if (name === 'instagram') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <defs>
          <linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#feda75" /><stop offset=".3" stopColor="#fa7e1e" /><stop offset=".55" stopColor="#d62976" /><stop offset=".8" stopColor="#962fbf" /><stop offset="1" stopColor="#4f5bd5" />
          </linearGradient>
        </defs>
        <g stroke="url(#ig-grad)"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></g>
        <circle cx="17.4" cy="6.6" r="1.1" fill="#d62976" />
      </svg>
    )
  }
  if (name === 'youtube') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <path fill="#ff0000" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8z" />
        <path fill="#fff" d="M9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
      </svg>
    )
  }
  const color = mono ? 'currentColor' : { facebook: '#1877f2', linkedin: '#0a66c2', whatsapp: '#25d366' }[name]
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color || 'currentColor'} aria-hidden>{filled[name]}</svg>
}
