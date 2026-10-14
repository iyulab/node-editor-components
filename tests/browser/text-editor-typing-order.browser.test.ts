import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/text-editor/UTextEditor.js';

/**
 * Typing into `u-text-editor` keeps the order of what was typed. The editor mirrors Quill's HTML into `value`, and a
 * `value` change is pushed back into Quill when it differs from what Quill shows. Right after the first character in an
 * empty editor the two differed once, so the editor's own update was written back with `setContents` — which moves the
 * caret to the start. Every later character landed in front: «hello» became «elloh».
 */
type Editor = HTMLElement & { value: string; updateComplete: Promise<unknown> };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function mount(value?: string): Promise<{ el: Editor; area: HTMLElement }> {
  document.body.innerHTML = '<u-text-editor style="height:200px"></u-text-editor>';
  const el = document.querySelector('u-text-editor') as unknown as Editor;
  if (value !== undefined) el.value = value;
  await el.updateComplete;
  await sleep(200);
  const area = el.shadowRoot!.querySelector('.ql-editor') as HTMLElement;
  return { el, area };
}

async function typeEach(text: string) {
  for (const ch of text) {
    await userEvent.keyboard(ch);
    await sleep(30);
  }
  await sleep(100);
}

describe('u-text-editor — typed characters stay in the order they were typed', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('an empty editor', async () => {
    const { el, area } = await mount();
    await userEvent.click(area);
    await typeEach('hello');
    expect(el.value).toBe('<p>hello</p>');
  });

  it('an empty editor with a change listener', async () => {
    const { el, area } = await mount();
    const changes: string[] = [];
    el.addEventListener('change', (e) => changes.push((e as CustomEvent<{ html: string }>).detail.html));
    await userEvent.click(area);
    await typeEach('xyz');
    expect(el.value).toBe('<p>xyz</p>');
    expect(changes.at(-1)).toBe('<p>xyz</p>');
  });

  it('an editor that starts with content (control)', async () => {
    const { el, area } = await mount('<p>Hi</p>');
    await userEvent.click(area);
    await userEvent.keyboard('{End}');
    await typeEach('abc');
    expect(el.value).toBe('<p>Hiabc</p>');
  });

  it('bold typed after the toolbar button applies to what is typed next', async () => {
    const { el, area } = await mount();
    await userEvent.click(area);
    await typeEach('ab');
    await userEvent.click(el.shadowRoot!.querySelector('button.ql-bold') as HTMLElement);
    await typeEach('cd');
    expect(el.value).toBe('<p>ab<strong>cd</strong></p>');
  });

  it('a value set from outside still replaces the content', async () => {
    const { el, area } = await mount();
    await userEvent.click(area);
    await typeEach('draft');
    el.value = '<p>Replaced</p>';
    await el.updateComplete;
    await sleep(50);
    expect(area.innerHTML).toBe('<p>Replaced</p>');
  });
});
