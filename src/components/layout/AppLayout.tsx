import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Drawer } from '../ui/Drawer'
import { ImportsProvider } from '../../app/providers/ImportsProvider'
import { BrandLogo } from '../ui/Logos'

export function AppLayout() {
  const [menu, setMenu] = useState(false)
  const location = useLocation()
  return <ImportsProvider><div className="app-layout">
    <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
    <aside className="desktop-sidebar"><Sidebar /></aside>
    {menu && <Drawer title="Navegação" side="left" onClose={() => setMenu(false)}><Sidebar onNavigate={() => setMenu(false)} /></Drawer>}
    <div className="app-main"><Header onMenu={() => setMenu(true)} />
      <main id="main-content" className="page-content" key={location.pathname} tabIndex={-1}><Outlet /></main>
      <footer className="app-footer"><BrandLogo /></footer>
    </div>
  </div></ImportsProvider>
}
