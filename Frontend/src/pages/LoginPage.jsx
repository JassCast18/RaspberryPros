import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth.js'
import { AuthServiceError } from '../services/authService.js'

function LoginPage() {
  const navigate = useNavigate()
  const { login, sessionError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      setErrorMessage('Ingresa tu correo electrónico y contraseña.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMessage('Ingresa un correo electrónico válido.')
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await login({ email: normalizedEmail, password })
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof AuthServiceError
          ? error.message
          : 'Ocurrió un error inesperado. Intenta nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayedError = errorMessage || sessionError

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card__brand" aria-hidden="true">
          RP
        </div>
        <p className="login-card__system">RaspberryPros</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <p className="login-card__description">
          Ingresa tus credenciales para acceder al sistema de ventas.
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              autoComplete="email"
              inputMode="email"
              aria-describedby={displayedError ? 'login-error' : undefined}
              disabled={isSubmitting}
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              autoComplete="current-password"
              aria-describedby={displayedError ? 'login-error' : undefined}
              disabled={isSubmitting}
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {displayedError && (
            <p className="login-error" id="login-error" role="alert">
              {displayedError}
            </p>
          )}

          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
