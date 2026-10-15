# u-code-editor

```ts
import '@iyulab/editor-components/dist/components/code-editor/UCodeEditor.js';
```

**Tag:** `u-code-editor`

Monaco Editor wrapped as a custom element. Syntax highlighting, per-language configuration, and automatic light/dark sync with the document theme (`Theme.resolved()` from `@iyulab/components`).

```html
<u-code-editor language="typescript" .value=${"const x: number = 42;"}></u-code-editor>

<!-- Without header -->
<u-code-editor language="json" headless .value=${JSON.stringify({key: 'value'}, null, 2)}></u-code-editor>
```

---

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `headless` | `boolean` | `false` | ✓ | Hides the header (label + `header-actions` slot) |
| `label` | `string` | `undefined` | — | Header title text — also the editing area's accessible name (a wrapping `u-field`'s label names it when this is unset). Unset uses the locale string `codeEditor` ('Editor') |
| `theme` | `'light' \| 'dark'` | `'light'` | — | Editor color theme. Synced automatically from `Theme.resolved()` on connect and on every `data-theme`/`theme` attribute mutation on `document.documentElement` — the declared default is overwritten before first render, and setting it directly is overwritten by the next sync |
| `noTabHint` | `boolean` | `false` | — | Attribute `no-tab-hint`. Drops the Tab hint from the editing area's description (see Keyboard) — for a page that states the method itself |
| `language` | `string` | `'json'` | — | Monaco language id (`"javascript"`, `"typescript"`, …) |
| `fontSize` | `number` | `14` | — | Editor font size in pixels |
| `value` | `string` | `''` | — | Current text content |
| `name` | `string` | `undefined` | — | Submit name — with it the content goes into the surrounding `<form>`'s data, and `u-form` reads it into its model |
| `readonly` | `boolean` | `false` | ✓ | Prevents user input; the content stays selectable and scrollable (applies when changed after creation too) |
| `disabled` | `boolean` | `false` | ✓ | Prevents editing; an ancestor `<fieldset disabled>` does the same |
| `required` | `boolean` | `false` | ✓ | An empty editor is invalid (`valueMissing`); a submit attempt shows the message under the editor |

## Form control

Like the native `<textarea>` it stands in for, the editor is a form-associated control (the `@iyulab/components` form
control base): with a `name` it submits its text with its `<form>`, `form.reset()` returns it to its `value` attribute,
`disabled` or an ancestor `<fieldset disabled>` stops editing, and `required` makes it invalid while empty — a submit
attempt (or `validate()`) shows the message under the editing area (`::part(footer)`) and marks the editing area
`aria-invalid`. Inside `u-form` it takes part in `model`, `validate()` and `reset()` like any other control.

```html
<form>
  <u-text-editor name="body" required></u-text-editor>
  <u-code-editor name="query" language="sql" value="select 1"></u-code-editor>
</form>
```

## Sizing

**The host box owns the size.** `:host` is `width: 100%; height: 100%`, and the editing area is
whatever the header leaves — Monaco re-layouts into it (`automaticLayout`). There is no `height`
property: size the element, or give its parent a height.

```html
<!-- ✓ the parent has a height, so the editor fills it -->
<div style="height: 400px"><u-code-editor></u-code-editor></div>

<!-- ✓ or size the element itself -->
<u-code-editor style="height: 400px"></u-code-editor>
```

⚠ **In a parent that has no height of its own, `height: 100%` resolves to nothing and the editing
area collapses to a few pixels** — you get the header and an empty strip, with no error and nothing
in the console. Give the parent a height, or set one on the element.

`headless` removes the header, so the editing area is then the whole host box.

`u-text-editor` shares this contract since 0.5.0; its `height` property is only the editing area's default when the host has no constraint.
other unchanged.

## Slots

| Name | Description |
|------|-------------|
| `header-actions` | Content placed at the end of the header (e.g. extra toolbar buttons) |

## Events

| Event | Detail | Description |
|-------|--------|--------------|
| `change` | none (plain `Event`) | Fired on user edits (`Monaco.onDidChangeModelContent`). Not fired for programmatic `value` assignment while Monaco already holds that value. Read the new content from `value` |

## Keyboard

`Tab` inside the editor indents — a code editor needs it — so `Tab` does not move the focus on its own.
**`Ctrl+M`** (macOS: `Ctrl+Shift+M`) toggles Monaco's "Tab moves focus" mode; after it, `Tab` / `Shift+Tab`
leave the editor. That is the keyboard way out (WCAG 2.1.2 allows a non-standard exit when the user is told
the method), and the editor tells it: while editable, the editing area's accessible description says so (localized
through `Locale` — English and Korean built in, others via `editorLocale.register`), so a screen reader announces it on
entering. Read-only, `Tab` already leaves and there is no hint. A page may still show the method visibly — the hint
is for assistive technology, not on screen.
`Tab` from the control before the editor enters it.

## CSS Parts

| Part | Description |
|------|-------------|
| `footer` | The validation message under the editing area — present only while `invalid` |

## CSS Custom Properties

None. Layout is plain flexbox — the header keeps its own height and the editing area takes the rest — so there is no layout variable to override (see [Sizing](#sizing) for how the element is sized), and colours come from Monaco's own theme (`vs-light`/`vs-dark`) rather than this library's `--u-*` design tokens.
