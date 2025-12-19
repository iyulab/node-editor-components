import { UCodeEditor } from "./UCodeEditor.component.js";

UCodeEditor.define("u-code-editor");

declare global {
  interface HTMLElementTagNameMap {
    "u-code-editor": UCodeEditor;
  }
}

export { UCodeEditor };