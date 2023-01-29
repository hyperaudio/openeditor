const jsonfile = require('jsonfile');
const tableToJson = require('tabletojson').Tabletojson;

tableToJson.convertUrl('https://docs.aws.amazon.com/transcribe/latest/dg/supported-languages.html', tablesAsJson => {
  supportedLanguages = tablesAsJson[0];
  jsonfile.writeFileSync(`${__dirname}/../src/data/aws-transcribe-languages.json`, supportedLanguages, { spaces: 2 });
});

tableToJson.convertUrl('https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html', tablesAsJson => {
  supportedLanguages = tablesAsJson[0];
  jsonfile.writeFileSync(`${__dirname}/../src/data/aws-translate-languages.json`, supportedLanguages, { spaces: 2 });
});
