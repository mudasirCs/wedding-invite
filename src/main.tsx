import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AdminDashboard } from './components/AdminDashboard'

const isAdmin =
  window.location.pathname === '/admin' || window.location.pathname === '/admin/'

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isAdmin ? <AdminDashboard /> : <App />}</StrictMode>,
)
