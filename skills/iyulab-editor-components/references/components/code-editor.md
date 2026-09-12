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
| `label` | `string` | `'Editor'` | — | Header title text |
| `theme` | `'light' \| 'dark'` | `'light'` | — | Editor color theme. Synced automatically from `Theme.resolved()` on connect and on every `data-theme`/`theme` attribute mutation on `document.documentElement` — the declared default is overwritten before first render, and setting it directly is overwritten by the next sync |
| `readOnly` | `boolean` | `false` | — | Prevents user input |
| `language` | `string` | `'json'` | — | Monaco language id (`"javascript"`, `"typescript"`, …) |
| `fontSize` | `number` | `14` | — | Editor font size in pixels |
| `value` | `string` | `''` | — | Current text content |

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

⚠ `u-text-editor` is the opposite: there, a `height` property sizes the editing area and a CSS
`height` on the host does *not* change it. A layout that works for one does not transfer to the
other unchanged.

## Slots

| Name | Description |
|------|-------------|
| `header-actions` | Content placed at the end of the header (e.g. extra toolbar buttons) |

## Events

| Event | Detail | Description |
|-------|--------|--------------|
| `change` | none (plain `Event`) | Fired on user edits (`Monaco.onDidChangeModelContent`). Not fired for programmatic `value` assignment while Monaco already holds that value. Read the new content from `value` |

## CSS Custom Properties

None. Layout is plain flexbox — the header keeps its own height and the editing area takes the rest — so there is no layout variable to override (see [Sizing](#sizing) for how the element is sized), and colours come from Monaco's own theme (`vs-light`/`vs-dark`) rather than this library's `--u-*` design tokens.
