import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@iyulab/components/styles/tokens.css';
import { Theme } from '@iyulab/components/dist/utilities/Theme.js';
import '../../src/components/text-editor/UTextEditor.js';

/**
 * 규약: **편집기는 문서 테마를 따라가고, 강조색은 브랜드를 따라온다.**
 *
 * ★이 파일은 두 종류의 단언을 섞어 담는다 — 구분해서 읽어야 한다.
 *
 * **⒜ 회귀 가드**(테마 추종): 이 동작은 **변경 전에도 성립했다.** 팔레트가 테마에 따라
 * 뒤집히기 때문이다(`--u-neutral-0` = 라이트 #FFFFFF / 다크 #000000). 실제로 네거티브
 * 컨트롤에서 종전 스타일로 되돌려도 이 단언들은 통과했다 — 그래서 이것들은 *이번 변경의
 * 증거가 아니라* 앞으로를 위한 잠금이다. (그 사실을 확인하지 않았다면 통과를 근거로
 * *"다크 테마를 고쳤다"* 고 잘못 말할 뻔했다.)
 *
 * **⒝ 변경의 증거**(강조색·죽은 규칙): 종전에는 강조색이 `--u-blue-600` 에 하드와이어돼
 * 있어 브랜드를 바꿔도 따라오지 않았고, 다크 규칙 8쌍이 매치되지 않는 채 남아 있었다.
 */
describe('텍스트 편집기 — 테마·브랜드 추종', () => {
  let el: HTMLElement & { updateComplete: Promise<unknown> };
  let styleEl: HTMLStyleElement | null = null;

  const mount = async () => {
    document.body.innerHTML = '<u-text-editor></u-text-editor>';
    el = document.body.firstElementChild as typeof el;
    await customElements.whenDefined('u-text-editor');
    await el.updateComplete;
    return el;
  };

  const override = (css: string) => {
    styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  };

  const rgb = (value: string) => {
    const n = value.match(/[\d.]+/g)!.map(Number);
    return value.startsWith('color(') ? n.map(v => Math.round(v * 255)) : n;
  };
  const luminance = (value: string) => {
    const [r, g, b] = rgb(value);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    styleEl?.remove();
    styleEl = null;
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('theme');
  });

  // ⒜ 회귀 가드 — 변경 전에도 성립했다
  it('[회귀] 라이트 테마에서 밝은 배경으로 렌더된다', async () => {
    Theme.set('light');
    await mount();
    expect(luminance(getComputedStyle(el).backgroundColor)).toBeGreaterThan(180);
  });

  it('[회귀] 다크 테마에서 어두운 배경으로 렌더된다', async () => {
    Theme.set('dark');
    await mount();
    expect(luminance(getComputedStyle(el).backgroundColor)).toBeLessThan(120);
  });

  it("[회귀] 'system' 선호에서도 실효 테마를 따른다", async () => {
    document.documentElement.setAttribute('data-theme', 'system');
    document.documentElement.setAttribute('theme', 'dark');
    await mount();
    expect(luminance(getComputedStyle(el).backgroundColor)).toBeLessThan(120);
  });

  // ⒝ 변경의 증거 — 채택된 시트를 실제로 읽는다(소스 파일이 아니라)
  /** 이 요소에 실제로 채택된 스타일시트 전문. Quill 시트가 함께 들어 있다. */
  const adoptedCss = () =>
    ((el.shadowRoot as ShadowRoot).adoptedStyleSheets ?? [])
      .flatMap(sheet => [...sheet.cssRules].map(r => r.cssText))
      .join('\n');

  it('★강조색이 역할 토큰을 경유한다 (종전에는 blue-600 하드와이어)', async () => {
    Theme.set('light');
    await mount();
    const css = adoptedCss();

    // 툴바 아이콘의 강조 규칙이 실제로 존재하고 역할 토큰을 읽는다.
    expect(css).toMatch(/ql-active[^{]*\{[^}]*var\(--u-primary-color/);
    // 그리고 팔레트를 직접 읽는 자리가 남아 있지 않다 — 소비자가 브랜드를 바꿀 때
    // 따라오지 않는 자리가 곧 어긋난 색이다.
    expect(css).not.toMatch(/var\(--u-(?:blue|red|green|yellow|neutral)-\d+/);
  });

  it('★브랜드를 바꾸면 강조색이 실제로 따라온다', async () => {
    Theme.set('light');
    override(':root { --u-primary-color: #7B1FA2; }');
    await mount();

    const stroke = el.shadowRoot!.querySelector('.ql-toolbar button .ql-stroke');
    expect(stroke).not.toBeNull(); // Quill 초기화 실패 시 이 테스트는 아무것도 검증하지 못한다

    // hover/active 를 합성하는 대신, 그 규칙이 쓰는 것과 **같은 토큰**이 이 요소의
    // 계산 컨텍스트에서 무엇으로 풀리는지 본다.
    const probe = document.createElement('div');
    probe.style.color = getComputedStyle(stroke!).getPropertyValue('--u-primary-color');
    document.body.appendChild(probe);
    expect(rgb(getComputedStyle(probe).color)).toEqual([123, 31, 162]);
    probe.remove();
  });

  it('★테마별 규칙이 남아 있지 않다 — 시트 하나로 두 테마를 덮는다', async () => {
    // 죽은 다크 규칙 8쌍이 있던 자리다. 그 규칙들은 팔레트가 뒤집히지 **않는다**는
    // 전제로 쓰여, 매치됐다면 다크 배경에 밝은 회색(#D4D4D4)을 칠했을 것이다.
    // 테마 분기가 다시 들어오면 여기서 걸린다.
    await mount();
    expect(adoptedCss()).not.toMatch(/:host\(\[theme[~^|$*]?=/);
  });
});
