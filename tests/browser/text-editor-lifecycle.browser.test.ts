import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/text-editor/UTextEditor.js';
import type { UTextEditor } from '../../src/components/text-editor/UTextEditor.js';

/**
 * Lifecycle contract tests for the connect → edit → disconnect → re-connect path.
 *
 * Context: `quill` used to be declared `private quill!: Quill` (non-null
 * assertion) while `disconnectedCallback` assigned `null as any`. Those two lies
 * cancelled out in the type checker, so five dereferences type-checked without a
 * null guard (Cycle 95 fixed the declaration to `Quill | null`).
 *
 * Honest scope note: these are **contract tests, not regression tests.** Removing
 * the guards again does not make them fail, because every call site was already
 * wrapped in `if (this.quill)` at runtime — the type-level fix is preventive
 * (it makes tsc catch a future unguarded call), not a live-bug fix. What these
 * tests do pin down is the observable contract: the public accessors stay safe
 * and the element stays reusable across detach/re-attach.
 */
describe('UTextEditor lifecycle', () => {
  let el: UTextEditor;

  const mount = async (value = '') => {
    const node = document.createElement('u-text-editor') as UTextEditor;
    node.value = value;
    document.body.appendChild(node);
    await node.updateComplete;
    // Quill is constructed in firstUpdated, after updateComplete resolves.
    await new Promise((r) => requestAnimationFrame(r));
    return node;
  };

  beforeEach(() => {
    document.body.replaceChildren();
  });

  afterEach(() => {
    el?.remove();
  });

  it('mounts and exposes content through the public API', async () => {
    el = await mount('<p>hello</p>');
    expect(el.getText()).toContain('hello');
    expect(el.getHTML()).toContain('hello');
  });

  it('getDelta() returns a delta while mounted', async () => {
    el = await mount('<p>abc</p>');
    const delta = el.getDelta();
    expect(delta).not.toBeNull();
    expect(delta?.ops).toBeDefined();
  });

  it('survives removal from the DOM without throwing', async () => {
    el = await mount('<p>bye</p>');
    expect(() => el.remove()).not.toThrow();
    // The public accessors must stay callable (and empty-safe) after teardown.
    expect(() => el.getDelta()).not.toThrow();
    expect(() => el.getText()).not.toThrow();
    expect(() => el.getHTML()).not.toThrow();
  });

  it('setHTML() after removal does not throw during the resulting update', async () => {
    el = await mount('<p>one</p>');
    el.remove();
    // setHTML assigns `value`, which schedules a Lit update. Awaiting the cycle
    // ensures the detached-element update path is actually exercised rather than
    // left pending when the test ends.
    el.setHTML('<p>two</p>');
    await expect(el.updateComplete).resolves.toBeDefined();
  });

  it('can be re-attached after removal', async () => {
    el = await mount('<p>first</p>');
    el.remove();
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => requestAnimationFrame(r));
    expect(() => el.getText()).not.toThrow();
  });
});
