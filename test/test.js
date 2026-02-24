const assert = require('assert');
const { parseString, Builder } = require('../index');

const xml = `<root><a id="1">1</a><a id="2">two</a><mixed>text<child/>more<![CDATA[<x>]]></mixed><!--c--></root>`;

parseString(xml, { explicitArray: true }, (err, out) => {
  if (err) throw err;
  // basic expectations
  assert(out.root, 'root present');
  assert(Array.isArray(out.root), 'root is array');
  const r = out.root[0];
  assert(r.a && r.a.length === 2, 'two <a> elements');
  assert(r.mixed && r.mixed.length === 1, '<mixed> present');

  const builder = new Builder();
  const built = builder.buildObject(out);
  console.log('Built XML:\n', built);
  console.log('Test passed');
});
