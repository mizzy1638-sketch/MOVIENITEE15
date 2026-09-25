import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use '/MOVIENITEE15/' only when building for GitHub Pages
  const isGitHubPages =
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.GITHUB_PAGES === 'true' ||
    process.env.BUILD_FOR_GH_PAGES === 'true' ||
    mode === 'gh-pages';

  const base = isGitHubPages ? '/MOVIENITEE15/' : '/';

  return {
    base,
    plugins: [
      react(),
      {
        name: 'ai-studio-preview-path-normalizer',
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            // If in dev and a request comes in prefixed with /MOVIENITEE15/, normalize to /
            if (req.url && req.url.startsWith('/MOVIENITEE15/')) {
              req.url = req.url.replace(/^\/MOVIENITEE15/, '') || '/';
            }
            next();
          });
        },
      },
      {
        name: 'netlify-functions-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && (req.url.startsWith('/.netlify/functions/') || req.url.startsWith('/MOVIENITEE15/.netlify/functions/'))) {
              const cleanedUrl = req.url.replace('/MOVIENITEE15', '');
              const functionName = cleanedUrl.split('?')[0].replace('/.netlify/functions/', '');
              if (functionName === 'get-upload-url' || functionName === 'delete-r2-object') {
                let body = '';
                req.on('data', (chunk) => {
                  body += chunk;
                });
                req.on('end', async () => {
                  try {
                    const fnModule = await import(`./netlify/functions/${functionName}.mjs`);
                    const result = await fnModule.handler({
                      httpMethod: req.method,
                      body,
                      headers: req.headers,
                    });
                    res.statusCode = result.statusCode;
                    if (result.headers) {
                      for (const [key, value] of Object.entries(result.headers)) {
                        res.setHeader(key, value);
                      }
                    }
                    res.end(result.body);
                  } catch (err: any) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
                  }
                });
                return;
              }
            }
            next();
          });
        },
      },
    ],
  };
});
