import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '@iyulab/components/dist/components/form/UForm.js';
import '../../src/components/text-editor/UTextEditor.js';
import '../../src/components/code-editor/UCodeEditor.js';

/**
 * Both editors are form controls, like the native `<textarea>` they stand in for: a `name` puts the content in the
 * `<form>`'s data, `form.reset()` returns to the `value` attribute, an ancestor `<fieldset disabled>` stops editing,
 * `required` makes an empty editor invalid (and a submit attempt shows why), and `u-form` reads them into its model.
 */
type Control = HTMLElement & {
  value: string;
  required: boolean;
  invalid: boolean;
  readonly: boolean;
  validationMessage: string;
  updateComplete: Promise<unknown>;
  validate(report?: boolean): boolean;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
afterEach(() => document.body.replaceChildren());

const EDITORS = [
  {
    tag: 'u-text-editor',
    area: (el: Control) => el.shadowRoot!.querySelector<HTMLElement>('.ql-editor')!,
    target: (el: Control) => el.shadowRoot!.querySelector<HTMLElement>('.ql-editor')!,
    ready: 300,
    typed: '<p>hello</p>',
    initial: '<p>start</p>',
  },
  {
    tag: 'u-code-editor',
    area: (el: Control) => el.shadowRoot!.querySelector<HTMLElement>('[role="textbox"], textarea')!,
    // Monaco's focus node is a hidden-size input that takes no clicks — focus it, as the keyboard tests do.
    target: null,
    ready: 800,
    typed: 'hello',
    initial: 'start',
  },
] as const;

async function mount(markup: string, ready: number) {
  document.body.innerHTML = markup;
  const el = document.body.querySelector('u-text-editor, u-code-editor') as Control;
  await el.updateComplete;
  await sleep(ready);
  return el;
}

/** Clicks into the editing area and types — real keys, so the editor's own change path runs. */
async function type(el: Control, target: ((el: Control) => HTMLElement) | null, text: string) {
  if (target) await userEvent.click(target(el));
  else (el.shadowRoot!.querySelector<HTMLElement>('[role="textbox"], textarea')!).focus();
  await userEvent.keyboard(text);
  await sleep(100);
}

for (const e of EDITORS) {
  const style = 'style="display:block;width:480px;height:240px"';

  describe(`${e.tag} — a form control`, () => {
    it('a named editor submits its content with the form; empty submits ""', async () => {
      const el = await mount(`<form><${e.tag} name="body" ${style}></${e.tag}></form>`, e.ready);
      const form = document.querySelector('form')!;
      expect(new FormData(form).get('body')).toBe('');
      await type(el, e.target, 'hello');
      expect(el.value).toBe(e.typed);
      expect(new FormData(form).get('body')).toBe(e.typed);
    });

    it('form.reset() returns to the value attribute', async () => {
      const el = await mount(`<form><${e.tag} name="body" value="${e.initial}" ${style}></${e.tag}></form>`, e.ready);
      await type(el, e.target, 'x');
      expect(el.value).not.toBe(e.initial);
      document.querySelector('form')!.reset();
      await el.updateComplete;
      await sleep(50);
      expect(el.value).toBe(e.initial);
      expect(new FormData(document.querySelector('form')!).get('body')).toBe(e.initial);
    });

    it('an ancestor <fieldset disabled> stops editing, and enabling it again restores it', async () => {
      const el = await mount(`<form><fieldset disabled><${e.tag} name="body" ${style}></${e.tag}></fieldset></form>`, e.ready);
      expect(el.matches(':disabled')).toBe(true);
      // A disabled control takes no clicks — put the focus there directly and type.
      e.area(el).focus();
      await userEvent.keyboard('x');
      await sleep(100);
      expect(el.value).toBe('');
      document.querySelector('fieldset')!.disabled = false;
      await el.updateComplete;
      await sleep(50);
      await type(el, e.target, 'hello');
      expect(el.value).toBe(e.typed);
    });

    it('required: an empty editor is invalid, a submit attempt shows the message, typing clears it', async () => {
      const el = await mount(`<form><${e.tag} name="body" required ${style}></${e.tag}></form>`, e.ready);
      const form = document.querySelector('form')!;
      form.addEventListener('submit', (ev) => ev.preventDefault());
      expect(form.checkValidity()).toBe(false);
      form.requestSubmit();
      await el.updateComplete;
      await sleep(50);
      expect(el.invalid).toBe(true);
      const footer = el.shadowRoot!.querySelector<HTMLElement>('[part="footer"]')!;
      expect(footer.hidden).toBe(false);
      expect(footer.textContent).toBe(el.validationMessage);
      expect(e.area(el).getAttribute('aria-invalid')).toBe('true');
      await type(el, e.target, 'hello');
      await el.updateComplete;
      await sleep(50);
      expect(el.invalid).toBe(false);
      expect(footer.hidden).toBe(true);
      expect(form.checkValidity()).toBe(true);
    });

    it('u-form reads it into the model on change', async () => {
      const el = await mount(`<u-form><${e.tag} name="body" ${style}></${e.tag}></u-form>`, e.ready);
      const uform = document.querySelector('u-form') as HTMLElement & { model: Record<string, unknown>; validate(): boolean };
      uform.model = { body: '' };
      await sleep(50);
      el.required = true;
      expect(uform.validate()).toBe(false);
      await type(el, e.target, 'hello');
      expect(uform.model.body).toBe(e.typed);
      expect(uform.validate()).toBe(true);
    });

    it('readonly keeps the content selectable — the host does not swallow the pointer', async () => {
      const el = await mount(`<${e.tag} readonly value="${e.initial}" ${style}></${e.tag}>`, e.ready);
      expect(getComputedStyle(el).pointerEvents).toBe('auto');
      await type(el, e.target, 'x');
      expect(el.value).toBe(e.initial);
    });
  });
}
