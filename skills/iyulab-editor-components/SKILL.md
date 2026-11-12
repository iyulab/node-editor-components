---
name: iyulab-editor-components
description: Editor web components — a Monaco-based code editor and a Quill-based rich text editor. Both auto-sync with the surrounding document theme (code editor) or the shared @iyulab/components design tokens (text editor). Use when working with @iyulab/editor-components package.
license: MIT
metadata:
  author: iyulab
---

# @iyulab/editor-components

Editor web components built on [Lit](https://lit.dev/). Custom elements (`u-*` tags) that work in any framework or vanilla HTML.

## Quick Start

```bash
npm install @iyulab/editor-components
```

Import all components at once:

```ts
import '@iyulab/editor-components';
```

Import individual components (tree-shakable):

```ts
import '@iyulab/editor-components/dist/components/code-editor/UCodeEditor.js';
import '@iyulab/editor-components/dist/components/text-editor/UTextEditor.js';
```

---

## Components

- [`u-code-editor`](./references/components/code-editor.md) — Monaco-based code editor. Language-aware syntax highlighting, automatic light/dark theme sync
- [`u-text-editor`](./references/components/text-editor.md) — Quill-based rich text editor. HTML/plain-text/Delta content access, customizable toolbar

---

## Events

| Event | Source | Detail | Description |
|-------|--------|--------|--------------|
| `change` | `u-code-editor` | none (plain `Event`) | User edit in the Monaco editor |
| `change` | `u-text-editor` | `{ html, text, delta }` | User edit in the Quill editor |

## Machine-readable reference

The element surface is also published as a Custom Elements Manifest: the file named by the `customElements` field of this package's `package.json` (`dist/custom-elements.json`). It lists every element's attributes, properties, events (with the type of their `detail`), slots, CSS parts and CSS custom properties, generated from the source at build time. Read it instead of parsing the source when you need the exact surface of an element.
