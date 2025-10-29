import { LitElement as u, html as d, nothing as c } from "lit";
import { property as e } from "lit/decorators.js";
import { createRef as p, ref as m } from "lit/directives/ref.js";
import f from "quill";
/* empty css                                           */
import { styles as y } from "./RichTextEditor.styles.js";
var v = Object.defineProperty, i = (o, t, r, n) => {
  for (var s = void 0, a = o.length - 1, h; a >= 0; a--)
    (h = o[a]) && (s = h(t, r, s) || s);
  return s && v(t, r, s), s;
};
class l extends u {
  constructor() {
    super(...arguments), this.container = p(), this.observer = new MutationObserver(() => {
      const t = document.documentElement.classList.contains("sl-theme-dark") ? "dark" : "light";
      this.theme !== t && (this.theme = t);
    }), this.noHeader = !1, this.label = "Rich Text Editor", this.theme = "light", this.readOnly = !1, this.placeholder = "Start writing...", this.value = "", this.height = 300;
  }
  static {
    this.styles = [y];
  }
  connectedCallback() {
    super.connectedCallback(), this.theme = document.documentElement.classList.contains("sl-theme-dark") ? "dark" : "light", this.observer.observe(document.documentElement, {
      attributes: !0,
      attributeFilter: ["class"]
    });
  }
  disconnectedCallback() {
    this.quill && (this.quill = null), this.observer.disconnect(), super.disconnectedCallback();
  }
  async firstUpdated(t) {
    super.firstUpdated(t), await this.updateComplete;
    const r = [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", !1, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, !1] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
      ["link", "image"]
    ];
    this.quill = new f(this.container.value, {
      theme: "snow",
      readOnly: this.readOnly,
      placeholder: this.placeholder,
      modules: {
        toolbar: this.toolbar || r
      }
    }), this.value && (this.quill.root.innerHTML = this.value), this.quill.on("text-change", () => {
      const n = this.quill.root.innerHTML;
      this.dispatchEvent(new CustomEvent("change", {
        detail: {
          html: n,
          text: this.quill.getText(),
          delta: this.quill.getContents()
        }
      }));
    }), this.updateEditorHeight();
  }
  async updated(t) {
    super.updated(t), await this.updateComplete, this.quill && (t.has("value") && this.value !== this.quill.root.innerHTML && (this.quill.root.innerHTML = this.value), t.has("readOnly") && this.quill.enable(!this.readOnly), t.has("placeholder") && (this.quill.root.dataset.placeholder = this.placeholder), t.has("height") && this.updateEditorHeight());
  }
  updateEditorHeight() {
    if (this.quill) {
      const t = this.shadowRoot?.querySelector(".ql-editor");
      t && (t.style.height = `${this.height - 42}px`);
    }
  }
  /**
   * Get the current content as HTML
   */
  getHTML() {
    return this.quill ? this.quill.root.innerHTML : "";
  }
  /**
   * Get the current content as plain text
   */
  getText() {
    return this.quill ? this.quill.getText() : "";
  }
  /**
   * Get the current content as Quill Delta
   */
  getDelta() {
    return this.quill ? this.quill.getContents() : null;
  }
  /**
   * Set content from HTML
   */
  setHTML(t) {
    this.quill && (this.quill.root.innerHTML = t);
  }
  /**
   * Set content from Quill Delta
   */
  setDelta(t) {
    this.quill && this.quill.setContents(t);
  }
  /**
   * Clear all content
   */
  clear() {
    this.quill && this.quill.setText("");
  }
  /**
   * Focus the editor
   */
  focus() {
    this.quill && this.quill.focus();
  }
  render() {
    return d`
      ${this.renderHeader()}
      <div class="editor" style="height: ${this.height}px;">
        <div class="quill-container" ${m(this.container)}></div>
      </div>
    `;
  }
  renderHeader() {
    return this.noHeader ? c : d`
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
  handleCopy() {
    const t = this.getHTML();
    navigator.clipboard.writeText(t).then(() => {
      this.dispatchEvent(new CustomEvent("copy", { detail: t }));
    });
  }
}
i([
  e({ type: Boolean, reflect: !0 })
], l.prototype, "noHeader");
i([
  e({ type: String })
], l.prototype, "label");
i([
  e({ type: String })
], l.prototype, "theme");
i([
  e({ type: Boolean })
], l.prototype, "readOnly");
i([
  e({ type: String })
], l.prototype, "placeholder");
i([
  e({ type: String })
], l.prototype, "value");
i([
  e({ type: Number })
], l.prototype, "height");
i([
  e({ type: Array })
], l.prototype, "toolbar");
export {
  l as RichTextEditor
};
