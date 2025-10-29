import React from "react";
import { createComponent } from "@lit/react";
import { CodeEditor } from "./CodeEditor";

customElements.define("u-code-editor", CodeEditor);

declare global {
  interface HTMLElementTagNameMap {
    "u-code-editor": CodeEditor;
  }
}

const UCodeEditor = createComponent({
  react: React,
  tagName: "u-code-editor",
  elementClass: CodeEditor,
  events: {
    onChange: "change",
  }
})

export { 
  CodeEditor,
  UCodeEditor 
};