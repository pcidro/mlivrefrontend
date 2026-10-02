import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import type { IconName } from '../ui/Icon'
import { BrandLogo, MercadoLivreLogo } from '../ui/Logos'

const links: { to: string; label: string; icon: IconName }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/customers', label: 'Clientes', icon: 'users' },
  { to: '/imports', label: 'Importações', icon: 'download' },
  { to: '/marketplace-accounts', label: 'Contas Integradas', icon: 'store' },
  { to: '/settings', label: 'Configurações', icon: 'settings' },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return <div className="sidebar-content">
    <div className="sidebar-brand"><BrandLogo /></div>
    <p className="nav-label">PRINCIPAL</p>
    <nav aria-label="Menu principal">{links.map((link) => <NavLink key={link.to} to={link.to}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onNavigate}>
      <Icon name={link.icon} /><span>{link.label}</span>
    </NavLink>)}</nav>
    <div className="sidebar-footer"><MercadoLivreLogo /></div>
  </div>
}
