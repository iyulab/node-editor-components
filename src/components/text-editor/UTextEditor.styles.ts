import { css } from "lit";

/**
 * 색은 전부 **역할 토큰**으로 읽는다.
 *
 * 종전에는 팔레트(`--u-neutral-*`)를 읽고 다크 테마를 `:host([theme="dark"])` 블록
 * 8쌍으로 따로 구현했다. ★**그 블록들은 한 번도 매치되지 않는 죽은 코드였다** — 세 겹으로:
 *
 * ⑴ `theme` 프로퍼티가 `reflect` 되지 않아 **속성이 생기지 않았다**(작성자가 마크업에
 *    직접 적은 경우에만 매치됐다).
 * ⑵ 그마저도 `connectedCallback` 이 프로퍼티를 덮어써 소비자 지정이 무시됐다.
 * ⑶ `Theme.get()` 은 선호를 돌려주므로 기본값 `'system'` 에서 `theme="system"` 이 됐다.
 *
 * ⚠**매치되지 않은 것이 다행이었다.** 그 블록들은 팔레트가 테마에 따라 뒤집히지
 * **않는다**고 가정하고 쓰였다 — 다크 배경으로 `--u-neutral-900` 을 지정하는데, 그 토큰은
 * 다크 시트에서 **#D4D4D4(밝은 회색)** 다. 매치됐다면 다크 모드가 깨졌을 것이다.
 * 기반 규칙(`--u-neutral-0` 등)은 팔레트 반전 덕에 이미 테마를 따라가고 있었다.
 *
 * ⇒ 이 변경으로 실제로 달라지는 것은 **⒜ 강조색이 `--u-primary-color` 를 따라와
 * 재브랜딩이 가능해진 것**(종전에는 `--u-blue-600` 하드와이어)과 **⒝ 기계적으로 뒤집힌
 * 팔레트 단 대신 테마별로 조율된 시맨틱 단을 쓰는 것**이다. 죽은 코드 제거는 부수 효과다.
 * 색 선언 수 25 → 9.
 */
export const styles = css`
  /* 호스트는 자르지 않는다 — Quill 의 떠 있는 UI(선택기 목록 · 링크 툴팁)는 편집기 상자 밖으로 나갈 수 있어야 한다.
     종전 overflow: hidden 은 짧은 편집기에서 그것들을 잘라 누를 수 없게 만들었다. 둥근 모서리는 배경을 칠하는
     머리글(과 머리글이 없을 때의 툴바)이 자기 위 모서리를 둥글게 해서 지킨다. */
  :host {
    display: block;
    border: 1px solid var(--u-border-color, #E0E0E0);
    border-radius: var(--u-radius-md, 4px);
    background: var(--u-panel-bg-color, #FFFFFF);
  }

  .header {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid var(--u-border-color-weak, #EEEEEE);
    background: var(--u-bg-color-hover, #F5F5F5);
    min-height: 48px;
    gap: 12px;
    border-radius: calc(var(--u-radius-md, 4px) - 1px) calc(var(--u-radius-md, 4px) - 1px) 0 0;
  }

  :host([headless]) .ql-toolbar {
    border-radius: calc(var(--u-radius-md, 4px) - 1px) calc(var(--u-radius-md, 4px) - 1px) 0 0;
  }

  .title {
    font-weight: 600;
    color: var(--u-txt-color, #212121);
  }

  .flex {
    flex: 1;
  }

  .editor {
    position: relative;
    height: 300px;
  }

  .quill-container {
    height: 100%;
  }

  /* 편집 영역은 «높이에서 툴바를 뺀 나머지» 다 — 툴바 높이를 숫자로 가정하지 않는다(좁으면 툴바가 여러 줄로 접힌다).
     종전에는 편집 영역을 height - 42px 로 줘, 툴바가 접히면 편집 영역이 상자 밖으로 밀려나 아래가 잘렸다.
     ⚠Quill 은 넘겨받은 요소(.quill-container)를 .ql-container 로 만들고, 툴바를 그 «앞 형제» 로 .editor 안에 넣는다 —
     그래서 세로 배치의 주인은 .editor 다. */
  .editor {
    display: flex;
    flex-direction: column;
  }

  .editor > .ql-toolbar {
    flex: none;
  }

  .editor > .ql-container {
    flex: 1 1 auto;
    min-height: 0;
    height: auto;
    display: flex;
    flex-direction: column;
  }

  .ql-container > .ql-editor {
    flex: 1 1 auto;
    min-height: 0;
    height: auto;
  }

  .ql-editor {
    font-family: var(--u-font-base);
    font-size: 24px;
    line-height: 1.6;
  }

  .ql-toolbar {
    border: none !important;
    border-bottom: 1px solid var(--u-border-color-weak, #EEEEEE) !important;
    background: var(--u-bg-color-hover, #F5F5F5);
  }

  .ql-container {
    border: none !important;
    font-family: var(--u-font-base);
  }

  .ql-editor {
    padding: 20px;
    color: var(--u-txt-color, #212121);
  }

  .ql-toolbar .ql-stroke {
    stroke: var(--u-txt-color-weak, #616161);
  }

  .ql-toolbar .ql-fill {
    fill: var(--u-txt-color-weak, #616161);
  }

  /* 강조는 역할 토큰 경유 — 소비자가 브랜드를 바꾸면 함께 따라온다. */
  .ql-toolbar button:hover .ql-stroke,
  .ql-toolbar button.ql-active .ql-stroke {
    stroke: var(--u-primary-color, #1976D2);
  }

  .ql-toolbar button:hover .ql-fill,
  .ql-toolbar button.ql-active .ql-fill {
    fill: var(--u-primary-color, #1976D2);
  }
`;
