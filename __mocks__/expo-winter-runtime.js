/**
 * Mock for expo/src/winter/runtime.native
 *
 * Expo SDK 52+ defines lazy property descriptors on `global` for web-standard
 * APIs (structuredClone, URL, TextDecoder, etc.). When those getters fire
 * during Jest module initialization (e.g. when yup or react-hook-form accesses
 * structuredClone), Jest throws:
 *   "You are trying to import a file outside of the scope of the test code."
 *
 * By substituting this file we prevent the expo polyfills from running while
 * still having the real Node.js built-ins available in tests (Node 18+).
 */
'use strict';

// Node 18+ has all these built-ins natively.
// If somehow they're missing, install lightweight shims.
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (v) => JSON.parse(JSON.stringify(v));
}
if (typeof global.URL === 'undefined') {
  global.URL = require('url').URL;
}
if (typeof global.URLSearchParams === 'undefined') {
  global.URLSearchParams = require('url').URLSearchParams;
}

module.exports = {};
