import { html, nothing, unsafeCSS } from "lit";
import { property } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import * as monaco from "monaco-editor";
import "./UCodeEditor.worker.js";
import monacoStyles from "monaco-editor/min/vs/editor/editor.main.css?inline";

import { BaseElement } from "@iyulab/components/dist/components/BaseElement.js";
import { styles } from './UCodeEditor.styles.js';

/**
 * code editor component used by monaco-editor
 */
export class UCodeEditor extends BaseElement {
  static styles = [ unsafeCSS(monacoStyles), styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  private container: Ref<HTMLElement> = createRef();
  private editor!: monaco.editor.IStandaloneCodeEditor;
  private observer: MutationObserver = new MutationObserver(() => {
    const theme = document.documentElement.classList.contains("theme") ? "dark" : "light";
    if (this.theme !== theme) this.theme = theme;
  });

  /** Specifies whether the header should be displayed or not. @default false */
  @property({ type: Boolean, reflect: true }) noHeader: boolean = false;
  /** The label text displayed in the header of the code editor. @default "Editor" */
  @property({ type: String }) label: string = "Editor";
  /** The visual theme of the code editor. Can be "light" or "dark". @default "light" */
  @property({ type: String }) theme: "light" | "dark" = "light"; 
  /** Whether the editor should be in read-only mode, preventing user input. @default false */
  @property({ type: Boolean }) readOnly: boolean = false;
  /** The programming language for syntax highlighting (e.g., "json", "javascript", "typescript"). @default "json" */
  @property({ type: String }) language: string = "json";
  /** The font size in pixels for the text in the editor. @default 14 */
  @property({ type: Number }) fontSize: number = 14;
  /** The current text content of the code editor. @default "" */
  @property({ type: String }) value: string = "";
  
  connectedCallback() {
    super.connectedCallback();
    this.theme = document.documentElement.classList.contains("sl-theme-dark") ? "dark" : "light";
    this.observer.observe(document.documentElement, { 
      attributes: true, attributeFilter: ["class"]
    });
  }

  disconnectedCallback() {
    this.observer.disconnect();
    super.disconnectedCallback();
  }

  async firstUpdated(changedProperties: any) {
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
      const value = this.editor.getValue();
      this.dispatchEvent(new CustomEvent("change", { detail: value }));
    });
  }

  async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;

    if (changedProperties.has("value")
      && this.value !== this.editor.getValue()
      && !this.editor.hasWidgetFocus()) {
      this.editor.setValue(this.value);
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
      ${this.renderHeader()}
      <div class="editor">
        <main ${ref(this.container)}></main>
      </div>
    `;
  }

  private renderHeader() {
    if (this.noHeader) return nothing;
    return html`
      <div class="header">
        <slot name="header-preffix"></slot>
        <div class="title">${this.label}</div>
        <div class="flex"></div>
        <slot name="header-actions"></slot>
        <u-copy-button value=${this.value}></u-copy-button>
      </div>
    `;
  }
}