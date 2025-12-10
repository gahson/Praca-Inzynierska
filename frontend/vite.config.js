import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: true,
        watch: {
            usePolling: true,
        },
        proxy: {
            '/api/': {
                target: 'http://backend:5555/',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }

    }
})