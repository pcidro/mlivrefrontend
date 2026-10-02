import type { ReactNode } from 'react'
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'primary' }) {
  return <span className={`badge badge-${tone}`}><span className="status-dot" />{children}</span>
}
