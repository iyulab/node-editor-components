# Changelog

## [0.3.3] - 2026-08-25

### Added

- Agent-skill reference docs for both components (`skills/iyulab-editor-components/`) —
  properties, slots, events, and methods for `u-code-editor`/`u-text-editor`.

### Fixed

- 🔴**`monaco-editor` bundles a vulnerable `dompurify` (`3.4.8`) with no pin protecting it.**
  Four moderate/low DOMPurify advisories (GHSA-c2j3-45gr-mqc4, GHSA-cmwh-pvxp-8882,
  GHSA-vxr8-fq34-vvx9, GHSA-55q2-fjhq-7xh7) affect `<=3.4.12`; a fresh install of this package
  resolved the vulnerable version with nothing to stop it. Added `overrides: { dompurify:
  "^3.4.13" }` — `dompurify` is a transitive dependency here (bundled via `monaco-editor`), not
  a direct one, so this pins cleanly without touching `dependencies`. Verified with a clean
  install: `npm audit` no longer reports any dompurify advisory, typecheck/lint/test/build all
  pass. (`quill`'s own advisory, GHSA-v3m3-f69x-jf25, has no upstream fix yet and is unrelated
  to this pin — still open, tracked separately.)

## [0.3.2] - 2026-08-18

### Changed

- Widened the `monaco-editor` dependency range from `^0.55.1` to `^0.55.1 || ^0.56.0` so
  consumers can opt into 0.56.0. This is an added choice, not a forced upgrade — the pinned
  `^0.55.1` range still resolves by default. 0.56.0's only breaking surface (an internal module
  export reorganization) is caught immediately by this package's `tsc --noEmit` build gate, and
  `UCodeEditor` only uses the standard `monaco.editor.create`/`setModelLanguage` API surface plus
  official worker subpaths, so it is unaffected. Verified with 0.56.0 installed: clean typecheck,
  successful build, full test suite green.

## [0.3.1] - 2026-08-07

### Fixed

- 🔴**`sideEffects` omitted this package's own entry barrel, so bundlers dropped every element
  registration.** The barrel that `exports["."]` resolves to exists solely to register the custom
  elements, but it was not in the `sideEffects` allowlist. A consumer writing
  `import '@iyulab/editor-components'` — the form this package's own documentation recommends —
  had the module elided entirely in a production build. The failure is silent: the build
  succeeds with no warning, the tags remain in the DOM, and an unregistered custom element
  renders nothing.

  Both the source-resolved and published-artifact forms of the affected entry point are now
  declared, so workspace consumers and installed consumers get the same guarantee.

## [0.3.0] - 2026-08-05

### Fixed

- 🔴**The `change` event never crossed the shadow boundary.** It was dispatched without
  `bubbles` or `composed`, so a listener attached by the consumer was never called — with
  no error to indicate why. Anyone who worked around this by reaching into the shadow root
  can now drop that workaround.

  ```ts
  editor.addEventListener('change', e => save(e.detail.value));
  ```

## [0.2.2] - 2026-08-02

### Fixed

- **토큰 폴백 리터럴 2곳이 정본 시트와 어긋나 있던 문제** —
  `--u-primary-color` 가 `#1E88E5` 로 남아 있었다(`@iyulab/components` 1.16.0 은 `#1976D2`).

  ⚠**이 결함은 개발 환경에서 절대 드러나지 않는다.** 토큰 시트가 있으면 폴백은 아예
  평가되지 않는다 — 깨지는 곳은 시트를 로드하지 않은 소비자의 화면이고, 우리가 보지
  못하는 자리다. 모노레포 루트의 `npm run tokens:sync` 가 이제 정본 시트와 대조한다.

## [0.2.1] - 2026-08-02

### Fixed

- **`--u-txt-color-weak` 폴백 리터럴을 시트 값에 맞췄다** (`#9E9E9E` → `#757575`, 2곳).
  업스트림이 이 토큰의 라이트 매핑을 WCAG AA 미달(2.68)에서 neutral-600(4.61)으로
  고쳤다. 폴백은 **토큰 시트가 없을 때만** 쓰이므로 시트를 로드하는 환경에서는 변화가
  없지만, 어긋난 채로 두면 시트 유무에 따라 색이 갈린다.

## [0.2.0] - 2026-08-01

### Added

- **툴바 강조색이 브랜드를 따라온다** — 종전에는 `--u-blue-600` 에 하드와이어돼 있어
  소비자가 브랜드를 다른 색으로 잡아도 편집기 툴바만 파랑으로 남았다. 이제 역할 토큰
  (`--u-primary-color`)을 읽으므로 재브랜딩이 한 줄로 끝난다.

### Fixed

- ★**코드 편집기가 시스템 테마에서 항상 밝은 테마로 렌더되던 문제 수정** —
  테마 판정에 `Theme.get()`(사용자 **선호**)을 써서 기본값 `'system'` 이 `'dark'` 와 같지
  않다는 이유로 밝은 테마를 골랐다. **OS 가 다크여도 마찬가지였고, 이 설정이 기본이다.**
  `Theme.resolved()`(실효 테마)로 고쳤다.
- **시스템 테마에서 OS 테마를 바꿔도 코드 편집기가 반응하지 않던 문제 수정** — 감시
  대상이 `data-theme` 뿐이었다. system 선호에서는 그 값이 `"system"` 그대로이고 실효
  테마는 `theme` 속성에만 반영되므로 관찰자가 발화하지 않았다.

### Changed

- **텍스트 편집기의 색 선언이 팔레트에서 시맨틱 토큰으로 바뀌었다**(25 → 9).
  기계적으로 뒤집히는 팔레트 단 대신 테마별로 조율된 단을 쓴다.
- ⚠**`u-text-editor` 의 `theme` 프로퍼티가 제거됐다.** 지정해도 동작한 적이 없다 —
  값이 연결 시점에 덮어써졌고, 그 값이 구동하던 CSS 규칙은 속성이 반영되지 않아
  **한 번도 매치되지 않았다**. 편집기는 종전과 같이 문서 테마를 따라간다(그 동작은
  팔레트 반전이 담당하고 있었고, 이제 시맨틱 토큰이 담당한다).
- **`@iyulab/components` 최소 버전이 `^1.14.0`** — `Theme.resolved()` 를 쓴다.

## [0.1.1] - 2026-07-19

### Added
- **테스트 인프라 도입** — 이 패키지에는 자동 테스트가 없었다(`tests/` 는 수동 preview 앱). 모노레포의 다른 컴포넌트 패키지와 동일한 vitest + playwright 브라우저 스택을 붙이고 `UTextEditor` 생명주기 계약 테스트 5건을 추가했다(mount → 편집 → detach → re-attach, 공개 접근자의 teardown 후 안전성). 기존 `npm test`(preview 앱 실행)는 `npm run preview` 로 이름을 옮겼다.

### Documentation
- 0.1.0 의 `UTextEditor` 항목 서술을 정정 — "해제 후 접근에서 깨질 수 있던" 이라 썼으나 **실제로는 런타임에 도달하지 않는 경로**였다(호출부가 이미 `if (this.quill)` 로 감싸여 있었다). 타입 정직성 개선의 값은 예방에 있지 live-bug 수정이 아니다. 테스트로 확인한 사실에 맞게 문구를 바로잡았다.

## [0.1.0] - 2026-07-19

### Fixed
- **`UTextEditor` 의 타입 거짓말 제거(예방적)** — `quill` 필드가 `Quill`(non-null 단언)로 선언돼 있는데 `disconnectedCallback` 은 `null as any` 로 null 을 대입하고 있었다. 두 거짓말이 상쇄되어 null 가드 없는 역참조 5곳이 타입 검사를 통과하고 있었다. 필드를 `Quill | null` 로 정직하게 선언하고, `text-change` 핸들러는 생성 시점 지역 참조를 캡처하도록, `setQuillContents` 는 방어 가드를 갖도록 고쳤다. **다만 이는 런타임 버그 수정이 아니다** — 해당 호출부는 모두 `updated()` 의 `if (this.quill)` 안에 있어 실제로는 도달하지 않았다. 값은 앞으로 가드 없는 호출이 추가될 때 tsc 가 즉시 잡아준다는 데 있다.

### Changed
- **이 패키지의 eslint 가 실제로 동작하기 시작했다.** `files` 패턴의 확장자 누락과 배열 프리셋 객체 스프레드 결함을 수정했다. `build` 스크립트의 `eslint &&` 게이트는 매칭 파일이 0개라 항상 통과하고 있었다. 위 null 결함은 이 복구로 처음 드러났다.
- `npm run lint` / `npm run lint:fix` 스크립트 추가.
- **Delta 타입 정밀화(소비자 영향 가능)**: `getDelta()` 가 `any` → `QuillDelta | null`, `setDelta()` 파라미터가 `any` → `QuillDeltaInput` 으로 좁혀졌다. 두 타입은 `quill-delta` 를 새 의존성으로 들이지 않고 Quill 자체 시그니처(`ReturnType<Quill['getContents']>` 등)에서 유도하므로 Quill 버전 변화를 자동으로 따라간다. `getDelta()` 가 `null` 을 반환할 수 있음이 이제 타입에 드러난다.
- Lit 생명주기 파라미터(`firstUpdated`/`updated`)의 `any` 를 `PropertyValues` 로, Monaco worker 의 `(self as any)` 를 명시적 인터페이스로 교체.

## [0.0.2] - 2026-07-17

### Fixed
- `u-code-editor`: 프로그램적 `value` 세팅 시 Monaco `onDidChangeModelContent`가 그대로 `change` 이벤트로 노출되어, controlled 래퍼(React 등)에서 에코 루프·state 오염을 유발하던 문제 수정. 이제 `change`는 사용자 편집에서만 발화한다.
- `u-text-editor`: 프로그램적 `value` 세팅·초기 콘텐츠 주입이 `quill.root.innerHTML` 직접 변이로 이뤄져 Quill MutationObserver가 이를 사용자 편집(`source='user'`)으로 오인해 `change`가 발화되던 문제 수정. 콘텐츠 주입을 `clipboard.convert()` + `setContents(delta, 'silent')`로 전환하고, `text-change` 리스너는 `source='user'`만 `change`로 노출한다. 사용자 편집 시 `value` 프로퍼티도 동기화된다.
- `u-text-editor`: 명령형 API도 동일 규약으로 정리 — `setHTML()`이 innerHTML 직접 변이로 change를 위장 발화하던 문제 수정(이제 `value` 프로퍼티 경로 위임), `setDelta()`/`clear()`는 silent source 전환 + `value` 프로퍼티 동기화.
- README를 실제 구현에 맞게 재작성 — 잘못된 태그명(`<code-editor>`/`<rich-text-editor>` → `u-code-editor`/`u-text-editor`), 잘못된 prop(`noHeader` → `headless`), 존재하지 않는 `copy` 이벤트·`demo.html` 서술 제거, change 의미론·`/react` 서브패스 문서화.
- 위 수정은 `@iyulab/components` 1.7.0의 "change = 사용자 상호작용 전용" 규약 정합 작업의 일환.

## [Unreleased]

### Fixed

- 🔴**`sideEffects` omitted this package's own entry barrel, so bundlers dropped every element
  registration.** The barrel that `exports["."]` resolves to exists solely to register the custom
  elements, but it was not in the `sideEffects` allowlist. A consumer writing
  `import '@iyulab/editor-components'` — the form this package's own documentation recommends — had the module
  elided entirely in a production build. The failure is silent: the build succeeds with no warning,
  the tags remain in the DOM, and an unregistered custom element renders nothing.

  Registration modules were already listed correctly. That was not enough: a dropped barrel means
  they are never reached.

  Both the source-resolved and published-artifact forms of every affected entry point are now
  declared, so workspace consumers and installed consumers get the same guarantee.

- Initial library version release
