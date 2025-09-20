import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5000,
      strictPort: true,
      allowedHosts: true,
      hmr: { clientPort: 5000 }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  }
})
