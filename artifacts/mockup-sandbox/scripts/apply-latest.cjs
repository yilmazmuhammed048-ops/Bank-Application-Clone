const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const payloadDir = path.resolve(__dirname, '../../../.github/app_payload');
const parts = fs.readdirSync(payloadDir)
  .filter((name) => /^c\d+\.txt$/.test(name))
  .sort();

if (!parts.length) throw new Error('App payload parts not found');

const encoded = parts.map((name) => fs.readFileSync(path.join(payloadDir, name), 'utf8').trim()).join('');
let source = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');

source = source.replace(
  '                  <div className="mt-auto flex items-center gap-1 text-[#e30620]">\n                    <ReceiptText size={18} />\n                    <span className="text-[10px] font-semibold">Dekont</span>\n                  </div>',
  '                  <div className="mt-auto flex items-center text-[#5f686d]">\n                    <ReceiptText size={17} strokeWidth={1.7} />\n                  </div>',
);

const target = path.resolve(__dirname, '../src/App.tsx');
fs.writeFileSync(target, source);
console.log(`Applied ${parts.length} staged app payload parts to ${target}`);
