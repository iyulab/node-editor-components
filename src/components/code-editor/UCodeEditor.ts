import { html, unsafeCSS, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import * as monaco from "monaco-editor";
import "./UCodeEditor.worker.js";
import monacoStyles from "virtual:monaco-structure-css";

import { Theme } from "@iyulab/components/dist/utilities/Theme.js";
import { UFormControlElement } from "@iyulab/components/dist/components/UFormControlElement.js";
import { Locale } from "@iyulab/components/dist/utilities/Locale.js";
import { styles } from './UCodeEditor.styles.js';
import { editorLocale } from '../../locale.js';

/**
 * code editor component used by monaco-editor
 *
 * A form control: with a `name` it submits its text with the surrounding `<form>`, takes part in `u-form`'s model,
 * resets to its `value` attribute, follows `disabled` and an ancestor `<fieldset disabled>`, and with `required` is
 * invalid while empty.
 *
 * @event change - Fired when the user edits the text (not on programmatic `value` changes). Read `value` for the text.
 * @csspart footer - The validation message under the editing area, shown while `invalid`.
 */
@customElement("u-code-editor")
export class UCodeEditor extends UFormControlElement<string> {
  static styles = [ super.styles, unsafeCSS(monacoStyles), styles ];

  /** Specifies whether the header should be displayed or not. @default false */
  @property({ type: Boolean, reflect: true }) headless: boolean = false;
  /** The label as drawn in the header — `label` (from the form control base), or the locale string `codeEditor` ("Editor"). */
  private get displayLabel(): string {
    return this.label || editorLocale.text("codeEditor");
  }

  /** The editing area's name — `label`, else the host's `aria-label` (a wrapping `u-field` sets it), else the header. */
  private get accessibleName(): string {
    return this.resolvedAriaLabel || this.displayLabel;
  }

  /** 사용자가 고칠 수 있는가 — `readonly` 도 비활성(자기 `disabled` · 조상 fieldset)도 아닐 때. */
  private get editable(): boolean {
    return !this.readonly && !this.effectivelyDisabled;
  }
  /**
   * Do not attach the Tab hint. While editable, Tab indents and `Ctrl+M` (macOS `Ctrl+Shift+M`) switches it to moving
   * the focus; the editing area carries that as its accessible description, so a screen reader user hears the way
   * out when entering (WCAG 2.1.2). Set this when the page states the method itself. @default false
   */
  @property({ type: Boolean, attribute: "no-tab-hint" }) noTabHint: boolean = false;
  /** 편집기 테마. 문서 테마를 따라 자동으로 동기화된다(직접 지정해도 덮어쓰인다). */
  @property({ type: String }) theme: "light" | "dark" = "light"; 
  /** The programming language for syntax highlighting (e.g., "json", "javascript", "typescript"). @default "json" */
  @property({ type: String }) language: string = "json";
  /** The font size in pixels for the text in the editor. @default 14 */
  @property({ type: Number }) fontSize: number = 14;
  /** The current text content of the code editor. `readonly` and `label` come from the form control base. @default "" */
  @property({ type: String }) override value: string = "";
  
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
      readOnly: !this.editable,
      ariaLabel: this.accessibleName,
      value: this.value,
      // Updated options for newer Monaco
      scrollBeyondLastLine: false,
      scrollbar: {
        alwaysConsumeMouseWheel: false
      }
    });

    this.describeInput();
    this.syncFormValue();

    this.editor.onDidChangeModelContent(() => {
      if (this.syncingValue) return;
      this.value = this.editor!.getValue();
      if (this.invalid && !this.novalidate) this.validate();
      this.dispatchEvent(new Event("change", {
        bubbles: true,
        composed: true
       }));
    });
  }

  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("value")) this.syncFormValue();

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
    // 이름은 `label` 이나 로캘에서 온다 — 로캘 전환도 다시 그리므로 매 갱신에 맞춘다(같으면 건드리지 않는다).
    if (this.editor && this.editor.getOption(monaco.editor.EditorOption.ariaLabel) !== this.accessibleName) {
      this.editor.updateOptions({ ariaLabel: this.accessibleName });
    }
    // 편집 가능 = 읽기 전용도 비활성도 아님 — 조상 `<fieldset disabled>` 는 기반의 `formDisabled` 로 온다.
    if ((changedProperties.has("readonly") || changedProperties.has("disabled") || changedProperties.has("formDisabled")) && this.editor) {
      this.editor.updateOptions({ readOnly: !this.editable });
    }
    if (this.editor) this.describeInput();
  }

  /** 제출값은 `value`(원문) 그대로. */
  private syncFormValue() {
    this.internals?.setFormValue(this.value);
  }

  protected setValidity(): void {
    if (this.required && !this.value) {
      this.commit({ valueMissing: true }, Locale.getValue("valueMissing"), this.focusableInput ?? undefined);
    } else {
      this.commit({}, "");
    }
  }

  /** 이 편집기를 비우고 검증 상태를 지운다. 폼 초기화는 그 뒤 `value` 속성(기본값)을 다시 얹는다. */
  public reset(): void {
    this.value = "";
    this.invalid = false;
  }

  /** Monaco 가 포커스를 주는 노드 — EditContext 를 지원하면 `role="textbox"` `div`, 아니면 `textarea`. */
  private get focusableInput(): HTMLElement | null {
    return this.container.value?.querySelector<HTMLElement>('[role="textbox"], textarea') ?? null;
  }

  /**
   * The Tab hint as the editing area's description — only while editable: read-only, Monaco lets Tab leave the
   * editor, so there is nothing to explain. The focusable node is Monaco's own (an EditContext `div` with
   * `role="textbox"` where the browser supports it, a `textarea` elsewhere), so the description is set on it.
   */
  private describeInput() {
    const input = this.focusableInput;
    if (!input) return;
    const describedBy = [
      this.invalid && this.validationMessage ? "footer" : "",
      this.noTabHint || !this.editable ? "" : "tab-hint",
    ].filter(Boolean).join(" ");
    const set = (name: string, value: string | null) => {
      if (!value) input.removeAttribute(name);
      else if (input.getAttribute(name) !== value) input.setAttribute(name, value);
    };
    set("aria-describedby", describedBy);
    set("aria-required", this.required ? "true" : null);
    set("aria-invalid", this.invalid ? "true" : null);
  }
  
  render() {
    const message = this.invalid ? this.validationMessage : "";
    return html`
      <div class="header" ?hidden=${this.headless}>
        <div class="title">${this.displayLabel}</div>
        <div class="flex"></div>
        <slot name="header-actions"></slot>
      </div>
      <div class="editor">
        <main ${ref(this.container)}></main>
      </div>
      <span id="tab-hint" hidden>${editorLocale.text("tabFocusHint")}</span>
      <div id="footer" class="footer" part="footer" ?hidden=${!message}>${message}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "u-code-editor": UCodeEditor;
  }
}