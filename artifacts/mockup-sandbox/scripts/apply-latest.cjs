const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '../src/App.tsx');
let source = fs.readFileSync(target, 'utf8');

source = source.replace(
  '                  <div className="mt-auto flex items-center gap-1 text-[#e30620]">\n                    <ReceiptText size={18} />\n                    <span className="text-[10px] font-semibold">Dekont</span>\n                  </div>',
  '                  <div className="mt-auto flex items-center text-[#5f686d]">\n                    <ReceiptText size={17} strokeWidth={1.7} />\n                  </div>',
);

fs.writeFileSync(target, source);
console.log(`Kept repository App.tsx as source of truth and applied the receipt icon patch to ${target}`);
