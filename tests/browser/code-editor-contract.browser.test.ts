import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/code-editor/UCodeEditor.js';
import type { UCodeEditor } from '../../src/components/code-editor/UCodeEditor.js';

/**
 * **`u-code-editor` 의 «관찰 계약» — monaco 판을 바꿀 때 «동등한 대체» 를 판정할 대상.**
 *
 * ## 왜 이 파일이 필요한가 — §D-53 의 착수 조건
 *
 * `monaco-editor` 는 `peerDependencies "^0.55.1"` 로 좁혀져 있고, 0.56+ 지원 회복이 백로그에
 * 있다. 그 항목이 스스로 적어 둔 착수 조건이 이것이다 — ***두 판에서 같은 코드가 같은 화면을
 * 내는지 재는 회귀가 먼저다. 그것 없이 바꾸면 «동등한 대체»를 증명할 대상이 없다.***
 *
 * ⚠**그런데 그 조건을 채우기 전에 한 가지가 더 먼저였다**: 이 컴포넌트는 이 워크스페이스의
 * 브라우저 테스트에서 **한 번도 렌더된 적이 없다**(cycle-522 이전). 형제 게이트가
 * *"이 환경에서 모듈 자체를 로드할 수 없다"* 는 예외를 달고 있었고, 실측해 보니 **지금은
 * 로드된다.** ⇒ 이 파일이 그 컴포넌트의 **첫 렌더 검증**이기도 하다.
 *
 * ## 무엇을 재는가 — 0.56 이 깨뜨리는 바로 그 축이 첫 번째다
 *
 * 0.56 의 `exports` 는 서브패스를 `./esm/vs/<name>.js` 로 재작성하는데 **`esm/` 트리에는
 * `.css` 가 한 건도 없다.** 일반 앱은 `editor.main.js` 가 스스로 import 하는 CSS 를 번들러가
 * 처리해 주지만, **이 컴포넌트는 Shadow DOM 이라 CSS «텍스트»가 필요하다**
 * (`unsafeCSS(monacoStyles)` 로 섀도 루트에 넣는다).
 *
 * ⇒ 그래서 첫 단언이 ***«섀도 루트가 monaco 규칙을 실제로 갖고 있는가»*** 다. 이것이 초록인
 * 한 대체는 동등하고, 빨간 순간 그 대체는 «에러 없이 스타일만 사라진» 상태다 — 정확히 이
 * 리포가 가장 경계하는 조용한 실패의 형태다.
 *
 * ⚠**monaco 내부 DOM 구조에 깊이 기대지 않는다.** 판이 바뀌면 내부 클래스는 바뀔 수 있고,
 * 그때 이 파일이 «판을 바꿀 수 없다» 고 말하면 그것은 계약이 아니라 족쇄다. 재는 것은
 * **소비자가 보는 것**뿐이다 — 스타일이 섀도에 도달했는가 · 편집기가 그려졌는가 ·
 * 테마가 실제로 화면을 바꾸는가 · 값이 왕복하는가.
 */

let host: HTMLDivElement;

beforeEach(() => {
  host = document.createElement('div');
  host.style.width = '480px';
  host.style.height = '200px';
  document.body.appendChild(host);
});
afterEach(() => host.remove());

/** monaco 는 레이아웃과 토큰화에 몇 프레임을 쓴다. */
const settle = async (ms = 500) => {
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await new Promise((r) => setTimeout(r, ms));
};

async function mount(attrs = ''): Promise<UCodeEditor> {
  host.innerHTML = `<u-code-editor style="width:480px;height:200px" ${attrs}></u-code-editor>`;
  const el = host.firstElementChild as UCodeEditor;
  await customElements.whenDefined('u-code-editor');
  await el.updateComplete;
  await settle();
  return el;
}

/**
 * 🔴**두 출처를 «반드시» 갈라 본다** — 섞으면 이 파일의 첫 단언이 아무것도 재지 않는다.
 *
 * cycle-522 실측(같은 화면, 같은 시점):
 *
 * | 출처 | `?inline` 있을 때 | 없을 때 |
 * |---|--:|--:|
 * | `adoptedStyleSheets`(= 우리가 `unsafeCSS` 로 넣은 것) | **332,476자 · `.monaco-editor` 포함** | 1,940자 · 없음 |
 * | 섀도 안 `<style>`(= monaco 가 런타임에 스스로 주입) | 136,320자 · `.monaco-editor` 포함 | **136,320자 · 포함(그대로)** |
 *
 * ⇒ ***monaco 는 테마 규칙을 스스로 섀도에 넣지만, «구조» CSS 는 넣지 않는다.*** 그래서
 * 두 출처를 합쳐서 «`.monaco-editor` 가 있는가» 를 물으면 **`?inline` 을 통째로 걷어내도
 * 초록이다**(첫 판이 실제로 그랬다 — 네거티브 컨트롤이 그 결함을 드러냈다).
 */
function adoptedCss(el: Element): string {
  return [...(el.shadowRoot!.adoptedStyleSheets ?? [])]
    .map((s) => [...s.cssRules].map((r) => r.cssText).join('\n'))
    .join('\n');
}

/** monaco 가 «스스로» 섀도에 넣는 것. 우리가 넣은 것과 구분해서 본다. */
function injectedCss(el: Element): string {
  return [...el.shadowRoot!.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');
}

describe('u-code-editor — 판 교체 시 «동등한 대체» 를 판정할 관찰 계약', () => {
  it('🔴 monaco 의 «구조» CSS 를 우리가 섀도에 넣는다 (0.56 이 깨뜨리는 축)', async () => {
    const el = await mount();
    const adopted = adoptedCss(el);
    // `unsafeCSS(monacoStyles)` 가 실려야만 참인 조건. 이것이 거짓이면 편집기는
    // «에러 없이» 무스타일로 뜬다 — 정확히 0.56 에서 일어날 일이다.
    expect(adopted).toContain('.monaco-editor');
    expect(adopted.length).toBeGreaterThan(100_000); // 조각이 아니라 시트 전체
  });

  it('★그리고 monaco 는 «테마» 규칙을 스스로 섀도에 넣는다 — 그것은 우리 몫이 아니다', async () => {
    const el = await mount();
    // 이 줄은 «0.56 회복» 을 설계할 때 읽을 사실이다: 런타임 주입은 판이 바뀌어도 남으므로,
    // 잃는 것은 구조 CSS 뿐이다. 둘을 섞어 보면 그 구분이 사라진다.
    expect(injectedCss(el)).toContain('.monaco-editor');
    expect(injectedCss(el).length).toBeGreaterThan(50_000);
  });

  it('편집기가 섀도 안에 그려진다', async () => {
    const el = await mount();
    const editor = el.shadowRoot!.querySelector('.monaco-editor');
    expect(editor, 'monaco 루트 엘리먼트가 섀도에 없다').not.toBe(null);
    const rect = (editor as HTMLElement).getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });

  it('🔴 CSS 가 «적용»된다 — 규칙이 있는 것과 화면에 닿는 것은 다르다', async () => {
    const el = await mount();
    const editor = el.shadowRoot!.querySelector('.monaco-editor') as HTMLElement;
    // monaco 시트가 `.monaco-editor` 에 주는 값. 스타일이 도달하지 않으면 static 이다.
    expect(getComputedStyle(editor).position).not.toBe('static');
  });

  it('테마가 «화면을»  바꾼다 — 두 테마의 배경이 다르다', async () => {
    const light = await mount('theme="light"');
    const lightBg = getComputedStyle(
      light.shadowRoot!.querySelector('.monaco-editor') as HTMLElement,
    ).backgroundColor;

    light.theme = 'dark';
    await light.updateComplete;
    await settle();
    const darkBg = getComputedStyle(
      light.shadowRoot!.querySelector('.monaco-editor') as HTMLElement,
    ).backgroundColor;

    expect(lightBg).not.toBe(darkBg);
  });

  it('값이 왕복한다 — 프로퍼티로 넣은 것이 편집기에 보인다', async () => {
    const el = await mount('language="json"');
    el.value = '{ "probe": 42 }';
    await el.updateComplete;
    await settle();
    const text = (el.shadowRoot!.querySelector('.monaco-editor') as HTMLElement).innerText;
    expect(text).toContain('probe');
  });

  it('NEGATIVE — 프로그램적 value 설정은 `change` 를 내지 않는다 (사용자 입력이 아니다)', async () => {
    const el = await mount();
    let fired = 0;
    el.addEventListener('change', () => { fired++; });
    el.value = 'programmatic';
    await el.updateComplete;
    await settle(300);
    expect(fired).toBe(0);
  });

  it('language 를 바꿔도 편집기가 살아 있다', async () => {
    const el = await mount('language="json"');
    el.language = 'javascript';
    await el.updateComplete;
    await settle(300);
    expect(el.shadowRoot!.querySelector('.monaco-editor')).not.toBe(null);
  });
});

/**
 * **크기 계약 — «호스트 상자» 가 주인이다**(cycle-561).
 *
 * 🔴형제 `u-text-editor` 는 **정반대**다 — 거기서는 `height` 프로퍼티가 편집 영역을 정하고 호스트 CSS 높이는
 * 상자만 바꾼다. 한쪽을 먼저 쓴 소비자가 레이아웃을 그대로 옮기면 조용히 어긋나므로, 두 문서가 서로를 가리킨다.
 *
 * ⚠종전에는 편집 영역을 «호스트 − 32px» 로 줬는데 실제 머리글은 24px 라 **아래 8px 을 영구히 못 쓰고 있었다**.
 * 이제 세로 flex 가 «머리글을 뺀 나머지» 를 준다 — 형제에서 걷어낸 «툴바 높이를 숫자로 가정» 과 같은 부류였다.
 */
describe('u-code-editor — 크기 계약(호스트 상자가 주인)', () => {
  let wrap: HTMLDivElement;

  beforeEach(() => {
    wrap = document.createElement('div');
    document.body.appendChild(wrap);
  });
  afterEach(() => wrap.remove());

  async function mountIn(wrapperStyle: string, attrs = ''): Promise<UCodeEditor> {
    wrap.setAttribute('style', wrapperStyle);
    wrap.innerHTML = `<u-code-editor ${attrs}></u-code-editor>`;
    const el = wrap.firstElementChild as UCodeEditor;
    await customElements.whenDefined('u-code-editor');
    await el.updateComplete;
    await settle();
    return el;
  }

  const box = (el: UCodeEditor, sel: string) =>
    (el.shadowRoot!.querySelector(sel) as HTMLElement).getBoundingClientRect();

  it('🔴편집 영역은 «호스트 − 머리글» 을 남김없이 쓴다 — 머리글 높이를 숫자로 가정하지 않는다', async () => {
    const el = await mountIn('height:400px;width:480px');
    const host = el.getBoundingClientRect();
    const headerH = Math.round(box(el, '.header').height);
    expect(Math.round(host.height)).toBe(400);
    expect(headerH, '이 사례는 머리글이 보여야 의미가 있다').toBeGreaterThan(0);
    expect(Math.round(box(el, '.editor').height), '편집 영역 = 호스트 − 머리글').toBe(400 - headerH);
    expect(Math.round(host.bottom - box(el, '.editor').bottom), '아래에 못 쓰는 공간이 남지 않는다').toBe(0);
  });

  it('`headless` 면 편집 영역이 호스트 전체다', async () => {
    const el = await mountIn('height:400px;width:480px', 'headless');
    expect(Math.round(box(el, '.editor').height)).toBe(400);
  });

  it('호스트 상자를 바꾸면 편집 영역이 따라온다 — 크기의 주인은 호스트다(형제와 반대)', async () => {
    const el = await mountIn('height:400px;width:480px', 'style="height:150px"');
    const headerH = Math.round(box(el, '.header').height);
    expect(Math.round(el.getBoundingClientRect().height)).toBe(150);
    expect(Math.round(box(el, '.editor').height)).toBe(150 - headerH);
  });

  it('🔴부모가 auto 높이면 편집 영역이 몇 px 로 붕괴한다 — 계약이라 고정한다(부모에 높이를 주거나 호스트에 직접 준다)', async () => {
    const collapsed = await mountIn('width:480px');
    const headerH = Math.round(box(collapsed, '.header').height);
    // ⚠**정확한 px 를 고정하지 않는다** — 실측 5px 는 monaco 의 내재 높이라 구현 사항이다(판이 바뀌면 달라진다).
    //   고정하는 것은 계약이다: «머리글보다도 얇다» = 편집기로 쓸 수 없다.
    expect(Math.round(box(collapsed, '.editor').height), 'height:100% 는 auto 높이 부모에서 무효라 편집 영역이 붕괴한다')
      .toBeLessThan(headerH);
    const fixed = await mountIn('height:300px;width:480px');
    expect(Math.round(box(fixed, '.editor').height), '부모에 높이를 주면 살아난다').toBeGreaterThan(200);
  });
});
