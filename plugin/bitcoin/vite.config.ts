import { fileURLToPath } from 'node:url';

const here = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default {
  root: here('./'),
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: { host: '127.0.0.1', port: 5211, strictPort: true },
  build: { outDir: here('./dist'), emptyOutDir: true, target: 'es2022' },
};