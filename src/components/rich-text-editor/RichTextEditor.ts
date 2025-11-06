import { html, nothing } from "lit";
import { property } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import Quill from "quill";
import "quill/dist/quill.snow.css";

import { UElement } from "@iyulab/components/dist/internals/UElement.js";
import { styles } from './RichTextEditor.styles.js';

export class RichTextEditor extends UElement {
  static styles = [ styles ];
  static dependencies: Record<string, typeof UElement> = {};

  private container: Ref<HTMLElement> = createRef();
  private quill!: Quill;
  private observer: MutationObserver = new MutationObserver(() => {
    const theme = document.documentElement.classList.contains("theme") ? "dark" : "light";
    if (this.theme !== theme) this.theme = theme;
  });

  /** Specifies whether the header should be displayed or not. @default false */
  @property({ type: Boolean, reflect: true }) noHeader: boolean = false;
  /** The label text displayed in the header of the rich text editor. @default "Rich Text Editor" */
  @property({ type: String }) label: string = "Rich Text Editor";
  /** The visual theme of the editor. Can be "light" or "dark". @default "light" */
  @property({ type: String }) theme: "light" | "dark" = "light";   
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
  
  connectedCallback() {
    super.connectedCallback();
    this.theme = document.documentElement.classList.contains("sl-theme-dark") ? "dark" : "light";
    this.observer.observe(document.documentElement, { 
      attributes: true, attributeFilter: ["class"]
    });
  }

  disconnectedCallback() {
    if (this.quill) {
      this.quill = null as any;
    }
    this.observer.disconnect();
    super.disconnectedCallback();
  }

  async firstUpdated(changedProperties: any) {
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

    // Set initial content
    if (this.value) {
      this.quill.root.innerHTML = this.value;
    }

    // Listen for content changes
    this.quill.on('text-change', () => {
      const html = this.quill.root.innerHTML;
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

  async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;

    if (this.quill) {
      if (changedProperties.has("value") && this.value !== this.quill.root.innerHTML) {
        this.quill.root.innerHTML = this.value;
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

  render() {
    return html`
      ${this.renderHeader()}
      <div class="editor" style="height: ${this.height}px;">
        <div class="quill-container" ${ref(this.container)}></div>
      </div>
    `;
  }

  private renderHeader() {
    if (this.noHeader) return nothing;
    return html`
      <div class="header">
        <slot name="header-prefix"></slot>
        <div class="title">${this.label}</div>
        <div class="flex"></div>
        <slot name="header-actions"></slot>
        <sl-button size="small" variant="text" @click=${this.handleCopy}>
          <sl-icon name="copy"></sl-icon>
        </sl-button>
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
   * Set content from HTML
   */
  setHTML(html: string): void {
    if (this.quill) {
      this.quill.root.innerHTML = html;
    }
  }

  /**
   * Set content from Quill Delta
   */
  setDelta(delta: any): void {
    if (this.quill) {
      this.quill.setContents(delta);
    }
  }

  /**
   * Clear all content
   */
  clear(): void {
    if (this.quill) {
      this.quill.setText('');
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

  private handleCopy() {
    const html = this.getHTML();
    navigator.clipboard.writeText(html).then(() => {
      this.dispatchEvent(new CustomEvent('copy', { detail: html }));
    });
  }
}