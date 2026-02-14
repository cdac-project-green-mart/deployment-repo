// vite.config.js
// All /api traffic goes through API Gateway (deployment-repo)
// deployment-repo gateway: http://68.183.86.246:8080 (prod)
// Override with VITE_API_GATEWAY_URL in .env
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // loadEnv reads .env files so VITE_API_GATEWAY_URL is available
  const env = loadEnv(mode, process.cwd(), '')
  const gatewayUrl = env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: gatewayUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
