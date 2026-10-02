import type { ReactNode } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import type { IconName } from './Icon'

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return <div className="skeleton-stack" role="status" aria-label="Carregando dados">
    {Array.from({ length: rows }, (_, index) => <div className="skeleton" key={index} />)}
  </div>
}
export function EmptyState({ title, description, action, icon = 'users' }: { title: string; description?: string; action?: ReactNode; icon?: IconName }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name={icon} /></span>
    <h3>{title}</h3>{description && <p>{description}</p>}{action}</div>
}
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="error-state" role="alert"><Icon name="alert" /><p>{message}</p>
    {onRetry && <Button variant="secondary" onClick={onRetry}>Tentar novamente</Button>}</div>
}
