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
| `label` | `string` | `undefined` | — | Header title text — also the editing area's accessible name (a wrapping `u-field`'s label names it when this is unset). Unset uses the locale string `richTextEditor` ('Rich Text Editor') |
| `placeholder` | `string` | `'Start writing...'` | — | Placeholder shown when empty |
| `value` | `string` | `''` | — | Current content as HTML — `''` while the editor is empty (Quill itself shows an empty paragraph then) |
| `name` | `string` | `undefined` | — | Submit name — with it the content goes into the surrounding `<form>`'s data, and `u-form` reads it into its model |
| `readonly` | `boolean` | `false` | ✓ | Prevents user input; the content stays selectable and scrollable (applies when changed after creation too) |
| `disabled` | `boolean` | `false` | ✓ | Prevents editing; an ancestor `<fieldset disabled>` does the same |
| `required` | `boolean` | `false` | ✓ | An empty editor is invalid (`valueMissing`); a submit attempt shows the message under the editor |
| `height` | `number` | `300` | — | Editing-area height in pixels **when the host has no height constraint** — see [Sizing](#sizing) |
| `toolbar` | `string[][]` | `undefined` | — | Custom toolbar configuration. When left unset, falls back at runtime to Quill's default 14-group toolbar (not a declared property default) |

## Form control

Like the native `<textarea>` it stands in for, the editor is a form-associated control (the `@iyulab/components` form
control base): with a `name` it submits its HTML (an empty editor submits `""`) with its `<form>`, `form.reset()` returns it to its `value` attribute,
`disabled` or an ancestor `<fieldset disabled>` stops editing, and `required` makes it invalid while empty — a submit
attempt (or `validate()`) shows the message under the editing area (`::part(footer)`) and marks the editing area
`aria-invalid`. Inside `u-form` it takes part in `model`, `validate()` and `reset()` like any other control.

```html
<form>
  <u-text-editor name="body" required></u-text-editor>
  <u-code-editor name="query" language="sql" value="select 1"></u-code-editor>
</form>
```

## Rendering the HTML elsewhere

`value` and `getHTML()` are HTML. The editor normalizes what it loads to its own formats, but HTML read back from
storage is whatever reached your server — anyone can send HTML to your API directly, without this editor. When you
render that HTML outside the editor (a read-only view, an email, another page) with `innerHTML`, sanitize it on the
server or where you render it, with an HTML sanitizer that keeps an allow-list of tags and attributes.

## Sizing

**The host box owns the height** (since 0.5.0 — the same contract as `u-code-editor`). Give the
host a CSS `height` or `max-height` and the header stays fixed while the editing area takes the
rest; `height: 100%` fills a parent. `height` (the property) is the editing area's **default**
when the host has no constraint: a plain `<u-text-editor>` is about 349px tall (48px header +
300px + border), `headless` removes the header.

The host never clips — Quill's floating UI (picker lists, the link tooltip) has to be able to
leave the box.

```html
<!-- ✓ the parent has a height, so the editor fills it (header + editing area = 400px) -->
<div style="height: 400px"><u-text-editor style="height: 100%"></u-text-editor></div>

<!-- ✓ no constraint: the editing area is 300px by default, or whatever height says -->
<u-text-editor height="200"></u-text-editor>
```

⚠ Until 0.4.x the contract was the opposite (the property was the only way to size the editor and
host CSS was ignored). A layout that relied on host CSS *not* reaching the editing area changes
with 0.5.0 — see the CHANGELOG.

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

## Keyboard

`Tab` inside the editor moves on to the next control — it does not insert a tab character, also inside a list, a
quote or a code block (where Quill would indent), so the keyboard is never trapped in the editor (WCAG 2.1.2). Indent
with the toolbar buttons.

## CSS Parts

| Part | Description |
|------|-------------|
| `base` | The editor box (border, rounded corners, background) — style the box here, not on the host |
| `footer` | The validation message under the editing area — present only while `invalid` |

## CSS Custom Properties

`UTextEditor` doesn't declare any custom properties of its own — its styles read the shared
`@iyulab/components` design tokens directly (`--u-border-color`, `--u-panel-bg-color`,
`--u-txt-color`, `--u-txt-color-weak`, `--u-bg-color-hover`, `--u-radius-md`, `--u-primary-color`,
`--u-font-base`), so it re-themes automatically with the rest of the library and has nothing
component-specific to override.
