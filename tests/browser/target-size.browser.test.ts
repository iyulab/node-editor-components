import { describe, it, expect, beforeEach, beforeAll } from 'vitest';

/**
 * **WCAG 2.2 SC 2.5.8 Target Size (Minimum) — 24×24 CSS px** 게이트.
 *
 * `@iyulab/components`(cycle-479~492) → `chat-components`(496) → `data-components`(497)를
 * 거쳐 이식했다. 판정 규칙·간격 예외·형제 태그 걸러내기는 **같은 형태**다.
 *
 * ## 🔴 이 패키지의 조작부는 «우리가 그리지 않는다»
 *
 * 두 컴포넌트는 서드파티 에디터의 얇은 래퍼다 — `u-code-editor` 는 Monaco, `u-text-editor`
 * 는 Quill 을 감싼다. 버튼 마크업이 우리 소스에 **한 줄도 없고**(실측 0건), 우리가 하는 것은
 * Quill 툴바의 **색만** 덮어쓰는 것이다(`.ql-stroke`/`.ql-fill`).
 *
 * ⚠**그래서 «대상 아님»으로 넘기고 싶어지는데, 그것이 이 게이트가 가장 경계하는 형태다** —
 * 둘 다 넘기면 이 스위트는 ***아무것도 재지 않으면서 초록***이 된다. ⇒ 크기를 정하는 것이
 * 우리가 아니더라도 **소비자가 보는 것은 우리 컴포넌트**이므로, 툴바 버튼을 실제로 재서
 * 숫자를 남긴다. 미달이 나오면 그때 «서드파티 표면을 어떻게 다룰 것인가»가 사람 판단으로
 * 올라간다 — 재지 않으면 그 질문 자체가 생기지 않는다.
 *
 * ## 상태별 픽스처 · hit-test 축 (cycle-557)
 *
 * 다른 세 게이트(components · chat · data)와 같은 형태로 올렸다 — `Fixture[]`·`state`·`prepare`, 상태 수를 세는
 * 커버리지, 상태 단위 핀, 그리고 크기보다 먼저 «실제로 눌리는가» 를 재는 hit-test 블록(정본 = components 게이트 ·
 * 루트 `hit-test-block-sync` 가 같은 코드인지 잰다).
 */

const MIN = 24;

interface Measured {
  w: number;
  h: number;
  cx: number;
  cy: number;
}

function measure(el: Element): Measured {
  const r = el.getBoundingClientRect();
  return { w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
}

/** SC 2.5.8 «간격 예외» — 중심 간 거리가 24px 이상이면 24px 원이 겹치지 않는다. */
function spacingSatisfied(target: Measured, others: Measured[]): boolean {
  return others.every((o) => Math.hypot(target.cx - o.cx, target.cy - o.cy) >= MIN);
}

type Verdict = 'meets-size' | 'exempt-by-spacing' | 'undersized';

function judge(target: Measured, others: Measured[]): Verdict {
  if (target.w >= MIN && target.h >= MIN) return 'meets-size';
  return spacingSatisfied(target, others) ? 'exempt-by-spacing' : 'undersized';
}

/**
 * 섀도 DOM 안쪽에서 셀렉터로 고른다.
 *
 * ⚠`components` 쪽 게이트는 `part` 로 고르는 헬퍼를 따로 두지만 **여기서는 쓰지 않는다** —
 * 이 패키지의 타깃은 `part` 가 붙지 않은 서드파티 내부 컨트롤(`.ql-toolbar button` 등)이라
 * 셀렉터 하나로 충분하다.
 */
function inShadow(host: Element, sel: string): Element[] {
  const root = (host as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot;
  return root ? Array.from(root.querySelectorAll(sel)) : [];
}

/**
 * 🔴**hit-test 축**(cycle-553 · 세 게이트 공통) — 타깃의 중심과 1px 안쪽 네 가장자리를 실제로 누르면 그 타깃이 받는가.
 *
 * `getBoundingClientRect` 는 조상의 `overflow` 가 자른 부분도, 닫혀서 보이지 않는 요소의 박스도 그대로 보고한다 — 크기만
 * 재면 ***보이지도 눌리지도 않는 타깃이 통과한다.*** 실제로 그랬다: components 게이트의 `u-input` 접미 아이콘(좁은 필드에서
 * 밖으로 밀려나 잘렸다)과, 닫힌 채 띄운 대화상자 픽스처(닫기 버튼 중심을 누르면 `body` 가 받았다).
 *
 * - **사용자가 스크롤로 닿을 수 있으면 닿는 것이다** — 점마다, 그 점이 보이도록 `overflow: auto|scroll` 조상과 창만 스크롤한
 *   뒤 잰다(cycle-554: 표·시트·블록이 러너의 좁은 뷰포트를 넘어 `elementFromPoint` 가 `null` 을 돌려줬고, 뷰포트보다 넓은
 *   타깃은 양 끝을 한 화면에 담을 수 없다). `overflow: hidden|clip` 조상은 사용자가 움직일 수 없으므로 **건드리지 않는다** —
 *   `scrollIntoView` 는 그것까지 스크롤해 잘린 타깃을 통과시킨다. 움직인 스크롤은 점마다 돌려놓는다.
 * - 판정은 타깃이 속한 트리(`getRootNode()`)에서 한다. 그 트리로 retarget 되어 **호스트**가 돌아오면, 그 점이 타깃 안
 *   `<slot>` 에 꽂힌 라이트 DOM 내용 위일 때 타깃이 받은 것으로 센다(링크 안에 꽂힌 글자 등).
 * - ⚠**이웃 타깃이 받은 것은 봐주지 않는다.** 붙어 있는 격자 셀의 경계선 때문에 가장자리를 이웃에 양보하는 면제를
 *   시험해 봤지만(cycle-554), 네거티브 컨트롤로 끄자 **어떤 픽스처도 빨개지지 않았다** — 셀 가장자리의 불일치는 경계선이
 *   아니라 뷰포트 밖이었다. 쓰이지 않는 면제는 조용한 미탐이라 걷어냈다. 필요해지면 그 픽스처가 빨강으로 알린다.
 *
 * ⚠이 헬퍼는 세 게이트(components · chat-components · data-components)에 **같은 코드로** 한 벌씩 있다 — 고치면 셋 다.
 */
type HitPoint = readonly [name: string, fx: number, fy: number, ox: number, oy: number];

const HIT_POINTS: HitPoint[] = [
  ['중심', 0.5, 0.5, 0, 0],
  ['왼', 0, 0.5, 1, 0],
  ['오른', 1, 0.5, -1, 0],
  ['위', 0.5, 0, 0, 1],
  ['아래', 0.5, 1, 0, -1],
];

function describeEl(el: Element | null): string {
  if (!el) return 'null';
  const cls = el.getAttribute('class');
  return `${el.localName}${cls ? `.${cls.split(' ')[0]}` : ''}`;
}

function unreachablePoints(el: Element): Array<{ point: string; hit: string }> {
  const root = el.getRootNode() as Document | ShadowRoot;
  const host = root instanceof ShadowRoot ? root.host : null;
  const at = (p: HitPoint): [number, number] => {
    const r = el.getBoundingClientRect();
    return [r.left + r.width * p[1] + p[3], r.top + r.height * p[2] + p[4]];
  };
  const misses: Array<{ point: string; hit: string }> = [];
  for (const p of HIT_POINTS) {
    const restore = revealPoint(el, () => at(p));
    try {
      const [x, y] = at(p);
      const hit = root.elementFromPoint(x, y);
      const ok = !!hit && (hit === el || el.contains(hit) || (hit === host && slottedContentAt(el, x, y)));
      if (!ok) misses.push({ point: p[0], hit: describeEl(hit) });
    } finally {
      restore();
    }
  }
  return misses;
}

/** 평탄 트리의 부모 — 슬롯에 꽂혔으면 그 슬롯, 섀도 루트면 그 호스트. */
function flatParent(node: Node): Element | null {
  const slot = (node as Element).assignedSlot;
  if (slot) return slot;
  const parent = node.parentNode;
  if (parent instanceof ShadowRoot) return parent.host;
  return parent instanceof Element ? parent : null;
}

/** 그 점이 보이도록 사용자가 스크롤할 수 있는 조상과 창을 움직인다. 돌려놓는 함수를 돌려준다. */
function revealPoint(el: Element, point: () => [number, number]): () => void {
  const moved: Array<[Element, number, number]> = [];
  for (let a = flatParent(el); a && a !== document.documentElement && a !== document.body; a = flatParent(a)) {
    const cs = getComputedStyle(a);
    const canX = /auto|scroll/.test(cs.overflowX) && a.scrollWidth > a.clientWidth;
    const canY = /auto|scroll/.test(cs.overflowY) && a.scrollHeight > a.clientHeight;
    if (!canX && !canY) continue;
    const [x, y] = point();
    const box = a.getBoundingClientRect();
    const left = box.left + a.clientLeft;
    const top = box.top + a.clientTop;
    const before: [Element, number, number] = [a, a.scrollLeft, a.scrollTop];
    if (canX && (x < left || x >= left + a.clientWidth)) a.scrollLeft += x - (left + a.clientWidth / 2);
    if (canY && (y < top || y >= top + a.clientHeight)) a.scrollTop += y - (top + a.clientHeight / 2);
    if (a.scrollLeft !== before[1] || a.scrollTop !== before[2]) moved.push(before);
  }
  const wx = window.scrollX;
  const wy = window.scrollY;
  const [x, y] = point();
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const dx = x < 0 || x >= vw ? x - vw / 2 : 0;
  const dy = y < 0 || y >= vh ? y - vh / 2 : 0;
  if (dx || dy) window.scrollBy(dx, dy);
  return () => {
    window.scrollTo(wx, wy);
    for (const [a, l, t] of moved.reverse()) {
      a.scrollLeft = l;
      a.scrollTop = t;
    }
  };
}

/** 타깃 안 `<slot>` 에 꽂힌 라이트 DOM 내용 중 그 점을 덮는 것이 있는가. */
function slottedContentAt(el: Element, x: number, y: number): boolean {
  for (const slot of Array.from(el.querySelectorAll('slot'))) {
    for (const n of slot.assignedNodes({ flatten: true })) {
      let rects: DOMRect[];
      if (n instanceof Element) {
        rects = [n.getBoundingClientRect()];
      } else {
        const range = document.createRange();
        range.selectNodeContents(n);
        rects = Array.from(range.getClientRects());
      }
      if (rects.some((q) => x >= q.left && x <= q.right && y >= q.top && y <= q.bottom)) return true;
    }
  }
  return false;
}

/**
 * 🔴**체크박스·라디오의 포인터 타깃은 입력 자체가 아니라 «활성화 라벨»이다.** 라벨을 누르면
 * 토글되므로 SC 2.5.8 이 재는 「포인터 동작을 받는 영역」은 라벨 전체다(네이티브 입력은
 * 13×13 이지만 라벨은 그보다 크게 만들 수 있다 — 입력에 치수를 주면 브라우저가 체크 글리프를
 * 함께 키워 시각이 바뀐다).
 *
 * ⚠**규칙이라 손으로 쓴다** — 어떤 라벨이 «활성화»하는지는 도출이 아니라 우리 지식이다.
 * ⚠**체크박스·라디오에만** 적용한다: 텍스트 입력의 라벨까지 넓히면 정당한 미달을 숨기는
 * 쪽으로만 작용한다. `u-widgets` 게이트(cycle-493)가 같은 규칙을 같은 이유로 쓴다.
 */
function resolveTarget(el: Element): Element {
  const input = el as HTMLInputElement;
  const usesLabel = el.tagName === 'INPUT' && (input.type === 'checkbox' || input.type === 'radio');
  return (usesLabel && input.labels?.[0]) || el;
}

// ---------------------------------------------------------------------------
// 규칙 — 손으로 쓴다 (도출할 수 없는 우리 지식)
// ---------------------------------------------------------------------------

/**
 * 포인터 타깃이 아닌 것 — 자기 자신이 렌더하는 상호작용 타깃이 없는 것.
 * 사용자가 «활성화»하는 영역이 아니므로 자를 대면 정당한 컴포넌트 전건에 발화한다.
 */
const NOT_A_TARGET = new Set<string>([
  // `u-code-editor` 의 섀도는 헤더(제목 + 여백 + `header-actions` 슬롯)와 monaco 컨테이너뿐이다
  // — **자기 자신이 렌더하는 상호작용 타깃이 없다**(액션은 소비자가 슬롯으로 넣는다).
  // ⚠monaco 내부 UI 는 minimap 비활성·툴바 없음이라 상시 타깃을 만들지 않는다.
  'u-code-editor',
]);

/**
 * ✅**종전의 «로드 불가» 예외는 2026-09-10(cycle-522) 실측으로 해소됐다.**
 *
 * 그 자리는 `u-code-editor` 가 `monaco-editor/min/vs/editor/editor.main.css?inline` 을
 * import 하는데 이 워크스페이스의 Vite 가 그것을 풀지 못한다는 것이었다. **지금은 풀린다** —
 * 최소 프로브(그 모듈만 import 하고 `whenDefined` 를 기다리는 테스트)가 통과한다. monaco
 * `0.55.1` 의 `exports` 에 `"./*": "./*"` 와일드카드가 있고 파일도 실재한다.
 *
 * 🔴**그래서 그 예외는 «낡은 면제» 였다** — 그것이 이 컴포넌트를 이 게이트의 시야에서
 * 통째로 빼고 있었고, 이 리포가 「검사기 존재 ≠ 대상 포함」이라 부르는 형태의 **면제판**이다.
 * 예외에 «원상 복구 조건» 을 적어 둔 것이 그것을 되찾게 했다 — 조건 없는 면제였다면
 * 아무도 다시 묻지 않았을 것이다.
 */

/**
 * 타깃을 «갖고 있지만» 아직 대표 픽스처를 쓰지 않은 것.
 * ⚠**이 목록은 「통과」가 아니라 「미판정」이다.**
 */
const NEEDS_FIXTURE = new Set<string>([]);

/**
 * 🔴**측정 결과 미달인데 «치수를 올리는 것이 시각적 공개 계약 변경»이라 사람 판단이 필요한 것.**
 * 여기 있는 동안 이 파일은 그것을 **미달로 단언**하므로 스위트는 초록이고, 치수를 올리면
 * 빨개진다 — 그때 이 집합에서 빼는 것이 완료 신호다. 태그 전체(`u-x`) 또는 한 상태(`u-x [상태]`)에 건다.
 */
/* ✅**Quill 표면 둘의 핀은 `HD-58` ⒜ 채택으로 해소됐다**(2026-09-12) — 우리 시트가 색 견본을 24×24 로(목록 폭도 함께) ·
   툴팁의 Edit/Remove 를 `inline-block` 으로(줄 높이 26 이 실제 높이가 된다). 서드파티가 그리더라도 소비자가 보는 것은 우리 컴포넌트다. */
const UNDERSIZED_PINS = new Set<string>([]);

/**
 * 🔴**SC 2.5.8 「인라인」 예외** — *"타깃이 문장 안에 있거나, 그 크기가 타깃 아닌 텍스트의
 * `line-height` 에 의해 제약되는 경우"* 는 규격이 명시적으로 면제한다. 이 패키지에는 아직 없다.
 * ⚠**면제는 이름으로 좁게 준다** — 넓은 면제는 조용한 미탐이 된다.
 */
const INLINE_PROSE = new Set<string>([]);

interface Fixture {
  html: string;
  /** 한 태그를 여러 상태로 잴 때 그 상태의 이름(테스트 이름에 붙는다). 커버리지는 상태 단위로 센다. */
  state?: string;
  /**
   * 재기 전에 **사용자 경로로** 상태를 연다. 여는 데 실패하면 **던진다** — 닫힌 채 숨은 타깃을 재고 초록이 되는 것이
   * 이 부류의 조용한 미탐이다.
   */
  prepare?: (host: Element) => Promise<void>;
  /** 이 픽스처 안의 «타깃»들. 생략하면 태그 자신. */
  targets?: (tag: string) => Element[];
  /**
   * 🔴**이 컴포넌트가 «타깃들 사이의 간격»을 스스로 소유하는가.** 기본값은 «간격 예외를
   * 쓰지 않는다»(크기로만 판정) — 고립 픽스처에 예외를 적용하면 무엇이든 통과한다.
   */
  spacingIsOurs?: true;
  /** 렌더가 비동기인 컴포넌트(서드파티 초기화 등)를 위한 추가 대기(ms). */
  settle?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// ⚠높이는 공개 API(`height` 속성)로 준다 — 호스트에 CSS 높이를 주는 것은 이 컴포넌트의 계약이 아니다(편집 영역은
//   `height` 가 정한다). 종전 픽스처는 CSS 높이를 줘, 편집기 아래쪽이 상자 밖에 있었다(cycle-557 hit-test 가 찾았다).
const EDITOR = '<u-text-editor style="width:480px" height="200"></u-text-editor>';

/** 툴바의 한 선택기를 사용자 경로(라벨 `mousedown`)로 열고, `.ql-expanded` 가 붙을 때까지 기다린다 — 안 열리면 던진다. */
async function openPicker(host: Element, pickerSel: string): Promise<void> {
  const label = host.shadowRoot!.querySelector(`.ql-toolbar ${pickerSel} .ql-picker-label`) as HTMLElement | null;
  if (!label) throw new Error(`툴바에 선택기 ${pickerSel} 가 없다`);
  label.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  const picker = label.closest('.ql-picker')!;
  for (let i = 0; i < 50 && !picker.classList.contains('ql-expanded'); i++) await sleep(20);
  if (!picker.classList.contains('ql-expanded')) throw new Error(`선택기 ${pickerSel} 가 열리지 않았다 — 닫힌 항목을 재면 미탐이다`);
}

/** 실제로 재는 것 — 대표 픽스처와 그 안의 타깃. 상태가 여럿이면 배열. */
const FIXTURES: Record<string, Fixture | Fixture[]> = {
  'u-text-editor': [
    {
      state: '툴바',
      // Quill 툴바의 버튼과 **선택기 라벨**(`.ql-picker-label` — 머리글 등 드롭다운을 여는 `span[role=button]`).
      // ⚠종전 셀렉터 `.ql-toolbar button` 은 라벨을 놓쳤다(§D-57 표의 공백 — 셀렉터가 요소 이름을 전제했다).
      // ⚠**우리가 치수를 정하지 않는다**(색만 덮어쓴다 — `.ql-stroke`/`.ql-fill`) — 그럼에도 재는 이유는 머리말.
      //   툴바 버튼은 서로 **붙어 있으므로** 간격 예외를 켠다(그 예외가 실제로 일하는 자리다 — cycle-496 이 세운 기준).
      html: EDITOR,
      targets: () => inShadow(document.querySelector('u-text-editor')!, '.ql-toolbar button, .ql-toolbar .ql-picker-label'),
      spacingIsOurs: true,
      settle: 400,
    },
    // 선택기 항목은 두 형태다 — **글자 항목**(크기·머리글·글꼴)과 **색 견본**(글자색·배경색 — 격자로 붙은 칸). 한 형태만
    // 재면 다른 형태가 시야 밖에 남는다 ⇒ 형태마다 대표 하나(`.ql-size` · `.ql-color`)를 연다.
    // Quill 은 라벨의 `mousedown` 으로 연다(`click` 이 아니다). 항목은 열린 뒤에만 보인다 ⇒ `.ql-expanded` 를 기다리고
    // 안 열리면 던진다. 항목은 목록 안에서 붙어 있다 — 간격 예외를 켠다.
    {
      state: '선택기 열림 · 글자',
      html: EDITOR,
      settle: 400,
      prepare: (host) => openPicker(host, '.ql-size'),
      targets: () => inShadow(document.querySelector('u-text-editor')!, '.ql-size.ql-expanded .ql-picker-item'),
      spacingIsOurs: true,
    },
    {
      state: '선택기 열림 · 색',
      html: EDITOR,
      settle: 400,
      prepare: (host) => openPicker(host, '.ql-color'),
      targets: () => inShadow(document.querySelector('u-text-editor')!, '.ql-color.ql-expanded .ql-picker-item'),
      spacingIsOurs: true,
    },
    {
      state: '링크 툴팁',
      // 커서가 링크 안에 오면 snow 테마가 미리보기 툴팁(열기 링크 · Edit · Remove)을 띄운다. 커서는 Quill 선택 API 로 둔다 —
      // 섀도 DOM 안에서 Quill 의 DOM 선택 추적은 브라우저마다 달라, 클릭 경로는 이 게이트가 재려는 것(툴팁 타깃 치수)과
      // 무관한 이유로 흔들린다. ⚠툴팁이 안 뜨면 던진다. 세 링크의 배치는 Quill 이 정한다 — 크기로만 판정한다.
      html: '<u-text-editor style="width:480px" height="200" value="<p><a href=&quot;https://example.com&quot;>link</a> text</p>"></u-text-editor>',
      settle: 400,
      prepare: async (host) => {
        const quill = (host as unknown as { quill: { setSelection: (i: number, l: number, s: string) => void } | null }).quill;
        if (!quill) throw new Error('Quill 인스턴스가 없다');
        quill.setSelection(2, 0, 'user');
        const tip = () => host.shadowRoot!.querySelector('.ql-tooltip') as HTMLElement | null;
        for (let i = 0; i < 50 && (!tip() || tip()!.classList.contains('ql-hidden')); i++) await sleep(20);
        if (!tip() || tip()!.classList.contains('ql-hidden')) throw new Error('링크 툴팁이 뜨지 않았다 — 숨은 링크를 재면 미탐이다');
      },
      targets: () => inShadow(document.querySelector('u-text-editor')!,
        '.ql-tooltip a.ql-preview, .ql-tooltip a.ql-action, .ql-tooltip a.ql-remove'),
    },
  ],
};

async function mount(html: string, settle = 0): Promise<void> {
  document.body.innerHTML = `<div style="padding:40px;width:600px">${html}</div>`;
  await new Promise((r) => setTimeout(r, 80 + settle));
}

/**
 * 두 엔트리가 등록한 태그 중 **이 패키지가 소유한 것**만 — 손으로 열거하지 않는다.
 *
 * 🔴**형제 `@iyulab/components` 의 태그를 걸러야 한다.** 우리 배럴을 임포트하면 그쪽 컴포넌트
 * (`u-button`·`u-icon`·`u-copy-button` 등 실측 8개)도 부수효과로 함께 등록되는데, 그것들은
 * ***그 패키지의 계약이고 거기 같은 게이트가 이미 있다.*** 여기서 또 재면 ⑴판정이 두 곳으로
 * 갈려 드리프트하고 ⑵우리가 고칠 수 없는 미달이 이 스위트를 빨갛게 만든다.
 *
 * ⚠**그 목록을 손으로 쓰지 않는다** — 형제를 «먼저» 임포트해 그때 등록된 것을 걷어내면,
 * 남는 것이 곧 우리 것이다(같은 태그는 두 번 등록되지 않는다). 형제가 컴포넌트를 더하거나
 * 빼도 이 판정은 따라온다.
 */
const registered: string[] = [];

beforeAll(async () => {
  const original = customElements.define.bind(customElements);
  customElements.define = ((name: string, ctor: CustomElementConstructor, opts?: ElementDefinitionOptions) => {
    registered.push(name);
    return original(name, ctor, opts);
  }) as typeof customElements.define;

  await import('@iyulab/components');
  const foreign = registered.length;
  registered.length = 0;

  /* ✅**배럴을 임포트한다** — cycle-522 가 그 복구 조건(monaco import 해석)을 실측으로 확인해
     종전의 «로드 가능한 것만 직접 임포트» 후퇴를 되돌렸다. ⇒ 새 컴포넌트가 생기면 **여기를
     고치지 않아도** 이 게이트의 시야에 들어온다. */
  await import('../../src/index.js');
  customElements.define = original;

  // 형제가 실제로 무언가를 등록했는지 확인한다 — 0 이면 위 «걸러내기»가 아무 일도 하지 않은
  // 것이고, 그러면 아래 분류표에 남의 태그가 섞여 들어와도 알 방법이 없다.
  if (foreign === 0) throw new Error('형제 배럴이 아무 태그도 등록하지 않았다 — 소유 판정이 무의미하다');
});

describe('WCAG 2.2 SC 2.5.8 — 타깃 크기(최소) 게이트', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('규칙 자체 — 간격 예외 모델링', () => {
    it('24×24 이상이면 간격과 무관하게 통과한다', () => {
      expect(judge({ w: 24, h: 24, cx: 0, cy: 0 }, [{ w: 24, h: 24, cx: 1, cy: 0 }])).toBe('meets-size');
    });

    it('🔴미달이어도 중심 간 24px 이상이면 «간격 예외»로 통과한다', () => {
      expect(judge({ w: 16, h: 16, cx: 0, cy: 0 }, [{ w: 16, h: 16, cx: 24, cy: 0 }]))
        .toBe('exempt-by-spacing');
    });

    it('🔴미달이고 중심 간 24px 미만이면 위반이다', () => {
      expect(judge({ w: 16, h: 16, cx: 0, cy: 0 }, [{ w: 16, h: 16, cx: 23.9, cy: 0 }]))
        .toBe('undersized');
    });

    it('⚪NEGATIVE — 이웃이 없으면 미달이어도 «간격 예외»다 (혼자 있는 타깃)', () => {
      expect(judge({ w: 10, h: 10, cx: 0, cy: 0 }, [])).toBe('exempt-by-spacing');
    });

    it('⚪NEGATIVE — 대각선 거리도 유클리드로 잰다 (축별로 재면 틀린다)', () => {
      expect(judge({ w: 16, h: 16, cx: 0, cy: 0 }, [{ w: 16, h: 16, cx: 17, cy: 17 }]))
        .toBe('exempt-by-spacing');
    });
  });

  describe('규칙 자체 — hit-test 축', () => {
    const pointsOf = (el: Element) => unreachablePoints(el).map((m) => m.point);
    const ALL = ['중심', '왼', '오른', '위', '아래'];

    it('보이는 버튼은 다섯 점 모두 닿는다 — 자손(글자·아이콘)이 받아도 그 버튼이 받은 것이다', async () => {
      await mount('<button style="width:60px;height:30px"><span style="display:block">OK</span></button>');
      expect(pointsOf(document.querySelector('button')!)).toEqual([]);
    });

    it('🔴조상 overflow 에 통째로 잘린 버튼은 다섯 점 모두 닿지 않는다 — 박스는 그대로 보고되는데도', async () => {
      await mount('<div style="width:40px;height:30px;overflow:hidden;position:relative">' +
        '<button style="position:absolute;left:50px;width:30px;height:30px">x</button></div>');
      const button = document.querySelector('button')!;
      expect(Math.round(button.getBoundingClientRect().width), '크기만 보면 통과처럼 보인다').toBe(30);
      expect(pointsOf(button)).toEqual(ALL);
    });

    it('🔴반쯤 잘린 버튼은 잘린 쪽 가장자리만 닿지 않는다 (중심만 재면 놓친다)', async () => {
      await mount('<div style="width:40px;height:30px;overflow:hidden;position:relative">' +
        '<button style="position:absolute;left:20px;width:30px;height:30px">x</button></div>');
      expect(pointsOf(document.querySelector('button')!)).toEqual(['오른']);
    });

    it('🔴다른 요소에 덮인 버튼은 닿지 않는다', async () => {
      await mount('<div style="position:relative"><button style="width:30px;height:30px">x</button>' +
        '<div style="position:absolute;inset:0;width:30px;height:30px"></div></div>');
      expect(pointsOf(document.querySelector('button')!)).toEqual(ALL);
    });

    it('뷰포트 밖이어도 창을 스크롤해 닿으면 닿는다 — 그리고 스크롤은 돌려놓는다', async () => {
      await mount('<div style="width:3000px"><button style="margin-left:2600px;width:30px;height:30px">x</button></div>');
      expect(pointsOf(document.querySelector('button')!)).toEqual([]);
      expect(window.scrollX).toBe(0);
    });

    it('🔴뷰포트보다 넓은 타깃도 양 끝이 닿는다 — 점마다 드러낸다', async () => {
      await mount('<button style="width:2500px;height:30px">wide</button>');
      expect(pointsOf(document.querySelector('button')!)).toEqual([]);
    });

    it('사용자 스크롤 컨테이너(overflow:auto) 밖에 있는 타깃은 그 컨테이너를 스크롤해 닿는다', async () => {
      // ⚠높이는 가로 스크롤바가 생겨도 버튼(30)이 들어갈 만큼 — 40 이면 스크롤바가 위아래 끝을 가려 픽스처가 틀린다.
      await mount('<div id="sc" style="width:100px;height:60px;overflow:auto"><div style="width:600px">' +
        '<button style="margin-left:500px;width:30px;height:30px">x</button></div></div>');
      expect(pointsOf(document.querySelector('button')!)).toEqual([]);
      expect(document.getElementById('sc')!.scrollLeft).toBe(0);
    });

    it('🔴overflow:hidden 컨테이너는 스크롤하지 않는다 — 잘린 타깃은 잘린 채로 남는다(scrollIntoView 는 이것을 드러낸다)', async () => {
      await mount('<div style="width:100px;height:40px;overflow:hidden"><div style="width:600px">' +
        '<button style="margin-left:500px;width:30px;height:30px">x</button></div></div>');
      expect(pointsOf(document.querySelector('button')!)).toEqual(ALL);
    });

    it('섀도 안 링크에 슬롯으로 꽂힌 글자 위의 점도 그 링크가 받은 것으로 센다(retarget 보정)', async () => {
      const name = 'zz-hit-slot-link';
      if (!customElements.get(name)) {
        customElements.define(name, class extends HTMLElement {
          constructor() {
            super();
            this.attachShadow({ mode: 'open' }).innerHTML =
              '<a href="#x" style="display:inline-block;padding:4px"><slot></slot></a>';
          }
        });
      }
      await mount(`<${name}>Linked text</${name}>`);
      expect(pointsOf(document.querySelector(name)!.shadowRoot!.querySelector('a')!)).toEqual([]);
    });

    it('⚪NEGATIVE — 이웃 타깃이 가장자리를 덮어도 봐주지 않는다 (이웃에 양보하는 면제는 없다)', async () => {
      await mount('<div style="display:flex"><button id="a" style="width:40px;height:30px;margin-right:-3px">a</button>' +
        '<button id="b" style="width:40px;height:30px;position:relative">b</button></div>');
      expect(pointsOf(document.getElementById('a')!)).toEqual(['오른']);
    });
  });

  describe('🔴 대상 도출 — 등록된 태그가 규칙 표를 벗어나지 않는다', () => {
    it('배럴이 태그를 실제로 등록한다 (도출이 0건이면 아래 단언이 전부 공허해진다)', () => {
      expect(registered.length).toBeGreaterThan(0);
    });

    it('등록된 모든 태그가 세 집합 중 정확히 하나에 분류돼 있다', () => {
      const unclassified = registered.filter(
        (t) => !NOT_A_TARGET.has(t) && !NEEDS_FIXTURE.has(t) && !(t in FIXTURES),
      );
      expect(unclassified,
        `분류되지 않은 태그가 있다 — 새 컴포넌트라면 규칙 표에 넣을 것: ${unclassified.join(' ')}`,
      ).toEqual([]);
    });

    it('📌커버리지를 보고한다 — 「미판정」은 통과가 아니다', () => {
      const unjudged = [...NEEDS_FIXTURE].sort();
      // ⚠이 단언은 «미판정이 늘지 않았는가»를 지킨다. 픽스처를 쓰면 이 수가 줄고 그때 이
      //   줄을 함께 고치는 것이 그 작업의 완료 신호다.
      // 🔴«판정» 은 태그 수와 **상태 수**를 함께 말한다 — 태그만 세면 열린 상태를 빠뜨려도 이 줄이 변하지 않는다.
      const states = Object.values(FIXTURES).flat().length;
      expect(
        `판정 ${Object.keys(FIXTURES).length}(${states}상태) · 미판정 ${unjudged.length}(${unjudged.join(' ')})` +
        ` · 대상아님 ${NOT_A_TARGET.size} · 인라인예외 ${INLINE_PROSE.size}`,
      ).toBe('판정 1(4상태) · 미판정 0() · 대상아님 1 · 인라인예외 0');
    });

    it('규칙 표에 «등록되지 않은» 이름이 남아 있지 않다 (표가 낡지 않게)', () => {
      const known = new Set(registered);
      const stale = [...NOT_A_TARGET, ...NEEDS_FIXTURE, ...Object.keys(FIXTURES)]
        .filter((t) => !known.has(t));
      expect(stale, `등록되지 않은 이름: ${stale.join(' ')}`).toEqual([]);
    });
  });

  describe('실측 — 픽스처를 가진 모든 타깃', () => {
    const CASES = Object.entries(FIXTURES).flatMap(([tag, entry]) =>
      (Array.isArray(entry) ? entry : [entry]).map((fixture) => ({ tag, fixture })));
    for (const { tag, fixture } of CASES) {
      const name = `${tag}${fixture.state ? ` [${fixture.state}]` : ''}`;
      const pinned = UNDERSIZED_PINS.has(tag) || UNDERSIZED_PINS.has(name);
      const inline = INLINE_PROSE.has(tag);
      const label = pinned
        ? '📌미달로 «핀»돼 있다 (사람 판단 대기)'
        : inline
          ? '「인라인」 예외 — 크기 하한을 적용하지 않되 실측은 보고한다'
          : 'SC 2.5.8 을 만족한다';
      it(`${name}: ${label}`, async () => {
        await mount(fixture.html, fixture.settle);
        if (fixture.prepare) await fixture.prepare(document.querySelector(tag)!);
        const els = (fixture.targets ? fixture.targets(tag) : [document.querySelector(tag)!]).map(resolveTarget);
        const targets = els.map(measure);
        expect(targets.length, '타깃을 하나도 못 찾으면 이 판정은 무의미하다').toBeGreaterThan(0);

        // 🔴크기보다 먼저 — 그 타깃이 실제로 눌리는가. 잘렸거나 가려졌거나 닫혀 있으면 크기 판정은 의미가 없다.
        //   (세 게이트 공통 · 인라인 예외도 «눌린다» 는 전제는 면제하지 않는다.)
        const unreachable = els
          .map((el) => ({ el, misses: unreachablePoints(el) }))
          .filter(({ misses }) => misses.length > 0)
          .map(({ el, misses }) => `${describeEl(el)} — ${misses.map((m) => `${m.point}→${m.hit}`).join(' · ')}`);
        expect(unreachable, '누르면 다른 요소가 받는 타깃 — 잘렸거나 가려졌거나 닫혀 있다').toEqual([]);
        const verdicts = targets.map((t, i) =>
          fixture.spacingIsOurs ? judge(t, targets.filter((_, j) => j !== i)) : judge(t, [t]),
        );
        const detail = `실측 ${targets.map((t) => `${Math.round(t.w)}x${Math.round(t.h)}`).join(' ')} · 판정 ${verdicts.join(' ')}`;

        if (pinned) {
          expect(verdicts.some((v) => v === 'undersized'), detail).toBe(true);
        } else if (inline) {
          const host = document.querySelector(tag)!;
          expect(getComputedStyle(host).display, `${detail} · 인라인이 아니면 면제 근거가 없다`)
            .toMatch(/^inline/);
        } else {
          expect(verdicts.every((v) => v !== 'undersized'), detail).toBe(true);
        }
      });
    }
  });
});
