import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Locale } from '@iyulab/components/dist/utilities/Locale.js';
import '../../src/components/code-editor/UCodeEditor.js';
import type { UCodeEditor } from '../../src/components/code-editor/UCodeEditor.js';
import { axActive } from './ax.js';

/**
 * What a screen reader gets on entering `u-code-editor` — read from Chromium's accessibility tree.
 *
 * - Name = the visible `label` (the editing area said "Editor content" whatever the header showed).
 * - While editable, Tab indents, and the way out (`Ctrl+M`) is the area's description (WCAG 2.1.2 allows a
 *   non-standard exit when the method is told). Read-only, Tab already leaves — no hint. `no-tab-hint` drops it.
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
afterEach(() => {
  document.body.replaceChildren();
  Locale.set('en');
});

async function enter(attrs = '', setup?: (el: UCodeEditor) => void) {
  document.body.innerHTML = `<button id="before">b</button><u-code-editor ${attrs} style="display:block;width:480px;height:200px"></u-code-editor>`;
  const el = document.querySelector('u-code-editor') as UCodeEditor;
  setup?.(el);
  await el.updateComplete;
  await sleep(800);
  (document.getElementById('before') as HTMLElement).focus();
  await userEvent.keyboard('{Tab}');
  await sleep(80);
  return { el, ax: await axActive() };
}

describe('u-code-editor — accessible name and Tab hint', () => {
  it('the label names the editing area; the hint describes the way out', async () => {
    const { ax } = await enter('label="Query"');
    expect(ax?.role).toBe('textbox');
    expect(ax?.name).toBe('Query');
    expect(ax?.description).toMatch(/Ctrl\+M/);
  });

  it('the hint follows the locale', async () => {
    Locale.set('ko');
    const { ax } = await enter('label="쿼리"');
    expect(ax?.description).toMatch(/들여쓰기.*Ctrl\+M/);
  });

  it('🔴without a label the name follows the locale — and a locale switch renames it', async () => {
    Locale.set('ko');
    const { el } = await enter();
    expect((await axActive())?.name).toBe('편집기');
    expect(el.shadowRoot!.querySelector('.title')?.textContent).toBe('편집기');
    Locale.set('en');
    await el.updateComplete;
    await sleep(50);
    expect((await axActive())?.name).toBe('Editor');
  });

  it('a label change renames it', async () => {
    const { el } = await enter('label="Query"');
    el.label = 'Filter';
    await el.updateComplete;
    await sleep(50);
    expect((await axActive())?.name).toBe('Filter');
  });

  it('NEGATIVE — read-only has no hint (Tab already leaves)', async () => {
    const { ax } = await enter('', (el) => { el.readOnly = true; });
    expect(ax?.description ?? '').not.toMatch(/Ctrl\+M/);
  });

  it('NEGATIVE — no-tab-hint drops it', async () => {
    const { ax } = await enter('no-tab-hint');
    expect(ax?.description ?? '').not.toMatch(/Ctrl\+M/);
  });

  it('turning read-only on after creation takes effect — and the hint goes with it', async () => {
    const { el } = await enter('label="Query"');
    el.readOnly = true;
    await el.updateComplete;
    await sleep(50);
    expect((await axActive())?.description ?? '').not.toMatch(/Ctrl\+M/);
    await userEvent.keyboard('x');
    await sleep(50);
    expect(el.value).toBe('');
  });
});
