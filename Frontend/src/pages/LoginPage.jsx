import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '../components/common/BrandLogo.jsx'
import useAuth from '../context/useAuth.js'
import {
  AuthServiceError,
  register as requestRegistration,
} from '../services/authService.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getEmailError(email) {
  if (!email) return 'Ingresa tu correo electrónico.'
  if (email.length > 255) return 'El correo no puede superar 255 caracteres.'
  if (!EMAIL_PATTERN.test(email)) return 'Ingresa un correo electrónico válido.'
  return ''
}

function validateLogin({ email, password }) {
  const errors = {}
  const emailError = getEmailError(email)

  if (emailError) errors.email = emailError
  if (!password) errors.password = 'Ingresa tu contraseña.'

  return errors
}

function validateRegistration({ name, email, password, confirmPassword }) {
  const errors = {}
  const emailError = getEmailError(email)

  if (!name) errors.name = 'Ingresa tu nombre.'
  else if (name.length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres.'
  else if (name.length > 120) errors.name = 'El nombre no puede superar 120 caracteres.'

  if (emailError) errors.email = emailError

  if (!password) errors.password = 'Ingresa una contraseña.'
  else if (password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.'
  } else if (new TextEncoder().encode(password).length > 72) {
    errors.password = 'La contraseña es demasiado larga.'
  }

  if (!confirmPassword) errors.confirmPassword = 'Confirma tu contraseña.'
  else if (confirmPassword !== password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  return errors
}

function getDescribedBy(fieldErrorId, hasFieldError, hasFormError) {
  const ids = []
  if (hasFieldError) ids.push(fieldErrorId)
  if (hasFormError) ids.push('auth-form-error')
  return ids.length > 0 ? ids.join(' ') : undefined
}

function LoginPage() {
  const navigate = useNavigate()
  const { login, sessionError } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const titleRef = useRef(null)
  const previousModeRef = useRef(mode)

  const isRegistration = mode === 'register'
  const displayedError = errorMessage || (!isRegistration ? sessionError : '')

  useEffect(() => {
    if (previousModeRef.current === mode) return

    previousModeRef.current = mode
    titleRef.current?.focus()
  }, [mode])

  const clearFieldError = (field) => {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors

      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
    setErrorMessage('')
  }

  const handleModeChange = (nextMode) => {
    if (isSubmitting || nextMode === mode) return

    setMode(nextMode)
    setName('')
    setPassword('')
    setConfirmPassword('')
    setFieldErrors({})
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()
    const errors = isRegistration
      ? validateRegistration({
          name: normalizedName,
          email: normalizedEmail,
          password,
          confirmPassword,
        })
      : validateLogin({ email: normalizedEmail, password })

    setFieldErrors(errors)
    setErrorMessage('')
    setSuccessMessage('')

    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)

    try {
      if (isRegistration) {
        await requestRegistration({
          name: normalizedName,
          email: normalizedEmail,
          password,
        })

        setMode('login')
        setName('')
        setEmail(normalizedEmail)
        setPassword('')
        setConfirmPassword('')
        setSuccessMessage('Cuenta creada correctamente. Ya puedes iniciar sesión.')
        return
      }

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

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="auth-title">
        <BrandLogo className="login-card__brand" />
        <p className="login-card__system">RaspberryPros</p>
        <h1 ref={titleRef} id="auth-title" tabIndex="-1">
          {isRegistration ? 'Crear cuenta' : 'Iniciar sesión'}
        </h1>
        <p className="login-card__description">
          {isRegistration
            ? 'Completa tus datos para crear una cuenta de usuario.'
            : 'Ingresa tus credenciales para acceder al sistema de ventas.'}
        </p>

        {successMessage && (
          <p className="login-success" role="status">
            {successMessage}
          </p>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {isRegistration && (
            <div className="form-field">
              <label htmlFor="auth-name">Nombre</label>
              <input
                id="auth-name"
                name="name"
                type="text"
                value={name}
                maxLength="120"
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={getDescribedBy(
                  'auth-name-error',
                  Boolean(fieldErrors.name),
                  Boolean(displayedError),
                )}
                disabled={isSubmitting}
                required
                onChange={(event) => {
                  setName(event.target.value)
                  clearFieldError('name')
                }}
              />
              {fieldErrors.name && (
                <p className="form-field__error" id="auth-name-error">
                  {fieldErrors.name}
                </p>
              )}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="auth-email">Correo electrónico</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              value={email}
              maxLength="255"
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={getDescribedBy(
                'auth-email-error',
                Boolean(fieldErrors.email),
                Boolean(displayedError),
              )}
              disabled={isSubmitting}
              required
              onChange={(event) => {
                setEmail(event.target.value)
                clearFieldError('email')
              }}
            />
            {fieldErrors.email && (
              <p className="form-field__error" id="auth-email-error">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="auth-password">Contraseña</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              value={password}
              minLength={isRegistration ? 8 : undefined}
              autoComplete={isRegistration ? 'new-password' : 'current-password'}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={getDescribedBy(
                'auth-password-error',
                Boolean(fieldErrors.password),
                Boolean(displayedError),
              )}
              disabled={isSubmitting}
              required
              onChange={(event) => {
                setPassword(event.target.value)
                clearFieldError('password')
              }}
            />
            {fieldErrors.password && (
              <p className="form-field__error" id="auth-password-error">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {isRegistration && (
            <div className="form-field">
              <label htmlFor="auth-confirm-password">Confirmar contraseña</label>
              <input
                id="auth-confirm-password"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                minLength="8"
                autoComplete="new-password"
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={getDescribedBy(
                  'auth-confirm-password-error',
                  Boolean(fieldErrors.confirmPassword),
                  Boolean(displayedError),
                )}
                disabled={isSubmitting}
                required
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  clearFieldError('confirmPassword')
                }}
              />
              {fieldErrors.confirmPassword && (
                <p className="form-field__error" id="auth-confirm-password-error">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {displayedError && (
            <p className="login-error" id="auth-form-error" role="alert">
              {displayedError}
            </p>
          )}

          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isRegistration
                ? 'Creando cuenta…'
                : 'Iniciando sesión…'
              : isRegistration
                ? 'Crear cuenta'
                : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth-alternate">
          {isRegistration ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}{' '}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleModeChange(isRegistration ? 'login' : 'register')}
          >
            {isRegistration ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
