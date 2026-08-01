import { html, unsafeCSS, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import * as monaco from "monaco-editor";
import "./UCodeEditor.worker.js";
import monacoStyles from "monaco-editor/min/vs/editor/editor.main.css?inline";

import { Theme } from "@iyulab/components/dist/utilities/Theme.js";
import { UElement } from "@iyulab/components/dist/components/UElement.js";
import { styles } from './UCodeEditor.styles.js';

/**
 * code editor component used by monaco-editor
 * 
 * @event change - Fired when the content of the editor changes. The event detail contains the current HTML, text, and delta representation of the content.
 */
@customElement("u-code-editor")
export class UCodeEditor extends UElement {
  static styles = [ super.styles, unsafeCSS(monacoStyles), styles ];

  /** Specifies whether the header should be displayed or not. @default false */
  @property({ type: Boolean, reflect: true }) headless: boolean = false;
  /** The label text displayed in the header of the code editor. @default "Editor" */
  @property({ type: String }) label: string = "Editor";
  /** 편집기 테마. 문서 테마를 따라 자동으로 동기화된다(직접 지정해도 덮어쓰인다). */
  @property({ type: String }) theme: "light" | "dark" = "light"; 
  /** Whether the editor should be in read-only mode, preventing user input. @default false */
  @property({ type: Boolean }) readOnly: boolean = false;
  /** The programming language for syntax highlighting (e.g., "json", "javascript", "typescript"). @default "json" */
  @property({ type: String }) language: string = "json";
  /** The font size in pixels for the text in the editor. @default 14 */
  @property({ type: Number }) fontSize: number = 14;
  /** The current text content of the code editor. @default "" */
  @property({ type: String }) value: string = "";
  
  private container: Ref<HTMLElement> = createRef();
  private editor?: monaco.editor.IStandaloneCodeEditor;
  /** 프로그램적 value 동기화 중 여부 — Monaco onDidChangeModelContent는 setValue에서도
   *  발화하므로, 이 플래그로 프로그램적 변경이 change 이벤트로 위장되는 것을 막는다. */
  private syncingValue = false;
  // ⚠`Theme.resolved()` 를 쓴다. `Theme.get()` 은 **선호**를 돌려주므로 기본값
  // `'system'` 에서 `=== "dark"` 가 거짓이 되어, OS 가 다크여도 밝은 테마를 골랐다.
  // 그리고 감시 대상은 `data-theme` 만으로 부족하다 — system 선호에서 OS 테마가 바뀌면
  // `data-theme` 은 `"system"` 그대로이고 실효값은 `theme` 속성에만 반영된다.
  private observer: MutationObserver = new MutationObserver(() => {
    const theme = Theme.resolved();
    if (this.theme !== theme) this.theme = theme;
  });

  connectedCallback() {
    super.connectedCallback();
    this.theme = Theme.resolved();
    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "theme"]
    });
  }

  disconnectedCallback() {
    this.observer.disconnect();
    super.disconnectedCallback();
  }

  protected async firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    await this.updateComplete;
      
    this.editor = monaco.editor.create(this.container.value!, {
      language: this.language,
      theme: this.theme === "light" ? "vs-light" : "vs-dark",
      fontSize: this.fontSize,
      automaticLayout: true,
      minimap: { enabled: false },
      lineNumbersMinChars: 2,
      lineDecorationsWidth: 1,
      readOnly: this.readOnly,
      value: this.value,
      // Updated options for newer Monaco
      scrollBeyondLastLine: false,
      scrollbar: {
        alwaysConsumeMouseWheel: false
      }
    });

    this.editor.onDidChangeModelContent(() => {
      if (this.syncingValue) return;
      this.value = this.editor!.getValue();
      this.dispatchEvent(new Event("change", {
        bubbles: true,
        composed: true
       }));
    });
  }

  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("value")
      && this.value !== this.editor?.getValue()
      && !this.editor?.hasWidgetFocus()) {
      this.syncingValue = true;
      this.editor?.setValue(this.value);
      this.syncingValue = false;
    }
    if (changedProperties.has("theme") && this.editor) {
      this.editor.updateOptions({
        theme: this.theme === "light" ? "vs-light" : "vs-dark",
      });
    }
    if (changedProperties.has("language") && this.editor) {
      monaco.editor.setModelLanguage(this.editor.getModel()!, this.language);
    }
  }
  
  render() {
    return html`
      <div class="header" ?hidden=${this.headless}>
        <div class="title">${this.label}</div>
        <div class="flex"></div>
        <slot name="header-actions"></slot>
      </div>
      <div class="editor">
        <main ${ref(this.container)}></main>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "u-code-editor": UCodeEditor;
  }
}