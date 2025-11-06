import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import '../src';
import { getTheme, importTheme, setTheme } from "@iyulab/components/dist/utilities/theme.js";

@customElement('preview-app')
export class PreviewApp extends LitElement {

  firstUpdated(changedProperties: any): void {
    super.firstUpdated(changedProperties);
    importTheme();
  }

  render() {
    return html`
      <div class="header">
        <h1>Editor Components Preview</h1>
        <u-button @click=${this.toggleTheme}>테마 변경</u-button>
      </div>

      <section class="section">
        <h2>Code Editor</h2>
        
        <div class="demo-item">
          <h3>JavaScript Code Editor</h3>
          <u-code-editor
            language="javascript"
            .value=${`// JavaScript 코드를 작성해보세요
function greeting(name) {
  return \`Hello, \${name}!\`;
}

console.log(greeting('World'));`}
            style="height: 300px;"
          ></u-code-editor>
        </div>

        <div class="demo-item">
          <h3>HTML Code Editor</h3>
          <u-code-editor
            language="html"
            .value=${`<!-- HTML 코드를 작성해보세요 -->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Sample Page</title>
</head>
<body>
  <h1>Hello World</h1>
  <p>This is a sample HTML page.</p>
</body>
</html>`}
            style="height: 300px;"
          ></u-code-editor>
        </div>

        <div class="demo-item">
          <h3>CSS Code Editor</h3>
          <u-code-editor
            language="css"
            .value=${`/* CSS 스타일을 작성해보세요 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background-color: #333;
  color: white;
  padding: 10px;
}`}
            style="height: 250px;"
          ></u-code-editor>
        </div>

        <div class="demo-item">
          <h3>JSON Code Editor</h3>
          <u-code-editor
            language="json"
            .value=${`{
  "name": "sample-project",
  "version": "1.0.0",
  "description": "샘플 프로젝트",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  },
  "keywords": ["sample", "demo"],
  "author": "Developer",
  "license": "MIT"
}`}
            style="height: 300px;"
          ></u-code-editor>
        </div>
      </section>

      <section class="section">
        <h2>Rich Text Editor</h2>
        
        <div class="demo-item">
          <h3>Basic Rich Text Editor</h3>
          <u-rich-text-editor
            .value=${`<h2>리치 텍스트 에디터</h2>
<p>이것은 <strong>볼드</strong>와 <em>이탤릭</em> 텍스트 예제입니다.</p>
<ul>
  <li>첫 번째 항목</li>
  <li>두 번째 항목</li>
  <li>세 번째 항목</li>
</ul>
<p>링크 예제: <a href="https://example.com">Example Website</a></p>`}
            style="height: 400px;"
          ></u-rich-text-editor>
        </div>

        <div class="demo-item">
          <h3>Readonly Rich Text Editor</h3>
          <u-rich-text-editor
            readonly
            .value=${`<h3>읽기 전용 에디터</h3>
<p>이 에디터는 <strong>읽기 전용</strong> 모드입니다.</p>
<p>내용을 수정할 수 없습니다.</p>`}
            style="height: 250px;"
          ></u-rich-text-editor>
        </div>
      </section>
    `;
  }

  toggleTheme() {
    setTheme(getTheme() === 'light' ? 'dark' : 'light');
  }

  static styles = css`
    :host {
      display: block;
      width: 100vw;
      min-height: 100vh;
      padding: 20px;
      box-sizing: border-box;
      background-color: var(--u-color-background);
      color: var(--u-color-text);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--u-color-border);
    }

    .header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
    }

    .section {
      margin-bottom: 60px;
    }

    .section h2 {
      margin: 0 0 30px 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--u-color-primary);
    }

    .demo-item {
      margin-bottom: 40px;
      padding: 20px;
      border: 1px solid var(--u-color-border);
      border-radius: 8px;
      background-color: var(--u-color-surface);
    }

    .demo-item h3 {
      margin: 0 0 16px 0;
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--u-color-text-secondary);
    }

    u-code-editor,
    u-rich-text-editor {
      width: 100%;
      border: 1px solid var(--u-color-border);
      border-radius: 4px;
    }
  `;
}