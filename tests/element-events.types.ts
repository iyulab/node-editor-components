/**
 * Element event typing — **compiling is the test** (`tsconfig` includes `tests/**`; nothing executes).
 * `<u-text-editor>`'s `change` is a CustomEvent with the edited content; before, a TypeScript listener got the
 * native `Event` and `e.detail.html` failed to compile.
 */
import '../src/components/text-editor/UTextEditor.js';

export function typedEditorEvents(): void {
  const editor = document.createElement('u-text-editor');
  editor.addEventListener('change', (e) => {
    const html: string = e.detail.html;
    const text: string = e.detail.text;
    void html;
    void text;
  });
}
