function Header({ isNavigationOpen, onMenuToggle }) {
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
        aria-label="Usuario de demostración, rol Administrador"
      >
        <span className="user-summary__avatar" aria-hidden="true">
          UD
        </span>
        <span className="user-summary__details">
          <strong>Usuario demo</strong>
          <small>Administrador</small>
        </span>
      </div>
    </header>
  )
}

export default Header
