# @iyulab/editor-components

다양한 에디터 컴포넌트를 제공하는 라이브러리입니다.

## 포함된 컴포넌트

### CodeEditor
Monaco Editor를 기반으로 한 코드 에디터 컴포넌트입니다.

**특징:**
- 구문 강조 (JavaScript, TypeScript, JSON, CSS, HTML, Python 등)
- 자동완성 및 IntelliSense
- 에러 검사 및 린팅
- 다크/라이트 테마 지원
- 읽기 전용 모드
- 커스터마이징 가능한 폰트 크기

**사용법:**
```html
<code-editor
  label="My Code Editor"
  language="javascript"
  theme="light"
  font-size="14"
  value="console.log('Hello World!');"
  read-only="false">
</code-editor>
```

**Properties:**
- `noHeader`: 헤더 표시 여부 (boolean, default: false)
- `label`: 헤더 레이블 텍스트 (string, default: "Editor")
- `theme`: 테마 ("light" | "dark", default: "light")
- `readOnly`: 읽기 전용 모드 (boolean, default: false)
- `language`: 프로그래밍 언어 (string, default: "json")
- `fontSize`: 폰트 크기 (number, default: 14)
- `value`: 에디터 내용 (string, default: "")

### RichTextEditor
Quill.js를 기반으로 한 리치 텍스트 에디터 컴포넌트입니다.

**특징:**
- WYSIWYG 편집 환경
- 다양한 텍스트 포맷팅 (굵게, 기울임, 밑줄 등)
- 목록, 헤더, 인용구 지원
- 링크 및 이미지 삽입
- 커스터마이징 가능한 툴바
- 다크/라이트 테마 지원
- HTML, 텍스트, Delta 형식 지원

**사용법:**
```html
<rich-text-editor
  label="My Rich Text Editor"
  theme="light"
  height="300"
  placeholder="Start writing..."
  value="<h2>Hello World!</h2><p>This is <strong>rich text</strong>.</p>"
  read-only="false">
</rich-text-editor>
```

**Properties:**
- `noHeader`: 헤더 표시 여부 (boolean, default: false)
- `label`: 헤더 레이블 텍스트 (string, default: "Rich Text Editor")
- `theme`: 테마 ("light" | "dark", default: "light")
- `readOnly`: 읽기 전용 모드 (boolean, default: false)
- `placeholder`: 플레이스홀더 텍스트 (string, default: "Start writing...")
- `value`: 에디터 HTML 내용 (string, default: "")
- `height`: 에디터 높이 (number, default: 300)
- `toolbar`: 커스텀 툴바 설정 (array, optional)

**Methods:**
- `getHTML()`: HTML 형식으로 내용 반환
- `getText()`: 플레인 텍스트로 내용 반환
- `getDelta()`: Quill Delta 형식으로 내용 반환
- `setHTML(html)`: HTML 형식으로 내용 설정
- `setDelta(delta)`: Delta 형식으로 내용 설정
- `clear()`: 모든 내용 삭제
- `focus()`: 에디터에 포커스

## 설치

```bash
npm install @iyulab/editor-components
```

## 사용법

```javascript
import '@iyulab/editor-components';

// 또는 개별 컴포넌트만 import
import { CodeEditor, RichTextEditor } from '@iyulab/editor-components';
```

## 이벤트

### CodeEditor
- `change`: 에디터 내용이 변경될 때 발생 (detail: string)

### RichTextEditor
- `change`: 에디터 내용이 변경될 때 발생 (detail: { html, text, delta })
- `copy`: 복사 버튼 클릭 시 발생 (detail: string)

## 데모

프로젝트에 포함된 `demo.html` 파일을 통해 컴포넌트들을 실제로 테스트해볼 수 있습니다.

```bash
npm run start
```

## 라이선스

MIT