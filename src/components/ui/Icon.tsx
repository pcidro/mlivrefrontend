import type { SVGProps } from 'react'

const paths = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  store: 'M3 10v10h18V10 M2 10l2-7h16l2 7 M2 10a3 3 0 0 0 5 2 3 3 0 0 0 5 0 3 3 0 0 0 5 0 3 3 0 0 0 5-2 M9 20v-6h6v6',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M10 2h4l1 3 3 1 3 2v4l-3 2-1 3-2 4h-4l-2-4-3-1-3-2v-4l3-2 1-3z',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.09 9.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92z',
  phoneOff: 'M3 3l18 18 M8 3H4a2 2 0 0 0-2 2c1 10 7 16 17 17a2 2 0 0 0 2-2v-3 M5 9l3-2 M15 17l2-3',
  clock: 'M12 8v4l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  chevron: 'M9 5l7 7-7 7',
  close: 'M6 6l12 12 M6 18L18 6',
  plus: 'M12 5v14 M5 12h14',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  logout: 'M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4 M16 17l5-5-5-5 M21 12H9',
  check: 'M20 6L9 17l-5-5',
  alert: 'M12 9v4 M12 17h.01 M10.3 3.8 1.8 18.5a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0',
  lock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
  calendar: 'M3 5h18v16H3z M16 3v4 M8 3v4 M3 11h18',
  chat: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5 M8 9c1 4 3 6 7 7 M8 9l2-1 M15 16l1-2',
} as const
export type IconName = keyof typeof paths
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]} /></svg>
}
