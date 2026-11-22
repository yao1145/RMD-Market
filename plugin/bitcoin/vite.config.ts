import { fileURLToPath } from 'node:url';

const here = (path: string): string => fileURLToPath(new URL(path, import.meta.url));
const engine = here('../../../ReactiveMD');
const library = (name: string): string => `${engine}/dist-library/${name}`;
const dependency = (name: string): string => `${engine}/node_modules/${name}`;

export default {
  root: here('./'),
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: /^reactive-md\/styles\.css$/, replacement: library('reactive-md.css') },
      { find: /^reactive-md\/sdk$/, replacement: library('reactive-md-sdk.js') },
      { find: /^reactive-md\/react$/, replacement: library('reactive-md-react.js') },
      { find: /^reactive-md\/presets\/default$/, replacement: library('reactive-md-default-preset.js') },
      { find: /^reactive-md\/runtime\/browser$/, replacement: library('reactive-md-runtime-browser.js') },
      { find: /^reactive-md\/runtime$/, replacement: library('reactive-md-runtime.js') },
      { find: /^reactive-md$/, replacement: library('reactive-md.js') },
      { find: /^react-dom\/client$/, replacement: dependency('react-dom/client.js') },
      { find: /^react-dom\/server$/, replacement: dependency('react-dom/server.browser.js') },
      { find: /^react-dom$/, replacement: dependency('react-dom/index.js') },
      { find: /^react\/jsx-runtime$/, replacement: dependency('react/jsx-runtime.js') },
      { find: /^react\/jsx-dev-runtime$/, replacement: dependency('react/jsx-dev-runtime.js') },
      { find: /^react$/, replacement: dependency('react/index.js') },
    ],
  },
  server: { host: '127.0.0.1', port: 5211, strictPort: true },
  build: { outDir: here('./dist'), emptyOutDir: true, target: 'es2022' },
};
