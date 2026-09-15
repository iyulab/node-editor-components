import { describe, it, expect } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/text-editor/UTextEditor.js';

/**
 * 링크 툴팁의 «Edit»·«Remove» 는 Quill 이 `href` 없는 `<a>` 로 그려 **포커스를 받지 못했다** — 키보드로는 링크를 편집·제거할
 * 수 없었다(타깃 크기 게이트의 포인터 고아 검사가 지목). 버튼 역할·탭 정지를 주고 Enter/Space 를 클릭으로 옮긴 것을
 * 트러스티드 키 입력으로 잰다.
 */

type Editor = HTMLElement & {
  updateComplete: Promise<unknown>;
  quill: { setSelection: (i: number, l: number, s: string) => void; getSemanticHTML: () => string; root: HTMLElement };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function openTooltip(): Promise<{ el: Editor; tip: HTMLElement }> {
  document.body.innerHTML =
    '<div style="padding:20px"><u-text-editor style="width:480px" height="220" value="<p><a href=&quot;https://example.com&quot;>link</a> text</p>"></u-text-editor></div>';
  const el = document.querySelector('u-text-editor') as unknown as Editor;
  await el.updateComplete;
  await sleep(300);
  el.quill.setSelection(2, 0, 'user');
  const tip = el.shadowRoot!.querySelector('.ql-tooltip') as HTMLElement;
  for (let i = 0; i < 50 && tip.classList.contains('ql-hidden'); i++) await sleep(20);
  expect(tip.classList.contains('ql-hidden'), '툴팁이 떠야 이 사례가 의미가 있다').toBe(false);
  return { el, tip };
}

describe('u-text-editor 링크 툴팁 — 키보드', () => {
  it('Edit·Remove 는 버튼 역할로 포커스를 받는다', async () => {
    const { tip } = await openTooltip();
    for (const sel of ['a.ql-action', 'a.ql-remove']) {
      const a = tip.querySelector<HTMLElement>(sel)!;
      expect(a.getAttribute('role'), sel).toBe('button');
      a.focus();
      expect((tip.getRootNode() as ShadowRoot).activeElement, sel).toBe(a);
    }
  });

  it('Remove 에서 Enter 를 누르면 링크가 제거된다', async () => {
    const { el, tip } = await openTooltip();
    tip.querySelector<HTMLElement>('a.ql-remove')!.focus();
    await userEvent.keyboard('{Enter}');
    await sleep(50);
    expect(el.quill.root.querySelector('a')).toBeNull();
  });

  it('Edit 에서 Space 를 누르면 편집 모드로 바뀐다', async () => {
    const { tip } = await openTooltip();
    tip.querySelector<HTMLElement>('a.ql-action')!.focus();
    await userEvent.keyboard(' ');
    await sleep(50);
    expect(tip.classList.contains('ql-editing')).toBe(true);
  });
});
