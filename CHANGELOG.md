# Changelog

## [0.1.0] - 2026-07-19

### Fixed
- **`UTextEditor` 가 해제 후 접근에서 깨질 수 있던 타입 거짓말 제거** — `quill` 필드가 `Quill`(non-null 단언)로 선언돼 있는데 `disconnectedCallback` 은 `null as any` 로 null 을 대입하고 있었다. 타입 시스템을 속인 탓에 null 검사 누락 5곳이 가려져 있었다. 필드를 `Quill | null` 로 정직하게 선언하고, `text-change` 핸들러는 생성 시점의 지역 참조를 캡처하도록, `setQuillContents` 는 초기화 전/해제 후 호출을 무시하도록 고쳤다.

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
- Initial library version release
