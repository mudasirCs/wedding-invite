import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AdminDashboard } from './components/AdminDashboard'
import { LanguageProvider } from './i18n/LanguageContext'

const isAdmin =
  window.location.pathname === '/admin' || window.location.pathname === '/admin/'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>{isAdmin ? <AdminDashboard /> : <App />}</LanguageProvider>
  </StrictMode>,
)