import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const authApiPath = env.VITE_AUTH_API_PROXY_PATH || '/usuarios-api'
  const authApiTarget = env.VITE_AUTH_API_URL || 'http://localhost:3001'
  const salesApiPath = env.VITE_SALES_API_PROXY_PATH || '/ventas-api'
  const salesApiTarget = env.VITE_SALES_API_URL || 'http://localhost:3003'
  const authProxy = {
    target: authApiTarget,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${authApiPath}`), ''),
  }
  const salesProxy = {
    target: salesApiTarget,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${salesApiPath}`), ''),
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        [authApiPath]: authProxy,
        [salesApiPath]: salesProxy,
      },
    },
    preview: {
      proxy: {
        [authApiPath]: authProxy,
        [salesApiPath]: salesProxy,
      },
    },
  }
})
