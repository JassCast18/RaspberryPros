import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../context/useAuth.js'

function AuthRoute({ publicOnly = false }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="auth-loading-screen" aria-live="polite" aria-busy="true">
        <span className="auth-loading-screen__spinner" aria-hidden="true" />
        <p>Verificando sesión…</p>
      </main>
    )
  }

  if (publicOnly && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!publicOnly && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default AuthRoute
