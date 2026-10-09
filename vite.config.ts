import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import stripCssComments from '@iyulab/components/plugins/vite-plugin-strip-css-comments.js';
import react from '@iyulab/components/plugins/vite-plugin-react-wrapper.js';
import { monacoStructureCss } from './tooling/monaco-structure-css.js';

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
    copyPublicDir: false,
    minify: false,
    lib: {
      entry: [
        resolve(__dirname, 'src/index.ts'),
      ],
      formats: ['es'],
      fileName: (format, entry) => {
        return format === 'es' ? `${entry}.js` : `${entry}.${format}.js`;
      }
    },
    rollupOptions: {
      external: [
        /^@iyulab.*/,
        /^lit.*/,
        /^monaco-editor.*/,
        /^quill.*/,
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      }
    }
  },
  plugins: [
    // `css` 템플릿 안 주석은 문자열이라 번들러가 지우지 못한다 — 정본 플러그인으로 걷는다(components `plugins/`).
    stripCssComments(),
    monacoStructureCss(),
    dts({
      include: ["src/**/*"]
    }),
    react({
      input: 'src/components',
      output: 'react',
    })
  ]
})