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
| `height` | `number` | `300` | 에디터 높이(px) |
| `toolbar` | `string[][]` | 기본 툴바 | 커스텀 툴바 설정 |

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
npm test         # Vite 개발 서버 (컴포넌트 프리뷰)
npm run build    # 프로덕션 빌드 (eslint + vite)
```
