import { css } from 'lit';

export const styles = css`
  /* 크기는 «호스트 상자» 가 정한다 — monaco 는 automaticLayout 으로 컨테이너를 따라온다.
     ⚠부모가 auto 높이면 height:100% 가 무효라 편집 영역이 0 이 된다(계약으로 문서에 적었다).
     머리글 높이를 숫자로 가정하지 않는다 — 세로 flex 가 «머리글을 뺀 나머지» 를 편집 영역에 준다.
     종전에는 --header-height: 32px 를 빼는 계산이었는데 실제 머리글은 24px 라 8px 을 못 쓰고 있었다
     (형제 u-text-editor 에서 같은 부류의 «툴바 높이를 숫자로 가정» 을 걷어낸 것과 같은 이유). */
  :host {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .header {
    position: relative;
    flex: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 24px;
    gap: 4px;
    padding: 4px;

    .title {
      font-size: 16px;
      line-height: 20px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .flex {
      flex: 1;
    }
  }

  .editor {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    overflow: hidden;

    main {
      width: 100%;
      height: 100%;
    }
  }
`;