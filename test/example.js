const fs = require('fs');
const { parseString, Builder } = require('../index');

const xml = `<?xml version="1.0"?>
<note importance="high" logged="true">
  <!-- a comment -->
  <to>My Dad</to>
  <from>molex</from>
  <heading><![CDATA[Reminder <with> brackets]]></heading>
  <body>Don't forget me this weekend!</body>
</note>`;

parseString(xml, { explicitArray: false }, (err, result) => {
  if (err) return console.error(err);
  console.log('PARSED:', JSON.stringify(result, null, 2));

  const builder = new Builder({ headless: false });
  const built = builder.buildObject(result);
  console.log('\nBUILT:\n', built);
  fs.writeFileSync('example-output.xml', built);
});
