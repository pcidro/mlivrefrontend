import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { AppLayout } from '../../components/layout/AppLayout'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { SettingsPage } from '../../features/auth/pages/SettingsPage'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { CustomersPage } from '../../features/customers/pages/CustomersPage'
import { ImportsPage } from '../../features/imports/pages/ImportsPage'
import { MarketplaceAccountsPage } from '../../features/marketplace-accounts/pages/MarketplaceAccountsPage'
import { TermsOfUsePage } from '../../features/legal/pages/TermsOfUsePage'
import { PrivacyPolicyPage } from '../../features/legal/pages/PrivacyPolicyPage'
function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()
  return user ? <AppLayout /> : <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
}
function HomeRedirect() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const status = params.get('mercadolivre')
  if (status !== 'success' && status !== 'error') return <Navigate to="/dashboard" replace />
  const result = new URLSearchParams({ mercadolivre: status })
  const reason = params.get('mercadolivre_error')
  if (status === 'error' && reason) result.set('mercadolivre_error', reason)
  return <Navigate to={`/marketplace-accounts?${result}`} replace />
}
export function AppRouter() {
  // Os campos controlados pelos filtros da URL precisam atualizar junto com a digitação.
  return <BrowserRouter useTransitions={false}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/termos-de-uso" element={<TermsOfUsePage />} />
    <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/imports" element={<ImportsPage />} />
      <Route path="/marketplace-accounts" element={<MarketplaceAccountsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  </Routes></BrowserRouter>
}
