import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { BrandLogo } from '../ui/Logos'

export function Header({ onMenu }: { onMenu(): void }) {
  const { user } = useAuth()
  return <header className="app-header">
    <div className="header-title"><Button className="menu-toggle" variant="ghost" aria-label="Abrir menu" onClick={onMenu}><Icon name="menu" /></Button>
      <BrandLogo /></div>
    <Link to="/settings" className="user-menu" aria-label="Ver minha conta e configurações">
      <Avatar name={user?.name} url={user?.avatarUrl} /><div><strong>{user?.name}</strong><span>{user?.role === 'ADMIN' ? 'Administrador' : 'Minha conta'}</span></div><Icon name="chevron" />
    </Link>
  </header>
}
