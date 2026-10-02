import type { ImportStatus } from '../../../types/api'
import { Badge } from '../../../components/ui/Badge'

const statuses = {
  PROCESSING: { tone: 'primary', label: 'Em processamento' },
  SUCCESS: { tone: 'success', label: 'Concluída com sucesso' },
  PARTIAL_SUCCESS: { tone: 'warning', label: 'Concluída com erros' },
  ERROR: { tone: 'danger', label: 'Não concluída' },
} as const
export function ImportStatusBadge({ status }: { status: ImportStatus }) {
  const { tone, label } = statuses[status]
  return <Badge tone={tone}>{label}</Badge>
}
