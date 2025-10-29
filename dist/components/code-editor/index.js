import o from "react";
import { createComponent as t } from "@lit/react";
import { CodeEditor as e } from "./CodeEditor.js";
customElements.define("u-code-editor", e);
const d = t({
  react: o,
  tagName: "u-code-editor",
  elementClass: e,
  events: {
    onChange: "change"
  }
});
export {
  e as CodeEditor,
  d as UCodeEditor
};
