import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const authApiPath = env.VITE_AUTH_API_PROXY_PATH || '/usuarios-api'
  const authApiTarget = env.VITE_AUTH_API_URL || 'http://localhost:3001'
  const authProxy = {
    target: authApiTarget,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${authApiPath}`), ''),
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        [authApiPath]: authProxy,
      },
    },
    preview: {
      proxy: {
        [authApiPath]: authProxy,
      },
    },
  }
})
