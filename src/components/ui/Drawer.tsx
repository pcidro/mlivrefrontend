import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'

export function Drawer({ title, children, onClose, side = 'right' }: { title: string; children: ReactNode; onClose(): void; side?: 'left' | 'right' }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])
  return <dialog ref={ref} className={`drawer drawer-${side}`} aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); onClose() }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="drawer-inner">
      <header className="drawer-header"><h2 id={titleId}>{title}</h2><Button variant="ghost" aria-label="Fechar painel" onClick={onClose}><Icon name="close" /></Button></header>
      {children}
    </div>
  </dialog>
}
