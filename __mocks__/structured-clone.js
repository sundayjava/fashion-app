/**
 * Mock for @ungap/structured-clone
 * Used by expo's winter runtime to polyfill `structuredClone`.
 * Node 18+ has it natively; this stub avoids the "import outside scope" crash
 * that occurs when the lazy getter fires during Jest module loading.
 */
'use strict';

const impl =
  typeof globalThis.structuredClone === 'function'
    ? globalThis.structuredClone
    : (value) => JSON.parse(JSON.stringify(value));

module.exports = impl;
module.exports.default = impl;
