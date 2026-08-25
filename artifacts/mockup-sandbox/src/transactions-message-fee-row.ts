export {};
const MESSAGE_FEE = 0.37;
const MESSAGE_FEE_TITLE = "MESAJ ÜCRETİ TUTARI";
const OPENING_BALANCE = 70000;
function parseMoney(text:string){const n=String(text||"").replace(/TL|TRY/gi,"").replace(/\s/g,"").replace(/\./g,"").replace(",",".").replace(/[^\d+.-]/g,"");const v=Number(n);return Number.isFinite(v)?v:0;}
function formatMoney(v:number){return `${v.toLocaleString("tr-TR",{minimumFractionDigits:2,maximumFractionDigits:2})} TL`;}
function roundMoney(v:number){return Math.round((v+Number.EPSILON)*100)/100;}
function accountMovementList(){const f=document.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');const l=f?.parentElement?.nextElementSibling;return l instanceof HTMLElement?l:null;}
function findBalanceBox(r:HTMLElement){return Array.from(r.querySelectorAll<HTMLElement>("div")).find(e=>/Kalan\s+Bakiye/i.test(e.textContent||""));}
function findAmountBox(r:HTMLElement){return Array.from(r.children).find((e):e is HTMLElement=>e instanceof HTMLElement&&/^[+-]\s*[\d.]+,\d{2}\s*TL$/i.test((e.textContent||"").trim()));}
function findDetailsBox(r:HTMLElement){return Array.from(r.children).find((e):e is HTMLElement=>e instanceof HTMLElement&&e.querySelector("p")!==null);}
function rowText(r:HTMLElement){return (r.innerText||r.textContent||"").replace(/\s+/g," ").trim();}
function isFeeRow(r:HTMLButtonElement){return r.dataset.messageFeeRow==="true"||r.getAttribute("aria-label")===MESSAGE_FEE_TITLE||rowText(r).includes(MESSAGE_FEE_TITLE);}
function isFastMovement(r:HTMLButtonElement){return !isFeeRow(r)&&/\bFAST\b/i.test(rowText(r));}
function signature(r:HTMLButtonElement){const c=r.cloneNode(true) as HTMLButtonElement;findBalanceBox(c)?.remove();return rowText(c);}
function applyAmountColor(r:HTMLElement){const a=findAmountBox(r);if(!a)return;const t=(a.textContent||"").trim();if(t.startsWith("+")){a.style.setProperty("color","#49a96f","important");}else{a.style.setProperty("color","#56616a","important");}}
function updateFeeAmount(r:HTMLButtonElement){r.dataset.messageFeeRow="true";r.setAttribute("aria-label",MESSAGE_FEE_TITLE);const a=findAmountBox(r);if(a){a.textContent=formatMoney(-MESSAGE_FEE);a.style.setProperty("color","#56616a","important");}}
function setRowBalance(r:HTMLButtonElement,v:number){const b=findBalanceBox(r);const s=b?Array.from(b.querySelectorAll("span")).at(-1):null;if(s)s.textContent=formatMoney(v);}
function signedAmount(r:HTMLButtonElement){const t=(findAmountBox(r)?.textContent||"0").trim();const a=Math.abs(parseMoney(t));return t.startsWith("-")?-a:t.startsWith("+")?a:parseMoney(t);}
function reconcile(list:HTMLElement){const rows=Array.from(list.children).filter((e):e is HTMLButtonElement=>e instanceof HTMLButtonElement&&findAmountBox(e)!==undefined);if(!rows.length)return;for(const row of rows)applyAmountColor(row);const chronological=[...rows].reverse();let b=OPENING_BALANCE;setRowBalance(chronological[0],b);for(let i=1;i<chronological.length;i++){b=roundMoney(b+signedAmount(chronological[i]));setRowBalance(chronological[i],b);}}
function makeFeeRow(original:HTMLButtonElement){const c=original.cloneNode(true) as HTMLButtonElement;c.dataset.messageFeeRow="true";c.dataset.messageFeeFor=signature(original);c.setAttribute("aria-label",MESSAGE_FEE_TITLE);const d=findDetailsBox(c);if(d){d.replaceChildren();const p=document.createElement("p");p.textContent=MESSAGE_FEE_TITLE;d.appendChild(p);}updateFeeAmount(c);return c;}
function removeDuplicateAndOrphanFees(list:HTMLElement){const rows=Array.from(list.children).filter((e):e is HTMLButtonElement=>e instanceof HTMLButtonElement);for(const row of rows){if(!isFeeRow(row))continue;const prev=row.previousElementSibling;if(!(prev instanceof HTMLButtonElement)||!isFastMovement(prev)){row.remove();continue;}const expected=signature(prev);if(row.dataset.messageFeeFor&&row.dataset.messageFeeFor!==expected){row.remove();continue;}row.dataset.messageFeeFor=expected;updateFeeAmount(row);}}
function apply(){const list=accountMovementList();if(!list)return;removeDuplicateAndOrphanFees(list);const rows=Array.from(list.children).filter((e):e is HTMLButtonElement=>e instanceof HTMLButtonElement);for(const m of rows){if(!isFastMovement(m))continue;const next=m.nextElementSibling;if(next instanceof HTMLButtonElement&&isFeeRow(next)){next.dataset.messageFeeFor=signature(m);updateFeeAmount(next);continue;}m.after(makeFeeRow(m));}reconcile(list);}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();});}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
document.addEventListener("DOMContentLoaded",schedule);window.addEventListener("storage",schedule);document.addEventListener("click",schedule,true);schedule();
