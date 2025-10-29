import { LitElement as u, unsafeCSS as m, html as d, nothing as c } from "lit";
import { property as t } from "lit/decorators.js";
import { createRef as p, ref as v } from "lit/directives/ref.js";
import * as h from "monaco-editor";
import f from "../../node_modules/monaco-editor/min/vs/editor/editor.main.css.js";
import "./CodeEditor.worker.js";
import { styles as g } from "./CodeEditor.styles.js";
var y = Object.defineProperty, i = (r, e, o, b) => {
  for (var a = void 0, n = r.length - 1, l; n >= 0; n--)
    (l = r[n]) && (a = l(e, o, a) || a);
  return a && y(e, o, a), a;
};
class s extends u {
  constructor() {
    super(...arguments), this.container = p(), this.observer = new MutationObserver(() => {
      const e = document.documentElement.classList.contains("sl-theme-dark") ? "dark" : "light";
      this.theme !== e && (this.theme = e);
    }), this.noHeader = !1, this.label = "Editor", this.theme = "light", this.readOnly = !1, this.language = "json", this.fontSize = 14, this.value = "";
  }
  static {
    this.styles = [m(f), g];
  }
  connectedCallback() {
    super.connectedCallback(), this.theme = document.documentElement.classList.contains("sl-theme-dark") ? "dark" : "light", this.observer.observe(document.documentElement, {
      attributes: !0,
      attributeFilter: ["class"]
    });
  }
  disconnectedCallback() {
    this.observer.disconnect(), super.disconnectedCallback();
  }
  async firstUpdated(e) {
    super.firstUpdated(e), await this.updateComplete, this.editor = h.editor.create(this.container.value, {
      language: this.language,
      theme: this.theme === "light" ? "vs-light" : "vs-dark",
      fontSize: this.fontSize,
      automaticLayout: !0,
      minimap: { enabled: !1 },
      lineNumbersMinChars: 2,
      lineDecorationsWidth: 1,
      readOnly: this.readOnly,
      value: this.value,
      // Updated options for newer Monaco
      scrollBeyondLastLine: !1,
      scrollbar: {
        alwaysConsumeMouseWheel: !1
      }
    }), this.editor.onDidChangeModelContent(() => {
      const o = this.editor.getValue();
      this.dispatchEvent(new CustomEvent("change", { detail: o }));
    });
  }
  async updated(e) {
    super.updated(e), await this.updateComplete, e.has("value") && this.value !== this.editor.getValue() && !this.editor.hasWidgetFocus() && this.editor.setValue(this.value), e.has("theme") && this.editor && this.editor.updateOptions({
      theme: this.theme === "light" ? "vs-light" : "vs-dark"
    }), e.has("language") && this.editor && h.editor.setModelLanguage(this.editor.getModel(), this.language);
  }
  render() {
    return d`
      ${this.renderHeader()}
      <div class="editor">
        <main ${v(this.container)}></main>
      </div>
    `;
  }
  renderHeader() {
    return this.noHeader ? c : d`
      <div class="header">
        <slot name="header-preffix"></slot>
        <div class="title">${this.label}</div>
        <div class="flex"></div>
        <slot name="header-actions"></slot>
        <sl-copy-button value=${this.value}></sl-copy-button>
      </div>
    `;
  }
}
i([
  t({ type: Boolean, reflect: !0 })
], s.prototype, "noHeader");
i([
  t({ type: String })
], s.prototype, "label");
i([
  t({ type: String })
], s.prototype, "theme");
i([
  t({ type: Boolean })
], s.prototype, "readOnly");
i([
  t({ type: String })
], s.prototype, "language");
i([
  t({ type: Number })
], s.prototype, "fontSize");
i([
  t({ type: String })
], s.prototype, "value");
export {
  s as CodeEditor
};
