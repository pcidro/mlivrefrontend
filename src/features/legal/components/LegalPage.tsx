import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../../../components/ui/Logos'
import '../legal.css'

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} | LJ Fontes`
    return () => { document.title = previous }
  }, [title])

  return <main className="legal-page">
    <article className="legal-document">
      <header className="legal-header">
        <BrandLogo />
        <p className="eyebrow">CENTRAL DE CLIENTES</p>
        <h1>{title}</h1>
        <p className="muted">Última atualização: 2 de outubro de 2026</p>
      </header>
      <div className="legal-content">{children}</div>
      <nav className="legal-footer" aria-label="Informações e acesso">
        <Link to="/termos-de-uso">Termos de uso</Link>
        <Link to="/politica-de-privacidade">Política de privacidade</Link>
        <Link to="/login">Acessar o sistema</Link>
      </nav>
    </article>
  </main>
}
