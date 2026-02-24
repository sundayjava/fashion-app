/**
 * jest.globals.js
 * Runs in `setupFiles` — BEFORE the jest test framework is installed and
 * BEFORE any test module is imported.
 *
 * Strategy: Pre-install the globals that expo's winter runtime lazy-installs
 * so that Expo's lazy getters are satisfied immediately and never need to fire
 * require() calls during test module loading (which would trigger jest-runtime's
 * "import outside scope" guard).
 */

// ─── 1. structuredClone ───────────────────────────────────────────────────────
// Node 18+ has it natively. If it is already set, expo's lazy getter for
// structuredClone will see a truthy value on globalThis and never trigger.
// We define it proactively to prevent Expo from trying to load @ungap/structured-clone.
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

// ─── 2. __ExpoImportMetaRegistry ─────────────────────────────────────────────
// Expo's winter runtime lazy-installs this via `installGlobal`. By putting a
// non-lazy value here first, the getter in installGlobal.ts sees `valueSet = true`
// and returns immediately without loading ImportMetaRegistry.ts.
if (typeof globalThis.__ExpoImportMetaRegistry === 'undefined') {
  globalThis.__ExpoImportMetaRegistry = {
    import: () => ({}),
    register: () => {},
  };
}

// ─── 3. URL / URLSearchParams ──────────────────────────────────────────────────
if (typeof globalThis.URL === 'undefined') {
  const { URL, URLSearchParams } = require('url');
  globalThis.URL = URL;
  globalThis.URLSearchParams = URLSearchParams;
}

