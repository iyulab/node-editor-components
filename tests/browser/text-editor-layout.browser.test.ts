import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/text-editor/UTextEditor.js';

/**
 * `u-text-editor` 배치 — **편집 영역은 상자 안에, 떠 있는 UI 는 상자 밖으로도** (cycle-557).
 *
 * 타깃 크기 게이트의 hit-test 축이 두 결함을 찾았다:
 * ⑴ 편집 영역을 `height - 42px` 로 줬다 — 툴바 높이를 42px 로 **가정**했는데, 좁으면 툴바가 여러 줄로 접혀(폭 480 에서
 *    88px) 편집 영역이 상자 밖으로 밀려나 아래가 잘렸다.
 * ⑵ 호스트가 `overflow: hidden` 이라 Quill 의 선택기 목록·링크 툴팁이 상자 밖으로 나가면 잘렸다 — 짧은 편집기에서는
 *    링크를 편집하거나 아래쪽 색을 고를 수 없었다.
 *
 * 두 축을 **실제로 눌러서** 잰다(`elementFromPoint`) — 박스 좌표는 잘린 부분도 그대로 보고한다.
 */

type Editor = HTMLElement & { updateComplete: Promise<unknown>; quill: { setSelection: (i: number, l: number, s: string) => void } };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const LINK = '<p><a href=&quot;https://example.com&quot;>link</a> text</p>';

async function mount(attrs: string): Promise<Editor> {
  // 아래 여백은 창이 떠 있는 UI 까지 스크롤될 수 있게 하려는 것이다 — 러너의 뷰포트는 작고, 점이 뷰포트 밖이면
  // `elementFromPoint` 는 «잘림» 과 구별되지 않는 `null` 을 돌려준다.
  document.body.innerHTML = `<div style="padding:20px 20px 800px"><u-text-editor ${attrs}></u-text-editor></div>`;
  const el = document.querySelector('u-text-editor') as unknown as Editor;
  await el.updateComplete;
  await sleep(300);
  return el;
}

const rect = (el: Element) => el.getBoundingClientRect();

/**
 * 창만 스크롤해 그 요소의 중심을 뷰포트 가운데로 가져온 뒤 누른다 — 무엇이 받았는지 돌려준다(뒤에 스크롤을 돌려놓는다).
 * ⚠**두 축 모두** 드러낸다 — 폭 480 에서 툴바가 접히면 색 선택기 목록은 러너의 좁은 뷰포트 오른쪽 밖으로 나가고, 그 점은
 *   `null` 이 되어 «잘림» 과 구별되지 않는다(첫 판이 세로로만 스크롤해 그렇게 틀렸다).
 */
function pressCenter(el: Element): Element | null {
  const wx = window.scrollX;
  const wy = window.scrollY;
  const r0 = rect(el);
  window.scrollBy(
    r0.left + r0.width / 2 - document.documentElement.clientWidth / 2,
    r0.top + r0.height / 2 - document.documentElement.clientHeight / 2,
  );
  const r = rect(el);
  const hit = (el.getRootNode() as ShadowRoot).elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  window.scrollTo(wx, wy);
  return hit;
}

describe('u-text-editor 배치', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('🔴툴바가 여러 줄로 접혀도 편집 영역은 상자 안이고, 툴바와 편집 영역이 높이를 나눠 갖는다', async () => {
    const el = await mount('style="width:480px" height="200"');
    const root = el.shadowRoot!;
    const box = rect(root.querySelector('.editor')!);
    const toolbar = rect(root.querySelector('.ql-toolbar')!);
    const editing = rect(root.querySelector('.ql-editor')!);
    expect(toolbar.height, '이 사례는 툴바가 접혀야 의미가 있다').toBeGreaterThan(50);
    expect(Math.round(box.height)).toBe(200);
    expect(editing.top).toBeGreaterThanOrEqual(toolbar.bottom - 0.5);
    expect(editing.bottom, '편집 영역이 상자 밖으로 밀려났다').toBeLessThanOrEqual(box.bottom + 0.5);
    expect(Math.round(editing.bottom)).toBe(Math.round(box.bottom));
  });

  it('넓어서 툴바가 한 줄이어도 같은 규칙이다 — 편집 영역 = 높이 − 툴바', async () => {
    const el = await mount('style="width:1100px" height="240"');
    const root = el.shadowRoot!;
    const toolbar = rect(root.querySelector('.ql-toolbar')!);
    const editing = rect(root.querySelector('.ql-editor')!);
    expect(Math.round(toolbar.height + rect(root.querySelector('.ql-container')!).height)).toBe(240);
    expect(Math.round(editing.bottom)).toBe(Math.round(rect(root.querySelector('.editor')!).bottom));
  });

  it('🔴짧은 편집기에서도 링크 툴팁의 동작(Edit)을 누를 수 있다 — 상자 밖으로 나가도 잘리지 않는다', async () => {
    const el = await mount(`style="width:480px" height="100" value="${LINK}"`);
    el.quill.setSelection(2, 0, 'user');
    const tip = () => el.shadowRoot!.querySelector('.ql-tooltip') as HTMLElement;
    for (let i = 0; i < 50 && tip().classList.contains('ql-hidden'); i++) await sleep(20);
    const action = el.shadowRoot!.querySelector('.ql-tooltip a.ql-action')!;
    expect(rect(action).bottom, '이 사례는 툴팁이 상자 밖으로 나가야 의미가 있다').toBeGreaterThan(rect(el).bottom);
    expect(pressCenter(action)).toBe(action);
  });

  it('🔴짧은 편집기에서도 색 선택기의 마지막 견본을 누를 수 있다', async () => {
    const el = await mount('style="width:480px" height="100"');
    const root = el.shadowRoot!;
    root.querySelector('.ql-color .ql-picker-label')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    await sleep(80);
    const last = Array.from(root.querySelectorAll('.ql-color .ql-picker-item')).pop()!;
    expect(rect(last).bottom, '이 사례는 목록이 상자 밖으로 나가야 의미가 있다').toBeGreaterThan(rect(el).bottom);
    expect(pressCenter(last)).toBe(last);
  });

  it('호스트가 자르지 않아도 둥근 모서리는 남는다 — 배경을 칠하는 머리글(머리글이 없으면 툴바)이 모서리를 둥글게 한다', async () => {
    const el = await mount('style="width:480px" height="120"');
    expect(parseFloat(getComputedStyle(el.shadowRoot!.querySelector('.header')!).borderTopLeftRadius)).toBeGreaterThan(0);
    const headless = await mount('style="width:480px" height="120" headless');
    expect(parseFloat(getComputedStyle(headless.shadowRoot!.querySelector('.ql-toolbar')!).borderTopLeftRadius)).toBeGreaterThan(0);
  });

  /**
   * 높이의 «주인» — cycle-560. 호스트 CSS 높이는 호스트 «상자» 만 바꾸고 편집 영역은 `height` 프로퍼티가 정한다.
   * 형제 `u-code-editor` 는 정반대(`height` 프로퍼티가 없고 `:host{height:100%}` 로 상자를 채운다)라, 한쪽을 먼저 쓴
   * 소비자가 다른 쪽에 같은 레이아웃을 옮기면 조용히 어긋난다 — 그래서 계약을 문서에 적고 여기서 고정한다.
   */
  it('🔴호스트 CSS 높이를 작게 줘도 편집 영역은 줄지 않고, 넘친 부분이 잘리지도 않는다', async () => {
    const el = await mount('style="width:480px;height:150px" height="300"');
    const root = el.shadowRoot!;
    const target = root.querySelector('.ql-editor')!;
    expect(Math.round(rect(el).height), '호스트 상자는 CSS 를 따른다').toBe(150);
    expect(Math.round(rect(root.querySelector('.editor')!).height), '편집 영역은 height 프로퍼티를 따른다').toBe(300);
    expect(getComputedStyle(el).overflow, '자르면 넘친 줄을 읽을 수도 누를 수도 없다').toBe('visible');
    expect(rect(target).bottom, '이 사례는 편집 영역이 상자 밖으로 나가야 의미가 있다').toBeGreaterThan(rect(el).bottom);
    const hit = pressCenter(target);
    expect(hit !== null && (hit === target || target.contains(hit)), '상자 밖으로 넘친 편집 영역이 실제로 눌린다').toBe(true);
  });

  it('호스트 CSS 높이를 크게 줘도 편집 영역은 늘지 않는다 — 부모를 채우려면 `height` 로 넘긴다', async () => {
    const el = await mount('style="width:480px;height:500px" height="300"');
    const box = rect(el.shadowRoot!.querySelector('.editor')!);
    expect(Math.round(rect(el).height)).toBe(500);
    expect(Math.round(box.height), 'CSS 높이는 편집 영역을 늘리지 않는다').toBe(300);
    expect(rect(el).bottom - box.bottom, '아래에 빈 공간이 남는다').toBeGreaterThan(100);
  });
});
