/**
 * Root exporter for molex-xml-npm. Re-exports the parser and builder implementations
 * located in `lib/`.
 * @module index
 */

const { parse, parseString } = require('./lib/parser');
const { Builder } = require('./lib/builder');
const { extractString } = require('./lib/utils');

module.exports = { parse, parseString, Builder, extractString };
