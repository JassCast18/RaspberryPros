import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import SalesHistoryPage from './pages/SalesHistoryPage.jsx'
import SalesPage from './pages/SalesPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/ventas" element={<SalesPage />} />
        <Route path="/ventas/historial" element={<SalesHistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
