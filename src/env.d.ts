/// <reference types="vite/client" />

/** monaco's structural stylesheet, baked at build time — see tooling/monaco-structure-css.ts. */
declare module 'virtual:monaco-structure-css' {
  const css: string;
  export default css;
}
