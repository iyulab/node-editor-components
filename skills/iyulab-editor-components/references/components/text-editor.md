# u-text-editor

```ts
import '@iyulab/editor-components/dist/components/text-editor/UTextEditor.js';
```

**Tag:** `u-text-editor`

Rich text editor built on [Quill](https://quilljs.com/). Reads and writes HTML, plain text, or Quill Delta.

```html
<u-text-editor placeholder="Start writing..." .value=${"<p>Hello</p>"}></u-text-editor>

<!-- Without header, custom toolbar -->
<u-text-editor headless .toolbar=${[['bold', 'italic'], ['link']]}></u-text-editor>
```

---

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `headless` | `boolean` | `false` | ✓ | Hides the header (label + `header-actions` slot) |
| `label` | `string` | `'Rich Text Editor'` | — | Header title text |
| `readOnly` | `boolean` | `false` | — | Prevents user input |
| `placeholder` | `string` | `'Start writing...'` | — | Placeholder shown when empty |
| `value` | `string` | `''` | — | Current content as HTML |
| `height` | `number` | `300` | — | Height of the **editing area** in pixels — see [Sizing](#sizing) |
| `toolbar` | `string[][]` | `undefined` | — | Custom toolbar configuration. When left unset, falls back at runtime to Quill's default 14-group toolbar (not a declared property default) |

## Sizing

`height` sets the **editing area**. The host box is that plus the header, so `height="300"` renders
an element about 349px tall (48px header + 300px + border); `headless` removes the header.

**A CSS `height` on the host does not resize the editing area** — it resizes only the host box. Set
it smaller and the editing area overflows past the box, and is deliberately *not* clipped, because
Quill's floating UI (picker lists, the link tooltip) has to be able to leave it. Set it larger — or
use `height: 100%` — and empty space is left below. So express a parent-filling layout through the
property, not CSS:

```html
<!-- ✗ the host box becomes 150px; the editing area stays 300px and overflows it -->
<u-text-editor style="height: 150px" height="300"></u-text-editor>

<!-- ✓ -->
<u-text-editor .height=${containerHeight - 48}></u-text-editor>
```

⚠ `u-code-editor` is the opposite: it has no `height` property and fills the host box
(`height: 100%`). A layout that works for one does not transfer to the other unchanged.

## Methods

| Method | Returns | Description |
|--------|---------|--------------|
| `getHTML()` | `string` | Current content as HTML |
| `getText()` | `string` | Current content as plain text |
| `getDelta()` | `QuillDelta \| null` | Current content as a Quill Delta |
| `setHTML(html)` | `void` | Set content from HTML (same as setting `.value`) |
| `setDelta(delta)` | `void` | Set content from a Quill Delta |
| `clear()` | `void` | Clear all content |
| `focus()` | `void` | Focus the editor |

`setHTML`/`setDelta`/`clear` are programmatic — like the `value` property path, they do not fire `change`.

## Slots

| Name | Description |
|------|-------------|
| `header-actions` | Content placed at the end of the header (e.g. extra toolbar buttons) |

## Events

| Event | Detail | Description |
|-------|--------|--------------|
| `change` | `{ html: string, text: string, delta: QuillDelta }` | Fired only for user edits (Quill `source === 'user'`) — composed so it crosses the shadow boundary |

## CSS Custom Properties

`UTextEditor` doesn't declare any custom properties of its own — its styles read the shared
`@iyulab/components` design tokens directly (`--u-border-color`, `--u-panel-bg-color`,
`--u-txt-color`, `--u-txt-color-weak`, `--u-bg-color-hover`, `--u-radius-md`, `--u-primary-color`,
`--u-font-base`), so it re-themes automatically with the rest of the library and has nothing
component-specific to override.
