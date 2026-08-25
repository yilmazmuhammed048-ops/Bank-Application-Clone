export {};
const MESSAGE_FEE = 0.37;
const MESSAGE_FEE_TITLE = "MESAJ ÜCRETİ TUTARI";
function parseMoney(text:string){const n=String(text||"").replace(/TL|TRY/gi,"").replace(/\s/g,"").replace(/\./g,"").replace(",",".").replace(/[^\d+.-]/g,"");const v=Number(n);return Number.isFinite(v)?v:0;}
function formatMoney(v:number){return `${v.toLocaleString("tr-TR",{minimumFractionDigits:2,maximumFractionDigits:2})} TL`;}
function roundMoney(v:number){return Math.round((v+Number.EPSILON)*100)/100;}
function accountMovementList(){const f=document.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');const l=f?.parentElement?.nextElementSibling;return l instanceof HTMLElement?l:null;}
function findBalanceBox(r:HTMLElement){return Array.from(r.querySelectorAll<HTMLElement>("div")).find(e=>/Kalan\s+Bakiye/i.test(e.textContent||""));}
function findAmountBox(r:HTMLElement){return Array.from(r.children).find((e):e is HTMLElement=>e instanceof HTMLElement&&/^[+-]\s*[\d.]+,\d{2}\s*TL$/i.test((e.textContent||"").trim()));}
function findDetailsBox(r:HTMLElement){return Array.from(r.children).find((e):e is HTMLElement=>e instanceof HTMLElement&&e.querySelector("p")!==null);}
function isFastMovement(r:HTMLButtonElement){return r.dataset.messageFeeRow!=="true"&&/\bFAST\b/i.test(r.innerText||r.textContent||"");}
function signature(r:HTMLButtonElement){const c=r.cloneNode(true) as HTMLButtonElement;findBalanceBox(c)?.remove();return (c.innerText||c.textContent||"").replace(/\s+/g," ").trim();}
function updateFeeAmount(r:HTMLButtonElement){const a=findAmountBox(r);if(a)a.textContent=formatMoney(-MESSAGE_FEE);}
function setRowBalance(r:HTMLButtonElement,v:number){const b=findBalanceBox(r);const s=b?Array.from(b.querySelectorAll("span")).at(-1):null;if(s)s.textContent=formatMoney(v);}
function currentAccountBalance(){try{const a=JSON.parse(localStorage.getItem("demo_account")||"null");if(a?.balance!=null)return parseMoney(String(a.balance));}catch{}return parseMoney(localStorage.getItem("demo_balance")||"0");}
function signedAmount(r:HTMLButtonElement){const t=(findAmountBox(r)?.textContent||"0").trim();const a=Math.abs(parseMoney(t));return t.startsWith("-")?-a:t.startsWith("+")?a:parseMoney(t);}
function reconcile(list:HTMLElement){const rows=Array.from(list.children).filter((e):e is HTMLButtonElement=>e instanceof HTMLButtonElement&&findAmountBox(e)!==undefined);if(!rows.length)return;let b=roundMoney(currentAccountBalance());const chronological=[...rows].reverse();setRowBalance(chronological[0],b);for(let i=1;i<chronological.length;i++){b=roundMoney(b+signedAmount(chronological[i]));setRowBalance(chronological[i],b);}}
function makeFeeRow(original:HTMLButtonElement){const c=original.cloneNode(true) as HTMLButtonElement;c.dataset.messageFeeRow="true";c.dataset.messageFeeFor=signature(original);c.setAttribute("aria-label",MESSAGE_FEE_TITLE);const d=findDetailsBox(c);if(d){d.replaceChildren();const p=document.createElement("p");p.textContent=MESSAGE_FEE_TITLE;d.appendChild(p);}updateFeeAmount(c);return c;}
function apply(){const list=accountMovementList();if(!list)return;for(const m of Array.from(list.children).filter((e):e is HTMLButtonElement=>e instanceof HTMLButtonElement)){if(!isFastMovement(m))continue;const next=m.nextElementSibling;if(next instanceof HTMLButtonElement&&next.dataset.messageFeeRow==="true"){updateFeeAmount(next);continue;}m.after(makeFeeRow(m));}reconcile(list);}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();});}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
document.addEventListener("DOMContentLoaded",schedule);window.addEventListener("storage",schedule);document.addEventListener("click",apply,true);schedule();
