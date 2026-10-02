export function BrandLogo() {
  return <img className="brand-logo" src="/ljfonts.png" alt="LJ Fontes" width={2172} height={724} />
}

export function MercadoLivreLogo({ symbol = false }: { symbol?: boolean }) {
  return <img className={`marketplace-logo${symbol ? ' marketplace-logo-symbol' : ''}`}
    src={symbol ? '/brands/mercado-livre-symbol.svg' : '/brands/mercado-livre-logo.webp'}
    alt="Mercado Livre" width={symbol ? 64 : 134} height={symbol ? 64 : 34} />
}
