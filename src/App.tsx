import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_URL = (
  import.meta.env.VITE_API_URL ??
  'https://sistemamlivre.onrender.com/api'
).replace(/\/$/, '')

type Screen = 'login' | 'marketplace'
type ConnectionStatus = 'success' | 'error' | null

function getInitialConnectionStatus(): ConnectionStatus {
  const status = new URLSearchParams(window.location.search).get(
    'mercadolivre',
  )

  return status === 'success' || status === 'error' ? status : null
}

async function readErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    error?: string
  } | null

  return body?.error ?? 'Não foi possível concluir o login. Tente novamente.'
}

function App() {
  const [connectionStatus] = useState<ConnectionStatus>(
    getInitialConnectionStatus,
  )
  const [screen, setScreen] = useState<Screen>(() =>
    connectionStatus ? 'marketplace' : 'login',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (connectionStatus) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [connectionStatus])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      const user = (await response.json()) as { name?: string }
      setUserName(user.name ?? '')
      setScreen('marketplace')
      setPassword('')
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível acessar o servidor.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function connectMercadoLivre() {
    window.location.assign(
      `${API_URL}/marketplace-accounts/mercadolivre/connect`,
    )
  }

  return (
    <main className="page">
      <section className="card" aria-labelledby="page-title">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ML
          </span>
          <div>
            <strong>Central de clientes</strong>
            <span>Integrações de marketplace</span>
          </div>
        </div>

        {screen === 'login' ? (
          <>
            <header className="card-header">
              <p className="eyebrow">Acesso ao sistema</p>
              <h1 id="page-title">Entrar</h1>
              <p>Use o e-mail e a senha cadastrados no sistema.</p>
            </header>

            <form className="login-form" onSubmit={handleLogin}>
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@empresa.com.br"
                required
              />

              <label htmlFor="password">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                required
              />

              {error && (
                <div className="message message-error" role="alert">
                  {error}
                </div>
              )}

              <button
                className="primary-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Fazer login'}
              </button>
            </form>
          </>
        ) : (
          <>
            <header className="card-header">
              <p className="eyebrow">Integrações</p>
              <h1 id="page-title">
                {userName ? `Olá, ${userName}` : 'Conectar conta'}
              </h1>
              <p>
                Autorize o sistema a acessar os dados necessários da sua conta
                do Mercado Livre.
              </p>
            </header>

            {connectionStatus === 'success' && (
              <div className="message message-success" role="status">
                Conta do Mercado Livre conectada com sucesso.
              </div>
            )}

            {connectionStatus === 'error' && (
              <div className="message message-error" role="alert">
                Não foi possível conectar a conta do Mercado Livre. Tente
                novamente.
              </div>
            )}

            <div className="marketplace-box">
              <div className="marketplace-title">
                <span className="mercado-livre-icon" aria-hidden="true">
                  ML
                </span>
                <div>
                  <strong>Mercado Livre</strong>
                  <span>Conecte a conta que será usada no sistema</span>
                </div>
              </div>

              <button
                className="marketplace-button"
                type="button"
                onClick={connectMercadoLivre}
              >
                Conectar ao Mercado Livre
              </button>
            </div>

            <p className="security-note">
              A senha e os tokens do Mercado Livre não são exibidos nem
              armazenados neste navegador.
            </p>
          </>
        )}
      </section>
    </main>
  )
}

export default App
