import { RichTextEditor } from './RichTextEditor';
declare global {
    interface HTMLElementTagNameMap {
        "u-rich-text-editor": RichTextEditor;
    }
}
declare const URichTextEditor: import('@lit/react').ReactWebComponent<RichTextEditor, {}>;
export { RichTextEditor, URichTextEditor };
