import { useCallback, useEffect, useMemo, useState } from 'react'
import { getUserById, login as requestLogin } from '../services/authService.js'
import AuthContext from './auth-context.js'

const STORAGE_KEY = 'raspberrypros.auth'

function readStoredSession() {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (!storedValue) return null

    const session = JSON.parse(storedValue)
    const hasValidShape =
      typeof session?.token === 'string' &&
      session.user &&
      (typeof session.user.id === 'number' || typeof session.user.id === 'string')

    if (!hasValidShape) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return session
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function storeSession(session) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function removeStoredSession() {
  window.localStorage.removeItem(STORAGE_KEY)
}

function AuthProvider({ children }) {
  const [storedSession] = useState(readStoredSession)
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(storedSession))
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    if (!storedSession) return undefined

    let isCurrent = true

    getUserById(storedSession.user.id, storedSession.token)
      .then((user) => {
        if (!isCurrent) return

        const validatedSession = { token: storedSession.token, user }
        storeSession(validatedSession)
        setSession(validatedSession)
      })
      .catch((error) => {
        if (!isCurrent) return

        if (error.status === 401 || error.status === 403) {
          removeStoredSession()
          setSessionError('Tu sesión expiró. Inicia sesión nuevamente.')
          return
        }

        setSessionError('No fue posible validar la sesión guardada. Intenta nuevamente.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [storedSession])

  const login = useCallback(async (credentials) => {
    setSessionError('')
    const result = await requestLogin(credentials)
    const nextSession = { token: result.token, user: result.user }
    storeSession(nextSession)
    setSession(nextSession)
    return result.user
  }, [])

  const logout = useCallback(() => {
    removeStoredSession()
    setSession(null)
    setSessionError('')
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token && session?.user),
      isLoading,
      sessionError,
      login,
      logout,
    }),
    [isLoading, login, logout, session, sessionError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
