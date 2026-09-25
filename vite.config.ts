import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    // Subpath base for GitHub Pages production deployments: https://mizzy1638-sketch.github.io/MOVIENITEE15/
    base: '/MOVIENITEE15/',
    esbuild: {
      jsx: 'automatic',
    },
    plugins: [
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
