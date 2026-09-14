import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { monacoStructureCss } from './tooling/monaco-structure-css.js';

// 테스트 전용 설정. vite.config.ts의 빌드 플러그인(dts 등)을 로드하지 않도록
// vitest 전용 config를 분리한다 — 테스트 실행이 dist/를 건드리는 부작용을
// 막기 위함. (packages/components·chat-components와 동일한 관례)
//
// Monaco/Quill 은 실제 DOM·워커에 의존하므로 브라우저 프로젝트만 둔다.
export default defineConfig({
  // 소스가 monaco 의 구조 CSS 를 가상 모듈로 받는다 — 빌드와 같은 플러그인이 여기서도 그것을 낸다.
  plugins: [monacoStructureCss()],
  test: {
    projects: [
      {
        // 인라인 프로젝트는 루트 설정을 상속하지 않는다 — 위 plugins 가 이 프로젝트의 dev 서버에도
        // 실리도록 명시한다(없으면 `virtual:monaco-structure-css` 를 해석하지 못한다, 실측).
        extends: true,
        test: {
          name: 'browser',
          include: ['tests/browser/**/*.test.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          // 고정 포트 이유는 packages/components/vitest.config.ts 참조 —
          // 이 머신의 Windows 동적 포트 제외 범위와 vitest 기본 포트가
          // 충돌해 EACCES 로 실패하던 것을 실측으로 확인했다.
          api: { host: '127.0.0.1', port: 41504 },
        },
      },
    ],
  },
});
