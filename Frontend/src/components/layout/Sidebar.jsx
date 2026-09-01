import { NavLink, useNavigate } from 'react-router-dom'
import BrandLogo from '../common/BrandLogo.jsx'
import useAuth from '../../context/useAuth.js'

const navigationItems = [
  { to: '/', label: 'Inicio', icon: 'home', end: true },
  { to: '/productos', label: 'Productos', icon: 'box' },
  { to: '/ventas', label: 'Nueva venta', icon: 'cart', end: true },
  { to: '/ventas/historial', label: 'Historial de ventas', icon: 'history' },
]

function NavigationIcon({ name }) {
  const paths = {
    home: <path d="m3.5 10.5 8.5-7 8.5 7v9a1 1 0 0 1-1 1h-5v-6h-4v6h-5a1 1 0 0 1-1-1v-9Z" />,
    box: <path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7m-8 4v10" />,
    cart: <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6m4 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />,
    history: <path d="M4 5v5h5M5.2 15a8 8 0 1 0 .5-7.2L4 10m8-4v6l4 2" />,
  }

  return (
    <svg className="navigation-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
      id="primary-navigation"
      aria-label="Navegación principal"
    >
      <div className="sidebar__brand">
        <BrandLogo className="sidebar__logo" />
        <div>
          <strong>RaspberryPros</strong>
          <span>Control de ventas</span>
        </div>
        <button
          className="sidebar__close"
          type="button"
          aria-label="Cerrar navegación"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Secciones del sistema">
        <p className="sidebar__nav-label">Menú principal</p>
        {navigationItems.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
            end={end}
            to={to}
            onClick={onClose}
          >
            <NavigationIcon name={icon} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button
          className="sidebar__logout"
          type="button"
          onClick={handleLogout}
        >
          <svg className="navigation-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5m5-4 4-4-4-4m4 4H9" />
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
