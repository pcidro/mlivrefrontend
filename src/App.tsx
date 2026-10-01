import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_URL = (
  import.meta.env.VITE_API_URL ??
  'https://sistemamlivre.onrender.com/api'
).replace(/\/$/, '')

type Screen = 'login' | 'marketplace'
type ConnectionStatus = 'success' | 'error' | null

interface MarketplaceAccount {
  id: string
  platform: 'MERCADO_LIVRE' | 'MAGALU'
  name: string
  externalAccountId: string
  isActive: boolean
}

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
  const [accounts, setAccounts] = useState<MarketplaceAccount[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [disconnectingAccountId, setDisconnectingAccountId] = useState('')
  const [disconnectSuccess, setDisconnectSuccess] = useState(false)

  useEffect(() => {
    if (connectionStatus) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [connectionStatus])

  useEffect(() => {
    if (screen !== 'marketplace') return

    const abortController = new AbortController()

    async function loadAccounts() {
      setIsLoadingAccounts(true)
      setAccountError('')

      try {
        const response = await fetch(`${API_URL}/marketplace-accounts`, {
          credentials: 'include',
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(await readErrorMessage(response))
        }

        const body = (await response.json()) as {
          data: MarketplaceAccount[]
        }
        setAccounts(body.data.filter((account) => account.isActive))
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === 'AbortError') {
          return
        }

        setAccountError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Não foi possível consultar as contas conectadas.',
        )
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingAccounts(false)
        }
      }
    }

    void loadAccounts()

    return () => abortController.abort()
  }, [screen])

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

  async function disconnectMercadoLivre(account: MarketplaceAccount) {
    const confirmed = window.confirm(
      `Deseja desconectar a conta "${account.name}" do Mercado Livre?`,
    )

    if (!confirmed) return

    setAccountError('')
    setDisconnectSuccess(false)
    setDisconnectingAccountId(account.id)

    try {
      const response = await fetch(
        `${API_URL}/marketplace-accounts/mercadolivre/${account.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      setAccounts((currentAccounts) =>
        currentAccounts.filter((currentAccount) => currentAccount.id !== account.id),
      )
      setDisconnectSuccess(true)
    } catch (caughtError) {
      setAccountError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível desconectar a conta.',
      )
    } finally {
      setDisconnectingAccountId('')
    }
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

            {disconnectSuccess && (
              <div className="message message-success" role="status">
                Conta desconectada. Antes de conectar outra conta, saia da sua
                sessão no site do Mercado Livre.
              </div>
            )}

            {accountError && (
              <div className="message message-error" role="alert">
                {accountError}
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

              {isLoadingAccounts ? (
                <p className="accounts-status">Consultando contas...</p>
              ) : (
                accounts
                  .filter((account) => account.platform === 'MERCADO_LIVRE')
                  .map((account) => (
                    <div className="connected-account" key={account.id}>
                      <div>
                        <strong>{account.name}</strong>
                        <span>Conta #{account.externalAccountId}</span>
                      </div>
                      <button
                        className="disconnect-button"
                        type="button"
                        disabled={disconnectingAccountId === account.id}
                        onClick={() => void disconnectMercadoLivre(account)}
                      >
                        {disconnectingAccountId === account.id
                          ? 'Desconectando...'
                          : 'Desconectar'}
                      </button>
                    </div>
                  ))
              )}

              <button
                className="marketplace-button"
                type="button"
                onClick={connectMercadoLivre}
              >
                {accounts.some(
                  (account) => account.platform === 'MERCADO_LIVRE',
                )
                  ? 'Conectar outra conta'
                  : 'Conectar ao Mercado Livre'}
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
