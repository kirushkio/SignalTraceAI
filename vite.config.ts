import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createApp } from './server/app';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'signaltrace-api-backend',
      configureServer(server) {
        const apiApp = createApp();
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/api')) {
            apiApp(req, res, next);
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
