import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { gameApi } from './server/api'
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env } as Record<string, string>
  return { plugins: [react(), { name: 'ghost-vault-api', configureServer(server) { server.middlewares.use(gameApi(env)) }, configurePreviewServer(server) { server.middlewares.use(gameApi(env)) } }] }
})
