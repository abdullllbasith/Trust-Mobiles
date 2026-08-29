import path from 'path';
import express from 'express';
import app, { connectDB, shrinkOversizedProductImages } from './api/app.js';

const PORT = 3000;

async function startServer() {
  await connectDB();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Shrink huge embedded photos after listen so the first catalog request isn't blocked by startup work.
    setTimeout(() => {
      void shrinkOversizedProductImages().catch((err) =>
        console.warn('Image shrink skipped:', err?.message || err),
      );
    }, 1500);
  });
}

startServer();
