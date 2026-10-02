import { whatsappUrl } from '../../../lib/utils/format'
import { Icon } from '../../../components/ui/Icon'

export function WhatsAppButton({ phone, full = false }: { phone: string | null; full?: boolean }) {
  const url = whatsappUrl(phone)
  return url ? <a className={`button button-whatsapp${full ? ' button-full' : ' button-small'}`} href={url} target="_blank" rel="noopener noreferrer"><Icon name="chat" />{full ? 'Abrir no WhatsApp' : 'WhatsApp'}</a>
    : full ? <button className="button button-full" disabled>Sem telefone</button> : <span className="muted caption">Sem telefone</span>
}
