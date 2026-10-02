import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Card } from '../../../components/ui/Card'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { errorMessage } from '../../../lib/api/apiClient'
import { useImports } from '../../imports/hooks/useImports'

export function SettingsPage() {
  const { user, logout } = useAuth()
  const { processing } = useImports()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  async function signOut() {
    if (loading) return
    setLoading(true)
    setError('')
    try { await logout() } catch (caught) { setError(errorMessage(caught)); setLoading(false) }
  }
  return <div className="page-stack"><div className="page-heading"><div><h1>Configurações</h1><p>Informações da sua conta e acesso ao sistema.</p></div></div>
    <Card className="profile-card"><div className="profile-heading"><Avatar name={user?.name} url={user?.avatarUrl} large /><div><h2>{user?.name}</h2><span className="muted">{user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</span></div></div>
      <dl className="details-list"><div><dt>Nome</dt><dd>{user?.name}</dd></div><div><dt>E-mail</dt><dd>{user?.email}</dd></div><div><dt>Nome de usuário</dt><dd>{user?.username}</dd></div></dl>
      <div className="profile-actions"><div><h3>Sessão atual</h3><p>Encerre seu acesso neste navegador.</p></div><Button variant="secondary" disabled={loading || processing} onClick={() => void signOut()}><Icon name="logout" />{loading ? 'Saindo...' : 'Sair da conta'}</Button></div>
      {processing && <p className="notice">Aguarde a importação terminar para sair da conta.</p>}
      {error && <p className="notice notice-danger" role="alert">{error}</p>}
    </Card>
  </div>
}
