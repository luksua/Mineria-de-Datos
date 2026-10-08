import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * El backend PHP existente vive en Apache (XAMPP) bajo esta ruta.
 * En desarrollo, todo lo que empiece por `/md` se reenvía a Apache, de modo que
 * React consume `api/index.php` y los recursos (PNG de resultados) sin CORS ni
 * cambios en el PHP.
 */
const APACHE_ORIGIN = 'http://localhost'
const MD_PATH = '/api%20vehiculos%20tutoria/MINERIA_DATOS'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/md': {
        target: APACHE_ORIGIN,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/md/, MD_PATH),
      },
    },
  },
})
