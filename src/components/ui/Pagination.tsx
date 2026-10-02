import type { PaginationData } from '../../types/api'
import { formatNumber } from '../../lib/utils/format'
import { Button } from './Button'
import { Icon } from './Icon'

export function Pagination({ pagination, onPage }: { pagination: PaginationData; onPage(page: number): void }) {
  const { page, limit, total, totalPages } = pagination
  const pages = Array.from(new Set([1, page - 1, page, page + 1, totalPages])).filter((value) => value > 0 && value <= totalPages).sort((a, b) => a - b)
  return <nav className="pagination" aria-label="Paginação de clientes">
    <span>Mostrando {formatNumber(total ? Math.min((page - 1) * limit + 1, total) : 0)} a {formatNumber(Math.min(page * limit, total))} de {formatNumber(total)} clientes</span>
    <div className="pagination-buttons">
      <Button variant="ghost" aria-label="Página anterior" disabled={page <= 1} onClick={() => onPage(page - 1)}><Icon name="chevron" className="rotate" /></Button>
      {pages.map((value, index) => <span className="pagination-item" key={value}>
        {index > 0 && value - pages[index - 1] > 1 && <span className="muted">…</span>}
        <Button variant={value === page ? 'primary' : 'ghost'} aria-label={`Página ${value}`} aria-current={value === page ? 'page' : undefined} onClick={() => onPage(value)}>{value}</Button>
      </span>)}
      <Button variant="ghost" aria-label="Próxima página" disabled={page >= totalPages} onClick={() => onPage(page + 1)}><Icon name="chevron" /></Button>
    </div>
  </nav>
}
