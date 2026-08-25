const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const payloadDir = path.resolve(__dirname, '../../../.github/app_payload');
const parts = fs.readdirSync(payloadDir)
  .filter((name) => /^c\d+\.txt$/.test(name))
  .sort();

if (!parts.length) throw new Error('App payload parts not found');

const encoded = parts.map((name) => fs.readFileSync(path.join(payloadDir, name), 'utf8').trim()).join('');
const source = zlib.gunzipSync(Buffer.from(encoded, 'base64'));
const target = path.resolve(__dirname, '../src/App.tsx');
fs.writeFileSync(target, source);
console.log(`Applied ${parts.length} staged app payload parts to ${target}`);
