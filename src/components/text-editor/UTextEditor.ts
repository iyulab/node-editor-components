import { html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import Quill from "quill";
import quillStyles from "quill/dist/quill.snow.css?inline";

import { Theme } from "@iyulab/components/dist/utilities/Theme.js";
import { UElement } from "@iyulab/components/dist/components/UElement.js";
import { styles } from './UTextEditor.styles.js';

/**
 * A rich text editor component built using Quill.js, providing a customizable and user-friendly interface for text editing. It supports various formatting options, themes, and can be configured to be read-only or editable.
 * 
 * @event change - Fired when the content of the editor changes. The event detail includes the current HTML, plain text, and Quill Delta representation of the content.
 */
@customElement("u-text-editor")
export class UTextEditor extends UElement {
  static styles = [ super.styles, unsafeCSS(quillStyles), styles ];

  /** Specifies whether the header should be displayed or not. @default false */
  @property({ type: Boolean, reflect: true }) headless: boolean = false;
  /** The label text displayed in the header of the rich text editor. @default "Rich Text Editor" */
  @property({ type: String }) label: string = "Rich Text Editor";
  /** The visual theme of the editor. Can be "light" or "dark". @default "light" */
  @property({ type: String }) theme?: "light" | "dark" | "system" = "light";   
  /** Whether the editor should be in read-only mode, preventing user input. @default false */
  @property({ type: Boolean }) readOnly: boolean = false;
  /** The placeholder text shown when the editor is empty. @default "Start writing..." */
  @property({ type: String }) placeholder: string = "Start writing...";  
  /** The current HTML content of the rich text editor. @default "" */
  @property({ type: String }) value: string = "";
  /** The height of the editor in pixels. @default 300 */
  @property({ type: Number }) height: number = 300;
  /** Custom toolbar configuration. If not provided, uses default toolbar. */
  @property({ type: Array }) toolbar?: string[][];

  private container: Ref<HTMLElement> = createRef();
  private quill!: Quill;
  private observer: MutationObserver = new MutationObserver(() => {
    const theme = Theme.get();
    if (this.theme !== theme) this.theme = theme;
  });
  
  connectedCallback() {
    super.connectedCallback();
    this.theme = Theme.get();
    this.observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ["data-theme"]
    });
  }

  disconnectedCallback() {
    if (this.quill) {
      this.quill = null as any;
    }
    this.observer.disconnect();
    super.disconnectedCallback();
  }

  protected async firstUpdated(changedProperties: any) {
    super.firstUpdated(changedProperties);
    await this.updateComplete;
    
    // Default toolbar configuration
    const defaultToolbar = [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ];

    this.quill = new Quill(this.container.value!, {
      theme: 'snow',
      readOnly: this.readOnly,
      placeholder: this.placeholder,
      modules: {
        toolbar: this.toolbar || defaultToolbar
      }
    });

    // Set initial content — innerHTML 직접 변이는 Quill MutationObserver가 source='user'로
    // 오인해 text-change를 발화시키므로, silent source의 setContents로 주입한다.
    if (this.value) {
      this.setQuillContents(this.value);
    }

    // Listen for content changes — 사용자 편집(source='user')만 change로 노출한다.
    this.quill.on('text-change', (_delta, _oldDelta, source) => {
      if (source !== 'user') return;
      const html = this.quill.root.innerHTML;
      this.value = html;
      this.dispatchEvent(new CustomEvent("change", {
        detail: {
          html: html,
          text: this.quill.getText(),
          delta: this.quill.getContents()
        }
      }));
    });

    // Apply height
    this.updateEditorHeight();
  }

  protected async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;

    if (this.quill) {
      if (changedProperties.has("value") && this.value !== this.quill.root.innerHTML) {
        this.setQuillContents(this.value);
      }
      
      if (changedProperties.has("readOnly")) {
        this.quill.enable(!this.readOnly);
      }
      
      if (changedProperties.has("placeholder")) {
        this.quill.root.dataset.placeholder = this.placeholder;
      }

      if (changedProperties.has("height")) {
        this.updateEditorHeight();
      }
    }
  }

  /** HTML을 Quill Delta로 변환해 silent source로 주입한다 — 프로그램적 콘텐츠 세팅이
   *  text-change(→ change 이벤트)로 위장되지 않도록 하기 위함. */
  private setQuillContents(htmlValue: string) {
    const delta = this.quill.clipboard.convert({ html: htmlValue });
    this.quill.setContents(delta, Quill.sources.SILENT);
  }

  render() {
    return html`
      <div class="header" ?hidden=${this.headless}>
        <div class="title">${this.label}</div>
        <div class="flex"></div>
        <slot name="header-actions"></slot>
      </div>
      <div class="editor" style="height: ${this.height}px;">
        <div class="quill-container" ${ref(this.container)}></div>
      </div>
    `;
  }

  private updateEditorHeight() {
    if (this.quill) {
      const editorElement = this.shadowRoot?.querySelector('.ql-editor') as HTMLElement;
      if (editorElement) {
        editorElement.style.height = `${this.height - 42}px`; // 42px for toolbar height
      }
    }
  }

  /**
   * Get the current content as HTML
   */
  getHTML(): string {
    return this.quill ? this.quill.root.innerHTML : '';
  }

  /**
   * Get the current content as plain text
   */
  getText(): string {
    return this.quill ? this.quill.getText() : '';
  }

  /**
   * Get the current content as Quill Delta
   */
  getDelta(): any {
    return this.quill ? this.quill.getContents() : null;
  }

  /**
   * Set content from HTML.
   * 프로그램적 세팅이므로 change 이벤트는 발화하지 않는다 (value 프로퍼티 경로와 동일).
   */
  setHTML(html: string): void {
    this.value = html;
  }

  /**
   * Set content from Quill Delta.
   * 프로그램적 세팅이므로 change 이벤트는 발화하지 않는다.
   */
  setDelta(delta: any): void {
    if (this.quill) {
      this.quill.setContents(delta, Quill.sources.SILENT);
      this.value = this.quill.root.innerHTML;
    }
  }

  /**
   * Clear all content.
   * 프로그램적 세팅이므로 change 이벤트는 발화하지 않는다.
   */
  clear(): void {
    if (this.quill) {
      this.quill.setText('', Quill.sources.SILENT);
      this.value = this.quill.root.innerHTML;
    }
  }

  /**
   * Focus the editor
   */
  focus(): void {
    if (this.quill) {
      this.quill.focus();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "u-text-editor": UTextEditor;
  }
}