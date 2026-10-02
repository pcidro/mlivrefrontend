import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { errorMessage } from '../../../lib/api/apiClient'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Fields'
import { Icon } from '../../../components/ui/Icon'
import { ErrorState } from '../../../components/ui/States'
import { BrandLogo } from '../../../components/ui/Logos'

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const locked = useRef(false)
  const from: unknown = location.state?.from
  const destination = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && !from.startsWith('/login') ? from : '/dashboard'
  if (auth.user) return <Navigate to={destination} replace />
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (locked.current || auth.loading) return
    locked.current = true
    setLoading(true)
    setError('')
    try {
      await auth.login({ email: email.trim(), password })
      setPassword('')
      navigate(destination, { replace: true })
    } catch (caught) { setError(errorMessage(caught)) }
    finally { locked.current = false; setLoading(false) }
  }
  return <main className="login-page"><section className="login-card">
    <div className="login-brand"><BrandLogo /></div>
    <div className="login-heading"><span className="eyebrow">BEM-VINDO DE VOLTA</span><h1>Entrar na sua conta</h1><p>Acesse seus clientes e acompanhe suas importações.</p></div>
    {auth.error && !error && <div className="login-connection-error"><ErrorState message={auth.error} onRetry={auth.reload} /></div>}
    <form onSubmit={submit} className="form-stack">
      <Input id="email" label="E-mail" type="email" autoComplete="email" placeholder="voce@empresa.com.br" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} />
      <Input id="password" label="Senha" type="password" autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={loading} />
      {error && <p className="notice notice-danger" role="alert">{error}</p>}
      <Button type="submit" disabled={loading || auth.loading}>{loading ? 'Entrando...' : auth.loading ? 'Verificando sessão...' : 'Entrar'}<Icon name="chevron" /></Button>
    </form>
    <p className="login-note"><Icon name="lock" /> Acesso seguro à sua conta</p>
    <nav className="login-legal-links caption" aria-label="Documentos públicos"><Link to="/termos-de-uso">Termos de uso</Link><Link to="/politica-de-privacidade">Política de privacidade</Link></nav>
  </section></main>
}
