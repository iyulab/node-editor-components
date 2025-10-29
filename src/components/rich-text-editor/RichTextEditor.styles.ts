import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    border: 1px solid var(--sl-color-neutral-300);
    border-radius: var(--sl-border-radius-medium);
    background: var(--sl-color-neutral-0);
    overflow: hidden;
  }

  :host([theme="dark"]) {
    border-color: var(--sl-color-neutral-700);
    background: var(--sl-color-neutral-900);
  }

  .header {
    display: flex;
    align-items: center;
    padding: var(--sl-spacing-small) var(--sl-spacing-medium);
    border-bottom: 1px solid var(--sl-color-neutral-200);
    background: var(--sl-color-neutral-50);
    min-height: 48px;
    gap: var(--sl-spacing-small);
  }

  :host([theme="dark"]) .header {
    border-bottom-color: var(--sl-color-neutral-700);
    background: var(--sl-color-neutral-800);
  }

  .title {
    font-weight: var(--sl-font-weight-semibold);
    color: var(--sl-color-neutral-700);
  }

  :host([theme="dark"]) .title {
    color: var(--sl-color-neutral-300);
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
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-medium);
    line-height: var(--sl-line-height-normal);
  }

  .ql-toolbar {
    border: none !important;
    border-bottom: 1px solid var(--sl-color-neutral-200) !important;
    background: var(--sl-color-neutral-50);
  }

  :host([theme="dark"]) .ql-toolbar {
    border-bottom-color: var(--sl-color-neutral-700) !important;
    background: var(--sl-color-neutral-800);
  }

  .ql-container {
    border: none !important;
    font-family: var(--sl-font-sans);
  }

  .ql-editor {
    padding: var(--sl-spacing-medium);
    color: var(--sl-color-neutral-700);
  }

  :host([theme="dark"]) .ql-editor {
    color: var(--sl-color-neutral-300);
    background: var(--sl-color-neutral-900);
  }

  .ql-toolbar .ql-stroke {
    stroke: var(--sl-color-neutral-600);
  }

  .ql-toolbar .ql-fill {
    fill: var(--sl-color-neutral-600);
  }

  :host([theme="dark"]) .ql-toolbar .ql-stroke {
    stroke: var(--sl-color-neutral-400);
  }

  :host([theme="dark"]) .ql-toolbar .ql-fill {
    fill: var(--sl-color-neutral-400);
  }

  .ql-toolbar button:hover .ql-stroke {
    stroke: var(--sl-color-primary-600);
  }

  .ql-toolbar button:hover .ql-fill {
    fill: var(--sl-color-primary-600);
  }

  .ql-toolbar button.ql-active .ql-stroke {
    stroke: var(--sl-color-primary-600);
  }

  .ql-toolbar button.ql-active .ql-fill {
    fill: var(--sl-color-primary-600);
  }
`;