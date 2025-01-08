import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import topLevelAwait from 'vite-plugin-top-level-await';

interface ServerConfig {
  name: string;
  configureServer: (server: import('vite').ViteDevServer) => void;
}

const viteServerConfig = (): ServerConfig => ({
  name: "add-headers",
  configureServer: (server) => {
    server.middlewares.use((_req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      next();
    });
  },
});


// https://vite.dev/config/
export default defineConfig({
  esbuild: {
    supported: {
      'top-level-await': true //browsers can handle top-level-await features
    },
  },
  build: {
    target: 'ESNext' //browsers can handle the latest ES features
  },
  plugins: [topLevelAwait() ,react(), viteServerConfig()],
})
