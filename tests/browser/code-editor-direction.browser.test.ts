import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/code-editor/UCodeEditor.js';
import type { UCodeEditor } from '../../src/components/code-editor/UCodeEditor.js';

/**
 * Code reads left to right whatever the page's direction is. The editing engine lays its lines out for left-to-right text and
 * does not isolate itself, so under a right-to-left page the lines of `u-code-editor` were positioned far outside the view
 * and the punctuation at the end of a line moved (`foo(bar);`). The editing box is pinned to left to right.
 *
 * Oracle: the screen x of every character of every line, in source order, grows left to right and stands inside the editor.
 */
let host: HTMLDivElement;
afterEach(() => { host?.remove(); document.documentElement.dir = 'ltr'; });

async function lines(dir: 'ltr' | 'rtl') {
  document.documentElement.dir = dir;
  host = document.createElement('div');
  host.style.cssText = 'width:480px;height:200px';
  document.body.appendChild(host);
  host.innerHTML = '<u-code-editor language="javascript" style="width:480px;height:200px"></u-code-editor>';
  const el = host.firstElementChild as UCodeEditor & { value: string };
  await customElements.whenDefined('u-code-editor');
  await el.updateComplete;
  el.value = 'foo(bar);\nconst x = [1, 2];';
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 1200));
  const box = el.getBoundingClientRect();
  const out = [...el.shadowRoot!.querySelectorAll<HTMLElement>('.view-line')].map((line) => {
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    const xs: number[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node as Text;
      for (let i = 0; i < text.data.length; i++) {
        range.setStart(text, i);
        range.setEnd(text, i + 1);
        xs.push(range.getBoundingClientRect().left);
      }
    }
    return xs;
  });
  return { out, box };
}

describe('u-code-editor — code keeps its left-to-right order in a right-to-left page', () => {
  for (const dir of ['rtl', 'ltr'] as const) {
    it(`${dir}: every line draws left to right inside the editor`, async () => {
      const { out, box } = await lines(dir);
      expect(out.length).toBe(2);
      for (const xs of out) {
        expect(xs.length).toBeGreaterThan(0);
        expect(xs.every((x, i) => i === 0 || x > xs[i - 1])).toBe(true);
        expect(xs[0]).toBeGreaterThanOrEqual(box.left);
        expect(xs[xs.length - 1]).toBeLessThanOrEqual(box.right);
      }
    });
  }
});
