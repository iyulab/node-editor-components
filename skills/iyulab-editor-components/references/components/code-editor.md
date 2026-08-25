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

## Slots

| Name | Description |
|------|-------------|
| `header-actions` | Content placed at the end of the header (e.g. extra toolbar buttons) |

## Events

| Event | Detail | Description |
|-------|--------|--------------|
| `change` | none (plain `Event`) | Fired on user edits (`Monaco.onDidChangeModelContent`). Not fired for programmatic `value` assignment while Monaco already holds that value. Read the new content from `value` |

## CSS Custom Properties

None. `UCodeEditor.styles.ts` only sets a private layout variable (`--header-height`, not documented as a consumer override point) and otherwise relies on Monaco's own theme (`vs-light`/`vs-dark`) rather than this library's `--u-*` design tokens.
