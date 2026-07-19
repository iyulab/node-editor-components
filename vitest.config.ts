import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

// 테스트 전용 설정. vite.config.ts의 빌드 플러그인(dts 등)을 로드하지 않도록
// vitest 전용 config를 분리한다 — 테스트 실행이 dist/를 건드리는 부작용을
// 막기 위함. (packages/components·chat-components와 동일한 관례)
//
// Monaco/Quill 은 실제 DOM·워커에 의존하므로 브라우저 프로젝트만 둔다.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'browser',
          include: ['tests/browser/**/*.test.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
