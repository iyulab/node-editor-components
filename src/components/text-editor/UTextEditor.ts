import { UTextEditor } from "./UTextEditor.component.js";

UTextEditor.define("u-text-editor")

declare global {
  interface HTMLElementTagNameMap {
    "u-text-editor": UTextEditor;
  }
}

export { UTextEditor }