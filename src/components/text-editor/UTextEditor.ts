import { html, unsafeCSS, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import Quill from "quill";

/** Quill 의 Delta 타입. quill-delta 를 직접 의존하지 않고 Quill 시그니처에서 유도한다. */
type QuillDelta = ReturnType<Quill["getContents"]>;
type QuillDeltaInput = Parameters<Quill["setContents"]>[0];
import quillStyles from "quill/dist/quill.snow.css?inline";

import { UFormControlElement } from "@iyulab/components/dist/components/UFormControlElement.js";
import { Locale } from "@iyulab/components/dist/utilities/Locale.js";
import { editorLocale } from "../../locale.js";
import { styles } from './UTextEditor.styles.js';

/**
 * A rich text editor component built using Quill.js, providing a customizable and user-friendly interface for text editing. It supports various formatting options, themes, and can be configured to be read-only or editable.
 *
 * A form control: with a `name` it submits its HTML with the surrounding `<form>` (an empty editor submits `""`), takes
 * part in `u-form`'s model, resets to its `value` attribute, follows `disabled` and an ancestor `<fieldset disabled>`,
 * and with `required` is invalid while empty.
 *
 * @event change - Fired when the content of the editor changes. The event detail includes the current HTML, plain text, and Quill Delta representation of the content.
 * @csspart base - The editor box (border, rounded corners, background) — style it here, not on the host.
 * @csspart footer - The validation message under the editing area, shown while `invalid`.
 */
@customElement("u-text-editor")
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- typed event listeners (the DOM's own `HTMLMediaElementEventMap` pattern): the merged addEventListener/removeEventListener overloads are implemented by EventTarget
export class UTextEditor extends UFormControlElement<string> {
  static styles = [ super.styles, unsafeCSS(quillStyles), styles ];

  /** Specifies whether the header should be displayed or not. @default false */
  @property({ type: Boolean, reflect: true }) headless: boolean = false;
  /** The placeholder text shown when the editor is empty. @default "Start writing..." */
  @property({ type: String }) placeholder: string = "Start writing...";
  /**
   * The current HTML content of the rich text editor — `""` while the editor is empty (Quill itself shows an empty
   * paragraph then). The label (`label`, shown in the header and naming the editing area) and `readonly` come from the
   * form control base. @default ""
   */
  @property({ type: String }) override value: string = "";

  /** The label as drawn in the header — `label`, or the locale string. */
  private get displayLabel(): string {
    return this.label || editorLocale.text("richTextEditor");
  }

  /** The editing area's name — `label`, else the host's `aria-label` (a wrapping `u-field` sets it), else the header. */
  private get accessibleName(): string {
    return this.resolvedAriaLabel || this.displayLabel;
  }
  /**
   * 편집 영역의 **기본** 높이(px) — 호스트에 높이 제약이 없을 때의 값. 그때 호스트 상자는 여기에
   * 머리글이 더해진 크기다(`headless` 면 머리글 없음).
   *
   * **높이의 주인은 호스트 상자다**(형제 `u-code-editor` 와 같은 계약). 호스트에 CSS `height` /
   * `max-height` 를 주면 머리글은 그대로이고 편집 영역이 나머지를 채운다 — 부모를 채우려면
   * `height: 100%` 같은 CSS 로 넘기면 된다. Quill 의 떠 있는 UI(선택기 목록 · 링크 툴팁)는
   * 상자 밖으로 나가도 잘리지 않는다. 계약은 `tests/browser/text-editor-layout.browser.test.ts` 가 고정한다.
   *
   * @default 300
   */
  @property({ type: Number }) height: number = 300;
  /** Custom toolbar configuration. If not provided, uses default toolbar. */
  @property({ type: Array }) toolbar?: string[][];

  private container: Ref<HTMLElement> = createRef();
  private quill: Quill | null = null;

  disconnectedCallback() {
    if (this.quill) {
      this.quill = null;
    }
    super.disconnectedCallback();
  }

  protected async firstUpdated(changedProperties: PropertyValues) {
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
      readOnly: !this.editable,
      placeholder: this.placeholder,
      modules: {
        toolbar: this.toolbar || defaultToolbar,
        // Tab 은 편집기를 떠난다(SC 2.1.2 — README · 스킬 문서의 계약). Quill 의 Tab 바인딩 여섯(탭 문자 · 들여쓰기 · 코드 블록
        // 들여쓰기)은 그 키를 가져간다 — 처리기가 true 를 돌려주면 Quill 은 기본 동작을 막지 않는다. 들여쓰기는 도구 막대의 버튼으로.
        keyboard: {
          bindings: Object.fromEntries(
            ['tab', 'remove tab', 'indent', 'outdent', 'indent code-block', 'outdent code-block'].map((name) => [
              name,
              { key: 'Tab', shiftKey: null, handler: () => true },
            ]),
          ),
        },
      }
    });

    this.readSelectionThroughShadowRoot(this.quill);
    this.enhanceLinkTooltipKeyboard(this.quill);

    // Set initial content — innerHTML 직접 변이는 Quill MutationObserver가 source='user'로
    // 오인해 text-change를 발화시키므로, silent source의 setContents로 주입한다.
    if (this.value) {
      this.setQuillContents(this.value);
    }
    this.describeEditingArea();
    this.syncFormValue();

    // Listen for content changes — 사용자 편집(source='user')만 change로 노출한다.
    // 지역 참조를 캡처해, disconnect 후 this.quill 이 null 이 되어도 핸들러가
    // 안전하게 동작하도록 한다.
    const quill = this.quill;
    quill.on('text-change', (_delta, _oldDelta, source) => {
      if (source !== 'user') return;
      const html = quill.root.innerHTML;
      // 빈 편집기의 값은 `""` 다 — Quill 은 그때도 빈 단락(`<p><br></p>`)을 그린다. 제출값 · `required` 가 같은 정의를 쓴다.
      this.value = isBlank(quill) ? "" : html;
      if (this.invalid && !this.novalidate) this.validate();
      // 🔴전파를 명시한다 — 이 이벤트는 섀도 경계를 넘어야 소비자에게 닿는다.
      //   `composed: false`(기본값)면 리스너가 «에러 없이» 한 번도 불리지 않는다.
      this.dispatchEvent(new CustomEvent<UTextEditorEventMap["change"]["detail"]>("change", {
        detail: {
          html: this.value,
          text: quill.getText(),
          delta: quill.getContents()
        },
        bubbles: true,
        composed: true
      }));
    });
  }

  /**
   * Quill 은 선택을 `document.getSelection()` · `document.activeElement` 로 읽는다 — 섀도 루트 안의 편집 영역에서는 둘 다
   * 호스트로 재지정돼 «포커스 없음 · 선택 없음» 이 된다. 그래서 빈 편집기에 첫 글자가 들어와 빈 단락의 `<br>` 가 글자로 바뀔 때
   * Quill 이 커서를 되돌려 놓지 못해 커서가 맨 앞에 남았고, 이어 친 글자가 전부 앞에 붙었다(«hello» → «elloh»).
   * 이 인스턴스의 두 읽기를 섀도 루트 기준으로 바꾼다: 포커스는 루트의 `activeElement`, 선택은 표준 `getComposedRanges`
   * (지원하지 않는 엔진은 Chromium 의 `ShadowRoot.getSelection`)로 루트 안의 범위를 얻는다. 쓰기(`setNativeRange`)는 문서 선택에
   * 범위를 더하는 것이라 그대로 닿는다.
   */
  private readSelectionThroughShadowRoot(quill: Quill) {
    const root = quill.root.getRootNode();
    if (!(root instanceof ShadowRoot)) return;
    const selection = quill.selection as unknown as {
      hasFocus(): boolean;
      getNativeRange(): unknown;
      normalizeNative(range: Range): unknown;
    };
    selection.hasFocus = () => {
      const active = root.activeElement;
      return active === quill.root || (active != null && quill.root.contains(active));
    };
    selection.getNativeRange = () => {
      const range = rangeInShadowRoot(root);
      return range ? selection.normalizeNative(range) : null;
    };
  }

  /**
   * snow 테마의 링크 툴팁은 «Edit/Save» 와 «Remove» 를 `href` 없는 `<a>` 로 그린다 — 포커스를 받지 못하고 Enter 로 눌리지
   * 않아 키보드로는 링크를 편집·제거할 수 없었다(Quill 마크업이라 우리 템플릿 밖이다). Quill 이 붙인 클릭 처리는 그대로 두고,
   * 두 앵커를 버튼 역할·탭 정지로 드러내고 Enter/Space 를 클릭으로 옮긴다. 이름은 테마 시트의 생성 콘텐츠(`Edit`·`Remove`)다.
   */
  private enhanceLinkTooltipKeyboard(quill: Quill) {
    const root = (quill.theme as unknown as { tooltip?: { root?: HTMLElement } }).tooltip?.root;
    if (!root) return;
    const ACTIONS = 'a.ql-action, a.ql-remove';
    for (const a of Array.from(root.querySelectorAll<HTMLElement>(ACTIONS))) {
      a.setAttribute('role', 'button');
      a.setAttribute('tabindex', '0');
    }
    root.addEventListener('keydown', (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if ((e.key === 'Enter' || e.key === ' ') && target.matches(ACTIONS)) {
        e.preventDefault();
        target.click();
      }
    });
  }

  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    await this.updateComplete;

    if (changedProperties.has("value")) this.syncFormValue();
    if (this.quill) {
      if (changedProperties.has("value") && this.value !== this.shownHTML()) {
        this.setQuillContents(this.value);
      }
      // 편집 가능 = 읽기 전용도 비활성도 아님 — 조상 `<fieldset disabled>` 는 기반의 `formDisabled` 로 온다.
      if (changedProperties.has("readonly") || changedProperties.has("disabled") || changedProperties.has("formDisabled")) {
        this.quill.enable(this.editable);
      }
      if (changedProperties.has("placeholder")) {
        this.quill.root.dataset.placeholder = this.placeholder;
      }
      this.describeEditingArea();
    }
  }

  /** 사용자가 고칠 수 있는가 — `readonly` 도 비활성(자기 `disabled` · 조상 fieldset)도 아닐 때. */
  private get editable(): boolean {
    return !this.readonly && !this.effectivelyDisabled;
  }

  /** Quill 이 지금 보이는 내용을 `value` 와 같은 정의로 — 비었으면 `""`. */
  private shownHTML(): string {
    return !this.quill || isBlank(this.quill) ? "" : this.quill.root.innerHTML;
  }

  /** 제출값은 `value` 그대로(빈 편집기는 `""`). */
  private syncFormValue() {
    this.internals?.setFormValue(this.value);
  }

  /**
   * 편집 영역(Quill 의 `contenteditable`)이 스스로를 말하게 한다 — 이름 · 여러 줄 입력 · 필수 · 무효 · 오류 문구. Quill 의 마크업이라
   * 우리 템플릿 밖이고, 오류 문구는 같은 섀도 루트의 `footer` 라 `aria-describedby` 로 닿는다.
   */
  private describeEditingArea() {
    const area = this.quill?.root;
    if (!area) return;
    const set = (name: string, value: string | null) => {
      if (value === null) area.removeAttribute(name);
      else if (area.getAttribute(name) !== value) area.setAttribute(name, value);
    };
    set("role", "textbox");
    set("aria-multiline", "true");
    set("aria-label", this.accessibleName);
    set("aria-required", this.required ? "true" : null);
    set("aria-invalid", this.invalid ? "true" : null);
    set("aria-describedby", this.invalid && this.validationMessage ? "footer" : null);
  }

  protected setValidity(): void {
    if (this.required && !this.value) {
      this.commit({ valueMissing: true }, Locale.getValue("valueMissing"), this.quill?.root);
    } else {
      this.commit({}, "");
    }
  }

  /** 이 편집기를 비우고 검증 상태를 지운다. 폼 초기화는 그 뒤 `value` 속성(기본값)을 다시 얹는다. */
  public reset(): void {
    this.value = "";
    this.invalid = false;
  }

  /** HTML을 Quill Delta로 변환해 silent source로 주입한다 — 프로그램적 콘텐츠 세팅이
   *  text-change(→ change 이벤트)로 위장되지 않도록 하기 위함. */
  private setQuillContents(htmlValue: string) {
    if (!this.quill) return;
    const delta = this.quill.clipboard.convert({ html: htmlValue });
    this.quill.setContents(delta, Quill.sources.SILENT);
  }

  render() {
    const message = this.invalid ? this.validationMessage : "";
    return html`<div class="base" part="base">
      <div class="header" ?hidden=${this.headless}>
        <div class="title">${this.displayLabel}</div>
        <div class="flex"></div>
        <slot name="header-actions"></slot>
      </div>
      <div class="editor" style="height: ${this.height}px;">
        <div class="quill-container" ${ref(this.container)}></div>
      </div>
      <div id="footer" class="footer" part="footer" ?hidden=${!message}>${message}</div>
    </div>`;
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
  getDelta(): QuillDelta | null {
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
  setDelta(delta: QuillDeltaInput): void {
    if (this.quill) {
      this.quill.setContents(delta, Quill.sources.SILENT);
      this.value = this.shownHTML();
    }
  }

  /**
   * Clear all content.
   * 프로그램적 세팅이므로 change 이벤트는 발화하지 않는다.
   */
  clear(): void {
    if (this.quill) {
      this.quill.setText('', Quill.sources.SILENT);
      this.value = "";
    }
  }

  /**
   * Focus the editor
   */
  override focus(): void {
    if (this.quill) {
      this.quill.focus();
    }
  }
}

/** 빈 편집기 — 문서가 끝의 줄바꿈 하나뿐(그림 같은 삽입물은 길이 1 을 차지한다). 공백만 친 것은 내용이다. */
function isBlank(quill: Quill): boolean {
  return quill.getLength() <= 1;
}

/** The live selection's range inside `root`, as a `Range` (Quill reads `startContainer` · `collapsed` from it). */
function rangeInShadowRoot(root: ShadowRoot): Range | null {
  const selection = document.getSelection();
  if (selection && 'getComposedRanges' in selection) {
    const [composed] = (selection as Selection & {
      getComposedRanges(options: { shadowRoots: ShadowRoot[] }): StaticRange[];
    }).getComposedRanges({ shadowRoots: [root] });
    if (!composed || !root.contains(composed.startContainer)) return null;
    const range = document.createRange();
    range.setStart(composed.startContainer, composed.startOffset);
    range.setEnd(composed.endContainer, composed.endOffset);
    return range;
  }
  const own = (root as ShadowRoot & { getSelection?(): Selection | null }).getSelection?.();
  return own && own.rangeCount > 0 ? own.getRangeAt(0) : null;
}

/** Events `<u-text-editor>` dispatches — bubbling and composed. `change` is a CustomEvent here, not the native one. */
export interface UTextEditorEventMap {
  /** The user edited the text (not programmatic `value` changes). `delta` is Quill's document model. */
  'change': CustomEvent<{ html: string; text: string; delta: ReturnType<Quill['getContents']> }>;
}

/** Typed listeners for {@link UTextEditorEventMap} — element-scoped, the DOM's own pattern (`HTMLMediaElementEventMap`). */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- typed event listeners (the DOM's own `HTMLMediaElementEventMap` pattern): the merged addEventListener/removeEventListener overloads are implemented by EventTarget
export interface UTextEditor {
  addEventListener<K extends keyof UTextEditorEventMap>(type: K, listener: (this: UTextEditor, ev: UTextEditorEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: UTextEditor, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof UTextEditorEventMap>(type: K, listener: (this: UTextEditor, ev: UTextEditorEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: UTextEditor, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare global {
  interface HTMLElementTagNameMap {
    "u-text-editor": UTextEditor;
  }
}