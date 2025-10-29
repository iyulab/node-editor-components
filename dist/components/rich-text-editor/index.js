import e from "react";
import { createComponent as o } from "@lit/react";
import { RichTextEditor as t } from "./RichTextEditor.js";
customElements.define("u-rich-text-editor", t);
const c = o({
  react: e,
  tagName: "u-rich-text-editor",
  elementClass: t
});
export {
  t as RichTextEditor,
  c as URichTextEditor
};
