import React from "react";
import { createComponent } from "@lit/react";
import { RichTextEditor } from "./RichTextEditor";

customElements.define("u-rich-text-editor", RichTextEditor)

declare global {
  interface HTMLElementTagNameMap {
    "u-rich-text-editor": RichTextEditor;
  }
}

const URichTextEditor = createComponent({
  react: React,
  tagName: "u-rich-text-editor",
  elementClass: RichTextEditor
})

export {
  RichTextEditor,
  URichTextEditor
}