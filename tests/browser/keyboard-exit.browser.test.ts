import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/text-editor/UTextEditor.js';
import '../../src/components/code-editor/UCodeEditor.js';

/**
 * SC 2.1.2 No Keyboard Trap — the keyboard can leave both editors, pressed with real keys.
 *
 * - `u-text-editor`: Tab leaves the editor (it does not insert a tab character).
 * - `u-code-editor`: Tab indents — a code editor needs it — and `Ctrl+M` (Monaco's tab-focus mode) makes Tab move the
 *   focus instead. SC 2.1.2 allows a non-standard exit when the user is told the method; the README and the skill
 *   reference say it, and this file keeps the method itself working.
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
afterEach(() => document.body.replaceChildren());

const around = (inner: string) => {
  document.body.innerHTML = `<button id="before">before</button>${inner}<button id="after">after</button>`;
};
const active = () => document.activeElement as HTMLElement | null;

describe('u-text-editor — keyboard exit', () => {
  it('Tab from inside the editor moves on to the next control', async () => {
    around('<u-text-editor></u-text-editor>');
    const el = document.querySelector('u-text-editor') as HTMLElement & { updateComplete: Promise<unknown> };
    await el.updateComplete;
    await sleep(300);
    await userEvent.click(el.shadowRoot!.querySelector<HTMLElement>('.ql-editor')!);
    await userEvent.keyboard('abc');
    expect(active()).toBe(el);
    await userEvent.keyboard('{Tab}');
    await sleep(50);
    expect(active()?.id).toBe('after');
  });
});

describe('u-code-editor — keyboard exit', () => {
  async function mountCode() {
    around('<u-code-editor style="display:block;width:480px;height:200px"></u-code-editor>');
    const el = document.querySelector('u-code-editor') as HTMLElement & { updateComplete: Promise<unknown> };
    await customElements.whenDefined('u-code-editor');
    await el.updateComplete;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await sleep(800);
    (document.getElementById('before') as HTMLElement).focus();
    await userEvent.keyboard('{Tab}');
    await sleep(80);
    return el;
  }

  it('Tab enters the editor; inside, Tab indents and keeps the focus', async () => {
    const el = await mountCode();
    expect(active()).toBe(el);
    await userEvent.keyboard('abc{Tab}');
    await sleep(80);
    expect(active(), 'Tab is indentation inside a code editor').toBe(el);
  });

  it('Ctrl+M switches Tab to moving the focus — the documented way out', async () => {
    const el = await mountCode();
    expect(active()).toBe(el);
    await userEvent.keyboard('{Control>}m{/Control}');
    await sleep(80);
    await userEvent.keyboard('{Tab}');
    await sleep(80);
    expect(active()?.id).toBe('after');
  });
});
