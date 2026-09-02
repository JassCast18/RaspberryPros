import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

function MainLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const mainContentRef = useRef(null)
  const menuButtonRef = useRef(null)

  const closeNavigation = useCallback(() => {
    setIsNavigationOpen(false)
    window.requestAnimationFrame(() => menuButtonRef.current?.focus())
  }, [])

  const closeNavigationAfterSelection = useCallback(() => {
    setIsNavigationOpen(false)
    window.requestAnimationFrame(() => mainContentRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!isNavigationOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeNavigation()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeNavigation, isNavigationOpen])

  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>

      <div className="app-shell">
        <Sidebar
          isOpen={isNavigationOpen}
          onClose={closeNavigation}
          onNavigate={closeNavigationAfterSelection}
        />

        {isNavigationOpen && (
          <button
            className="sidebar-backdrop"
            type="button"
            aria-label="Cerrar menú de navegación"
            onClick={() => closeNavigation()}
          />
        )}

        <div className="app-column">
          <Header
            isNavigationOpen={isNavigationOpen}
            menuButtonRef={menuButtonRef}
            onMenuToggle={() => setIsNavigationOpen((isOpen) => !isOpen)}
          />
          <main ref={mainContentRef} className="app-main" id="main-content" tabIndex="-1">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}

export default MainLayout
