import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { deconstructOutfitPhoto, analyzeOutfitLinks } from './src/server/stylistService';
import { identifyBookCoverWithGemini, identifyUniversalProductWithGemini } from './src/server/omniSearchService';

function stylistApiPlugin(): Plugin {
  return {
    name: 'stylist-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        req.on('end', async () => {
          try {
            const bodyStr = Buffer.concat(chunks).toString('utf-8');
            const body = bodyStr ? JSON.parse(bodyStr) : {};

            if (req.url === '/api/stylist/deconstruct-photo') {
              const result = await deconstructOutfitPhoto(body);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }

            if (req.url === '/api/stylist/analyze-links') {
              const result = await analyzeOutfitLinks(body);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }

            if (req.url === '/api/books/scan') {
              const result = await identifyBookCoverWithGemini(body);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result || { error: 'Could not identify book' }));
              return;
            }

            if (req.url === '/api/universal/scan') {
              const result = await identifyUniversalProductWithGemini(body);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result || { error: 'Could not identify product' }));
              return;
            }

            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
          } catch (err: any) {
            console.error('API middleware error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      stylistApiPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'process.env': {},
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      cors: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
