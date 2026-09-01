import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

function MainLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)

  useEffect(() => {
    if (!isNavigationOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsNavigationOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isNavigationOpen])

  const closeNavigation = () => setIsNavigationOpen(false)

  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>

      <div className="app-shell">
        <Sidebar isOpen={isNavigationOpen} onClose={closeNavigation} />

        {isNavigationOpen && (
          <button
            className="sidebar-backdrop"
            type="button"
            aria-label="Cerrar menú de navegación"
            onClick={closeNavigation}
          />
        )}

        <div className="app-column">
          <Header
            isNavigationOpen={isNavigationOpen}
            onMenuToggle={() => setIsNavigationOpen((isOpen) => !isOpen)}
          />
          <main className="app-main" id="main-content" tabIndex="-1">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}

export default MainLayout
