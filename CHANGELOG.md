# Changelog

## [0.0.2] - 2026-07-17

### Fixed
- `u-code-editor`: 프로그램적 `value` 세팅 시 Monaco `onDidChangeModelContent`가 그대로 `change` 이벤트로 노출되어, controlled 래퍼(React 등)에서 에코 루프·state 오염을 유발하던 문제 수정. 이제 `change`는 사용자 편집에서만 발화한다.
- `u-text-editor`: 프로그램적 `value` 세팅·초기 콘텐츠 주입이 `quill.root.innerHTML` 직접 변이로 이뤄져 Quill MutationObserver가 이를 사용자 편집(`source='user'`)으로 오인해 `change`가 발화되던 문제 수정. 콘텐츠 주입을 `clipboard.convert()` + `setContents(delta, 'silent')`로 전환하고, `text-change` 리스너는 `source='user'`만 `change`로 노출한다. 사용자 편집 시 `value` 프로퍼티도 동기화된다.
- `u-text-editor`: 명령형 API도 동일 규약으로 정리 — `setHTML()`이 innerHTML 직접 변이로 change를 위장 발화하던 문제 수정(이제 `value` 프로퍼티 경로 위임), `setDelta()`/`clear()`는 silent source 전환 + `value` 프로퍼티 동기화.
- README를 실제 구현에 맞게 재작성 — 잘못된 태그명(`<code-editor>`/`<rich-text-editor>` → `u-code-editor`/`u-text-editor`), 잘못된 prop(`noHeader` → `headless`), 존재하지 않는 `copy` 이벤트·`demo.html` 서술 제거, change 의미론·`/react` 서브패스 문서화.
- 위 수정은 `@iyulab/components` 1.7.0의 "change = 사용자 상호작용 전용" 규약 정합 작업의 일환.

## [Unreleased]
- Initial library version release
