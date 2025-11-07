import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  // 개발 서버 설정
  server: {
    open: '/tests/index.html',
    port: 5174,
  },
  // 빌드 설정
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: (format, entry) => {
        return format === 'es' ? `${entry}.js` : `${entry}.${format}.js`;
      }
    },
    rollupOptions: {
      external: [
        /^@iyulab.*/,
        /^lit.*/,
        /^@lit.*/,
        /^react.*/,
        'reflect-metadata',
        'monaco-editor',
        'quill',
      ],
      output: {
        preserveModulesRoot: 'src',
        preserveModules: true,
        assetFileNames: 'assets/[name]-[hash].[extname]',
        chunkFileNames: 'chunks/[name]-[hash].js',
      }
    }
  },
  plugins: [
    dts({
      include: ["src/**/*"]
    })
  ]
})