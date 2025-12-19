import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    border: 1px solid var(--u-neutral-300);
    border-radius: 4px;
    background: var(--u-neutral-0);
    overflow: hidden;
  }

  :host([theme="dark"]) {
    border-color: var(--u-neutral-700);
    background: var(--u-neutral-900);
  }

  .header {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid var(--u-neutral-200);
    background: var(--u-neutral-50);
    min-height: 48px;
    gap: 12px;
  }

  :host([theme="dark"]) .header {
    border-bottom-color: var(--u-neutral-700);
    background: var(--u-neutral-800);
  }

  .title {
    font-weight: 600;
    color: var(--u-neutral-700);
  }

  :host([theme="dark"]) .title {
    color: var(--u-neutral-300);
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

  .ql-editor {
    font-family: var(--u-font-base);
    font-size: 24px;
    line-height: 1.6;
  }

  .ql-toolbar {
    border: none !important;
    border-bottom: 1px solid var(--u-neutral-200) !important;
    background: var(--u-neutral-50);
  }

  :host([theme="dark"]) .ql-toolbar {
    border-bottom-color: var(--u-neutral-700) !important;
    background: var(--u-neutral-800);
  }

  .ql-container {
    border: none !important;
    font-family: var(--u-font-base);
  }

  .ql-editor {
    padding: 20px;
    color: var(--u-neutral-700);
  }

  :host([theme="dark"]) .ql-editor {
    color: var(--u-neutral-300);
    background: var(--u-neutral-900);
  }

  .ql-toolbar .ql-stroke {
    stroke: var(--u-neutral-600);
  }

  .ql-toolbar .ql-fill {
    fill: var(--u-neutral-600);
  }

  :host([theme="dark"]) .ql-toolbar .ql-stroke {
    stroke: var(--u-neutral-400);
  }

  :host([theme="dark"]) .ql-toolbar .ql-fill {
    fill: var(--u-neutral-400);
  }

  .ql-toolbar button:hover .ql-stroke {
    stroke: var(--u-blue-600);
  }

  .ql-toolbar button:hover .ql-fill {
    fill: var(--u-blue-600);
  }

  .ql-toolbar button.ql-active .ql-stroke {
    stroke: var(--u-blue-600);
  }

  .ql-toolbar button.ql-active .ql-fill {
    fill: var(--u-blue-600);
  }
`;