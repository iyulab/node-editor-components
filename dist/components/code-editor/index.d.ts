import { CodeEditor } from './CodeEditor';
declare global {
    interface HTMLElementTagNameMap {
        "u-code-editor": CodeEditor;
    }
}
declare const UCodeEditor: import('@lit/react').ReactWebComponent<CodeEditor, {
    onChange: string;
}>;
export { CodeEditor, UCodeEditor };
