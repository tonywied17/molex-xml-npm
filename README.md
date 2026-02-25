# molex-xml-js

[![npm version](https://img.shields.io/npm/v/molex-xml-js.svg)](https://www.npmjs.com/package/molex-xml-js)
[![npm downloads](https://img.shields.io/npm/dm/molex-xml-js.svg)](https://www.npmjs.com/package/molex-xml-js)
[![GitHub](https://img.shields.io/badge/GitHub-molex--xml--js--npm-blue.svg)](https://github.com/tonywied17/molex-xml-js-npm)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14-brightgreen.svg)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](package.json)

> Zero-dependency XML parser and builder with preserved order, CDATA & comment support, attribute merging, and optional type-casting. Designed as a small, xml2js-friendly alternative.

## Features

- **Zero dependencies** — Pure Node.js implementation
- **xml2js-compatible API** — `parse`, `parseString`, `Builder` and `extractString` for easy migration
- **Preserves child order & mixed content** — `#children` preserves interleaved text, CDATA, comments and elements
- **CDATA and comments** — Parses and emits CDATA sections and comments
- **Attribute merging** — Attributes are available under the `$` key
- **Optional basic type-casting** — Numbers, booleans, dates and simple JSON can be auto-cast

## Installation

```bash
npm install molex-xml-js
```

## Quick Start

```javascript
const { parseString, Builder } = require('molex-xml-js');

const xml = `<?xml version="1.0"?>
<note importance="high" logged="true">
  <!-- a comment -->
  <to>My Dad</to>
  <from>molex</from>
  <heading><![CDATA[Reminder <with> brackets]]></heading>
  <body>Don't forget me this weekend!</body>
</note>`;

parseString(xml, { explicitArray: false }, (err, result) => {
  if (err) throw err;
  console.log(result);

  const builder = new Builder({ headless: false });
  const built = builder.buildObject(result);
  console.log(built);
});
```

Note: `parseString(xml, opts, cb)` also returns the parsed object when no callback is provided (it behaves like `parse(xml, opts)`).

## Options

- `explicitArray` (boolean, default: `true`) — when `false` single-element arrays are collapsed
- `mergeAttrs` (boolean, default: `true`) — when `true` attributes are placed under `$`
- `typeCast` (boolean|object, default: `true`) — enable basic casting of booleans/numbers/dates/JSON for text and attributes; can be an options object (see below)
- `collapseTextNodes` (boolean, default: `false`) — when `true`, elements that contain only a single text or CDATA child and have no attributes will be returned as a plain string instead of an object
- `headless` (Builder option, default: `false`) — omit the `<?xml ...?>` prolog when building

`typeCast` options object keys:

- `parseJSON` (boolean, default: `true`) — attempt to parse JSON objects/arrays
- `parseDates` (boolean, default: `true`) — attempt ISO-8601 date parsing into `Date`
- `coerceNull` (boolean, default: `true`) — convert the string `null` to the `null` value

## Behavior notes

- The parser emits mixed content in `#children` arrays. Each child object created for an element includes a `__name` property that records its element name; the `Builder` uses that hint to round-trip elements when serializing back to XML.
- Attributes for elements are placed under the `$` key on the element object.

## API

### `parseString(xml, [opts], cb)`

Parse XML using callback style. `opts` accepts the options listed above. If `cb` is omitted, the function returns the parsed result (synchronous behaviour).

Callback signature: `cb(err, result)`.

### `extractString(xml, [opts])`

Utility function that quickly extracts string content from XML without performing a full object round-trip. See the `lib/` implementation for available options and exact behaviour.

### `parse(xml, opts)`

Synchronously parse and return the object.

### `new Builder(opts).buildObject(obj)`

Build XML from an object previously produced by `parse`/`parseString`. `opts.headless` controls whether the prolog is emitted. The builder expects element objects to expose `#children` arrays and optional `$` attributes — objects produced by this parser are compatible.

## File layout

The implementation uses a small `lib/` layout so internals are easy to maintain:

- `lib/parser.js` — synchronous parsing entrypoints `parse` and `parseString`
- `lib/builder.js` — `Builder` class for serializing objects back to XML
- `lib/utils.js` — helper functions and the `typeCast` implementation
- `index.js` — lightweight exporter re-exporting the public API

## Example

See [test/example.js](test/example.js) for a runnable example that parses and rebuilds XML, including CDATA and comments.

## Tests

Run the included basic tests with:

```bash
node test/test.js
```

Verbose tests and examples:

```bash
node test/test-verbose.js
node test/example-verbose.js
```

## License

MIT