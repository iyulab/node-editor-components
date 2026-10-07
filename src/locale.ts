import { Locale } from '@iyulab/components/dist/utilities/Locale.js';

/**
 * Strings `@iyulab/editor-components` draws itself — registered in the shared `Locale` chain of
 * `@iyulab/components`, so `Locale.set('ko')` reaches them. English and Korean are built in; add others with
 * `editorLocale.register('<tag>', { … })`.
 */
export type EditorMessageKey = 'tabFocusHint' | 'codeEditor' | 'richTextEditor';

export const editorLocale = Locale.namespace<EditorMessageKey>('editor-components');

editorLocale.register('en', {
  codeEditor: 'Editor',
  richTextEditor: 'Rich Text Editor',
  tabFocusHint: 'Tab indents. To move the focus out with Tab, press Ctrl+M first (Ctrl+Shift+M on macOS).',
});

editorLocale.register('ko', {
  codeEditor: '편집기',
  richTextEditor: '서식 편집기',
  tabFocusHint: 'Tab 은 들여쓰기입니다. Tab 으로 편집기를 벗어나려면 먼저 Ctrl+M(macOS 는 Ctrl+Shift+M)을 누르세요.',
});
