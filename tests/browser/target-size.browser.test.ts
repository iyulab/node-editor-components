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
 * 이 패키지의 타깃은 대부분 `part` 가 붙지 않은 내부 컨트롤(`button.nav-button` ·
 * `a.caption` · `th`)이라 셀렉터 하나로 충분하다. 쓰지 않는 헬퍼를 «나중에 쓸지도»로
 * 남겨 두면 그것이 곧 고아 코드다.
 */
function inShadow(host: Element, sel: string): Element[] {
  const root = (host as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot;
  return root ? Array.from(root.querySelectorAll(sel)) : [];
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
 * 포인터 타깃이 아닌 것 — 대화 스트림에 그려지는 **표시물**과 레이아웃 컨테이너.
 * 사용자가 «활성화»하는 영역이 아니므로 자를 대면 정당한 블록 전건에 발화한다.
 */
const NOT_A_TARGET = new Set<string>([]);

/**
 * 🔴**이 환경에서 «모듈 자체를 로드할 수 없는» 것 — 통과도 미달도 아니다.**
 *
 * `u-code-editor` 는 `monaco-editor/min/vs/editor/editor.main.css?inline` 을 import 하는데
 * 이 워크스페이스의 Vite 가 그것을 풀지 못한다(실측 오류 그대로):
 *
 *     Failed to resolve import "monaco-editor/min/vs/editor/editor.main.css?inline"
 *     from "src/components/code-editor/UCodeEditor.ts". Does the file exist?
 *
 * ⚠**파일은 실재한다**(`node_modules/monaco-editor/min/vs/editor/editor.main.css`) — 해석의
 * 문제다. 그리고 ***이 리포에서 그 import 를 실제로 해석해 본 것이 없다***: 빌드는 monaco 를
 * `external` 로 빼고(`vite.config.ts`), 기존 브라우저 테스트 둘은 배럴 대신
 * `UTextEditor.js` 만 직접 import 한다. 배럴을 임포트한 것은 이 게이트가 처음이고 곧바로
 * 걸렸다 ⇒ **소비자에게 같은 일이 일어나는지는 «모른다»** (Carry-Forward 로 올렸다).
 *
 * ⚠**«대상 아님»으로 넘기지 않는다.** 그것은 «잴 것이 없다»는 뜻인데 여기는 «잴 수 없다»다 —
 * cycle-485 가 정확히 이 둘을 혼동해 결함을 놓쳤다.
 */
const CANNOT_LOAD = new Set(['u-code-editor']);

/**
 * 타깃을 «갖고 있지만» 아직 대표 픽스처를 쓰지 않은 것.
 * ⚠**이 목록은 「통과」가 아니라 「미판정」이다.**
 */
const NEEDS_FIXTURE = new Set<string>([]);

/**
 * 🔴**측정 결과 미달인데 «치수를 올리는 것이 시각적 공개 계약 변경»이라 사람 판단이 필요한 것.**
 * 여기 있는 동안 이 파일은 그것을 **미달로 단언**하므로 스위트는 초록이고, 치수를 올리면
 * 빨개진다 — 그때 이 집합에서 빼는 것이 완료 신호다.
 */
const UNDERSIZED_PINS = new Set<string>([]);

/**
 * 🔴**SC 2.5.8 「인라인」 예외** — *"타깃이 문장 안에 있거나, 그 크기가 타깃 아닌 텍스트의
 * `line-height` 에 의해 제약되는 경우"* 는 규격이 명시적으로 면제한다.
 *
 * `u-ref-tag` 는 답변 본문 **문장 안에** 삽입되는 인용 배지다(마크다운 렌더가 `ref` 자리
 * 표시자를 이 태그로 바꾼다). 실측 **10×15** 인데, 이것을 24px 로 키우면 ***줄 높이를 밀어
 * 본문 조판이 깨진다*** — 규격이 이 예외를 둔 이유가 정확히 그것이다.
 *
 * ⚠**면제는 이름으로 좁게 준다** — 「인라인처럼 보이는 것」을 자동 판정하려면 문맥을 읽어야
 * 하고, 넓은 면제는 조용한 미탐이 된다(`u-widgets` 게이트가 같은 규칙을 같은 이유로 쓴다).
 * ⚠**면제해도 재기는 한다** — 픽스처를 유지하므로 실측값이 테스트 이름과 함께 보고된다.
 */
const INLINE_PROSE = new Set<string>([]);

interface Fixture {
  html: string;
  /** 이 픽스처 안의 «타깃»들. 생략하면 태그 자신. */
  targets?: (tag: string) => Element[];
  /**
   * 🔴**이 컴포넌트가 «타깃들 사이의 간격»을 스스로 소유하는가.** 기본값은 «간격 예외를
   * 쓰지 않는다»(크기로만 판정) — 고립 픽스처에 예외를 적용하면 무엇이든 통과한다.
   */
  spacingIsOurs?: true;
  /** 렌더가 비동기인 블록(마크다운 파싱·이미지 로드 등)을 위한 추가 대기(ms). */
  settle?: number;
}

/** 실제로 재는 것 — 대표 픽스처와 그 안의 타깃. */
const FIXTURES: Record<string, Fixture> = {
  'u-text-editor': {
    // Quill 툴바 버튼. ⚠**우리가 치수를 정하지 않는다**(색만 덮어쓴다 — `.ql-stroke`/`.ql-fill`)
    //   — 그럼에도 재는 이유는 위 머리말 참조. 툴바 버튼은 서로 **붙어 있으므로** 간격 예외를
    //   켠다(그 예외가 실제로 일하는 자리다 — cycle-496 이 세운 기준).
    html: '<u-text-editor style="width:480px;height:200px"></u-text-editor>',
    targets: () => inShadow(document.querySelector('u-text-editor')!, '.ql-toolbar button'),
    spacingIsOurs: true,
    settle: 400,
  },
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

  /* ⚠**배럴(`src/index.js`)을 임포트하지 않는다** — 그것이 `u-code-editor` 를 끌어오고,
     그 모듈이 이 환경에서 해석되지 않아 **스위트 전체가 로드 실패**한다(위 CANNOT_LOAD 참조).
     ⇒ 로드 가능한 것만 직접 임포트한다. **이것은 도출의 후퇴이고 그 사실을 숨기지 않는다**:
     새 컴포넌트가 생기면 여기 한 줄을 더해야 보인다. 원상 복구 조건은 monaco import 해석이
     이 워크스페이스에서 되는 것이다. */
  await import('../../src/components/text-editor/UTextEditor.js');
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

  describe('🔴 대상 도출 — 등록된 태그가 규칙 표를 벗어나지 않는다', () => {
    it('배럴이 태그를 실제로 등록한다 (도출이 0건이면 아래 단언이 전부 공허해진다)', () => {
      // ⚠이 패키지가 소유한 태그는 둘인데 하나는 로드 불가라, 실제로 등록되는 것은 하나다.
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
      //   줄을 함께 고치는 것이 그 작업의 완료 신호다. 숫자를 문자열로 고정하는 이유는
      //   `components` 쪽과 같다 — 분류를 바꾸면 반드시 여기도 손대게 만든다.
      expect(
        `판정 ${Object.keys(FIXTURES).length} · 미판정 ${unjudged.length}(${unjudged.join(' ')})` +
        ` · 대상아님 ${NOT_A_TARGET.size} · 인라인예외 ${INLINE_PROSE.size}` +
        ` · 로드불가 ${[...CANNOT_LOAD].sort().join(' ')}`,
      ).toBe('판정 1 · 미판정 0() · 대상아님 0 · 인라인예외 0 · 로드불가 u-code-editor');
    });

    it('규칙 표에 «등록되지 않은» 이름이 남아 있지 않다 (표가 낡지 않게)', () => {
      const known = new Set(registered);
      // ⚠CANNOT_LOAD 는 «등록되지 않는 것이 정상»이라 stale 판정에서 뺀다 — 그 대신
      //   커버리지가 이름을 그대로 보고한다(침묵하지 않는다).
      const stale = [...NOT_A_TARGET, ...NEEDS_FIXTURE, ...Object.keys(FIXTURES)]
        .filter((t) => !known.has(t) && !CANNOT_LOAD.has(t));
      expect(stale, `등록되지 않은 이름: ${stale.join(' ')}`).toEqual([]);
    });
  });

  describe('실측 — 픽스처를 가진 모든 타깃', () => {
    for (const [tag, fixture] of Object.entries(FIXTURES)) {
      const pinned = UNDERSIZED_PINS.has(tag);
      const inline = INLINE_PROSE.has(tag);
      const label = pinned
        ? '📌미달로 «핀»돼 있다 (사람 판단 대기)'
        : inline
          ? '「인라인」 예외 — 크기 하한을 적용하지 않되 실측은 보고한다'
          : 'SC 2.5.8 을 만족한다';
      it(`${tag}: ${label}`, async () => {
        await mount(fixture.html, fixture.settle);
        const targets = (fixture.targets ? fixture.targets(tag) : [document.querySelector(tag)!])
          .map(resolveTarget)
          .map(measure);
        expect(targets.length, '타깃을 하나도 못 찾으면 이 판정은 무의미하다').toBeGreaterThan(0);

        const verdicts = targets.map((t, i) =>
          fixture.spacingIsOurs ? judge(t, targets.filter((_, j) => j !== i)) : judge(t, [t]),
        );
        const detail = `실측 ${targets.map((t) => `${Math.round(t.w)}x${Math.round(t.h)}`).join(' ')} · 판정 ${verdicts.join(' ')}`;

        if (pinned) {
          expect(verdicts.some((v) => v === 'undersized'), detail).toBe(true);
        } else if (inline) {
          /* 크기 하한은 적용하지 않는다. 대신 **예외의 전제**를 잰다 — 이 컴포넌트가 실제로
             문장 안을 «인라인으로 흐르는가». 블록이 되면 더 이상 문장 안의 타깃이 아니고
             면제 근거가 사라진다 ⇒ 면제가 조용히 넓어지는 것을 막는 자리다.
             ⚠재는 것은 **호스트**다 — 섀도 안쪽 `a` 는 `display: block` 이어도 무방하다
             (문장의 흐름을 정하는 것은 호스트의 display 다). */
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
