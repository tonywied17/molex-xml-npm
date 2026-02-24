/**
 * Root exporter for molex-xml. Re-exports the parser and builder implementations
 * located in `lib/`.
 * @module index
 */

const { parse, parseString } = require('./lib/parser');
const { Builder } = require('./lib/builder');

module.exports = { parse, parseString, Builder };
