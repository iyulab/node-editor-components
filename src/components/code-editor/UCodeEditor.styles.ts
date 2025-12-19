import { css } from 'lit';

export const styles = css`
  :host {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    --header-height: 32px;
  }
  :host([noHeader]) {
    --header-height: 0px;
  }

  .header {
    position: relative;
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
    position: absolute;
    width: 100%;
    height: calc(100% - var(--header-height));
    overflow: hidden;

    main {
      width: 100%;
      height: 100%;
    }
  }
`;