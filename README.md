# @iyulab/editor-components

다양한 에디터 컴포넌트를 제공하는 라이브러리입니다.

## 설치

```bash
npm install @iyulab/editor-components
```

```javascript
import '@iyulab/editor-components';

// 또는 개별 컴포넌트만 import
import { UCodeEditor, UTextEditor } from '@iyulab/editor-components';
```

React 래퍼는 `/react` 서브패스로 제공됩니다:

```tsx
import { UCodeEditor, UTextEditor } from '@iyulab/editor-components/react';
```

## 포함된 컴포넌트

### `u-code-editor` (UCodeEditor)

Monaco Editor 기반 코드 에디터 컴포넌트입니다.

**특징:** 구문 강조 · 자동완성/IntelliSense · 다크/라이트 테마 자동 추적 · 읽기 전용 모드

```html
<u-code-editor
  label="My Code Editor"
  language="javascript"
  font-size="14"
  value="console.log('Hello World!');">
</u-code-editor>
```

**Properties:**

| Property | Type | Default | 설명 |
|----------|------|---------|------|
| `headless` | `boolean` | `false` | 헤더(라벨 영역) 숨김 |
| `label` | `string` | `"Editor"` | 헤더 라벨 텍스트 |
| `theme` | `"light" \| "dark"` | 시스템 테마 추적 | 에디터 테마 |
| `readOnly` | `boolean` | `false` | 읽기 전용 모드 |
| `language` | `string` | `"json"` | 구문 강조 언어 |
| `fontSize` | `number` | `14` | 폰트 크기(px) |
| `value` | `string` | `""` | 에디터 내용 |

**크기:** **호스트 상자가 크기를 정합니다** — `:host` 가 `width: 100%; height: 100%` 이고 편집 영역은 머리글을 뺀 나머지입니다(Monaco 가 `automaticLayout` 으로 따라옵니다). `height` 프로퍼티는 없으니 요소나 부모에 CSS 로 높이를 주세요.

⚠**부모에 자기 높이가 없으면 `height: 100%` 가 무효가 되어 편집 영역이 몇 px 로 붕괴합니다** — 오류도 콘솔 경고도 없이 머리글과 빈 띠만 남습니다. 부모에 높이를 주거나 요소에 직접 주세요. `headless` 면 머리글이 없어 편집 영역이 호스트 상자 전체입니다.

⚠`u-text-editor` 는 반대입니다 — 거기서는 `height` 프로퍼티가 편집 영역을 정하고 호스트 CSS `height` 는 그것을 바꾸지 않습니다. 한쪽에서 되던 레이아웃이 다른 쪽에 그대로 옮겨지지 않습니다.

### `u-text-editor` (UTextEditor)

Quill.js 기반 리치 텍스트(WYSIWYG) 에디터 컴포넌트입니다.

**특징:** 텍스트 포맷팅 · 목록/헤더/인용구 · 링크/이미지 · 커스텀 툴바 · 다크/라이트 테마 자동 추적

```html
<u-text-editor
  label="My Rich Text Editor"
  height="300"
  placeholder="Start writing..."
  value="<h2>Hello World!</h2><p>This is <strong>rich text</strong>.</p>">
</u-text-editor>
```

**Properties:**

| Property | Type | Default | 설명 |
|----------|------|---------|------|
| `headless` | `boolean` | `false` | 헤더(라벨 영역) 숨김 |
| `label` | `string` | `"Rich Text Editor"` | 헤더 라벨 텍스트 |
| `readOnly` | `boolean` | `false` | 읽기 전용 모드 |
| `placeholder` | `string` | `"Start writing..."` | 플레이스홀더 텍스트 |
| `value` | `string` | `""` | 에디터 HTML 내용 |
| `height` | `number` | `300` | **편집 영역** 높이(px) — 아래 「크기」 참조 |
| `toolbar` | `string[][]` | 기본 툴바 | 커스텀 툴바 설정 |

**크기:** `height` 는 **편집 영역**의 높이(px)이고, 호스트 상자는 거기에 헤더가 더해진 크기입니다(`height="300"` → 약 349px = 헤더 48 + 300 + 테두리 · `headless` 면 헤더 없음).

🔴**호스트에 CSS `height` 를 줘도 편집 영역은 바뀌지 않습니다.** 호스트 상자만 바뀌므로, 작게 주면 편집 영역이 상자 밖으로 넘치고(일부러 자르지 않습니다 — Quill 의 떠 있는 UI 인 선택기 목록·링크 툴팁이 상자를 벗어날 수 있어야 합니다) 크게 주거나 `height: 100%` 로 주면 아래에 빈 공간이 남습니다. 부모 높이를 채우려면 CSS 가 아니라 `height` 프로퍼티로 넘기세요.

⚠`u-code-editor` 는 반대입니다 — `height` 프로퍼티가 없고 호스트 상자를 채웁니다(`height: 100%`). 한쪽에서 되던 레이아웃이 다른 쪽에 그대로 옮겨지지 않습니다.

**Methods:**

- `getHTML()` / `getText()` / `getDelta()`: HTML / 플레인 텍스트 / Quill Delta 형식으로 내용 반환
- `setHTML(html)` / `setDelta(delta)`: 내용 설정 (프로그램적 — `change` 미발화)
- `clear()`: 모든 내용 삭제 (프로그램적 — `change` 미발화)
- `focus()`: 에디터에 포커스

## 이벤트

`change`는 네이티브 폼 컨트롤 규약을 따라 **사용자 편집에서만** 발화합니다. 프로그램적 `value` 세팅·`setHTML()`/`setDelta()`/`clear()`는 발화하지 않으므로, React 등 controlled 래퍼에서 에코 루프 없이 안전하게 바인딩할 수 있습니다.

### `u-code-editor`
- `change`: 사용자 편집으로 내용이 변경될 때 발생. 현재 값은 `event.target.value`로 읽습니다.

### `u-text-editor`
- `change`: 사용자 편집으로 내용이 변경될 때 발생 (`detail: { html, text, delta }`)

## 개발

```bash
npm run preview  # Vite 개발 서버 (컴포넌트 프리뷰)
npm test         # 테스트 (vitest — 브라우저 프로젝트, Chromium)
npm run build    # 프로덕션 빌드 (typecheck + eslint + vite)
```
