import { initials } from '../../lib/utils/format'
export function Avatar({ name, url, large = false }: { name?: string | null; url?: string | null; large?: boolean }) {
  return <span className={`avatar${large ? ' avatar-large' : ''}`} aria-hidden="true">
    {url && /^https?:\/\//.test(url) ? <img src={url} alt="" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : null}
    <span>{initials(name)}</span>
  </span>
}
