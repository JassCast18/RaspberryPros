import useAuth from '../../context/useAuth.js'

function getInitials(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function Header({ isNavigationOpen, onMenuToggle }) {
  const { user } = useAuth()
  const displayName = user?.name || user?.email || ''
  const roleLabel = Array.isArray(user?.roles) ? user.roles.join(', ') : ''
  const secondaryText = roleLabel || user?.email || ''

  return (
    <header className="app-header">
      <div className="app-header__identity">
        <button
          className="menu-button"
          type="button"
          aria-label={isNavigationOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-controls="primary-navigation"
          aria-expanded={isNavigationOpen}
          onClick={onMenuToggle}
        >
          {isNavigationOpen ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>

        <div>
          <p className="app-header__label">Sistema de ventas</p>
          <p className="app-header__name">RaspberryPros</p>
        </div>
      </div>

      <div
        className="user-summary"
        aria-label={`${displayName}${secondaryText ? `, ${secondaryText}` : ''}`}
      >
        <span className="user-summary__avatar" aria-hidden="true">
          {getInitials(displayName)}
        </span>
        <span className="user-summary__details">
          <strong>{displayName}</strong>
          {secondaryText && <small>{secondaryText}</small>}
        </span>
      </div>
    </header>
  )
}

export default Header
