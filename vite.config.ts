import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve, relative } from 'path';
import pkg from 'glob';
const { glob } = pkg;

// 모든 TypeScript 파일을 찾아서 entry points로 설정
const files = glob.sync('src/**/*.ts', { 
  ignore: ['src/**/*.d.ts', 'src/**/*.test.ts', 'src/**/*.spec.ts'] 
});

const entries: Record<string, string> = files.reduce((acc: Record<string, string>, file: string) => {
  const entryName = relative('src', file.slice(0, -3)); // .ts 제거
  acc[entryName] = resolve(__dirname, file);
  return acc;
}, {});

export default defineConfig({
  // 개발 서버 설정
  server: {
    open: '/demo.html'
  },
  // 빌드 설정
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: entries,
      formats: ['es']
    },
    rollupOptions: {
      external: [
        /^lit.*/,
        /^@lit.*/,
        'react',
        'mobx',
        'quill',
        'monaco-editor',
        'reflect-metadata',
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        preserveModules: true,
        preserveModulesRoot: 'src'
      }
    }
  },
  plugins: [
    dts({
      include: ["src/**/*"],
      insertTypesEntry: true,
      rollupTypes: false,
      copyDtsFiles: true,
    })
  ]
})