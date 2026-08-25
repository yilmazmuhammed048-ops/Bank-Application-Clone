export {};

function parseMoney(text: string) {
  const normalized = String(text || "").replace(/TL|TRY/gi, "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".").replace(/[^\d+.-]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}
function formatMoney(value: number) { return `${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`; }
function roundMoney(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }
function currentAccountBalance() {
  try { const account = JSON.parse(localStorage.getItem("demo_account") || "null"); if (account?.balance != null) return parseMoney(String(account.balance)); } catch {}
  return parseMoney(localStorage.getItem("demo_balance") || "0");
}
function accountMovementList() { const filter = document.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]'); const list = filter?.parentElement?.nextElementSibling; return list instanceof HTMLElement ? list : null; }
function findAmountBox(row: HTMLElement) { return Array.from(row.children).find((element): element is HTMLElement => element instanceof HTMLElement && /^[+-]\s*[\d.]+,\d{2}\s*TL$/i.test((element.textContent || "").trim())); }
function findBalanceBox(row: HTMLElement) { return Array.from(row.querySelectorAll<HTMLElement>("div")).find((element) => /Kalan\s+Bakiye/i.test(element.textContent || "")); }
function setRowBalance(row: HTMLButtonElement, value: number) { const box = findBalanceBox(row); const span = box ? Array.from(box.querySelectorAll("span")).at(-1) : null; if (span) span.textContent = formatMoney(value); }
function signedAmount(row: HTMLButtonElement) { const text = (findAmountBox(row)?.textContent || "0").trim(); const amount = Math.abs(parseMoney(text)); return text.startsWith("-") ? -amount : text.startsWith("+") ? amount : parseMoney(text); }

function reconcileRunningBalance() {
  const list = accountMovementList(); if (!list) return;
  const rows = Array.from(list.children).filter((e): e is HTMLButtonElement => e instanceof HTMLButtonElement && findAmountBox(e) !== undefined);
  if (!rows.length) return;
  let balance = roundMoney(currentAccountBalance());
  const chronological = [...rows].reverse();
  // En eski dekont başlangıç bakiyesini aynen gösterir; kendi tutarı burada uygulanmaz.
  setRowBalance(chronological[0], balance);
  // Sonraki dekontlardan itibaren - düşer, + eklenir.
  for (let i = 1; i < chronological.length; i += 1) {
    balance = roundMoney(balance + signedAmount(chronological[i]));
    setRowBalance(chronological[i], balance);
  }
}
let scheduled = false;
function schedule() { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; reconcileRunningBalance(); }); }
new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
window.addEventListener("storage", schedule);
document.addEventListener("click", reconcileRunningBalance, true);
window.setInterval(reconcileRunningBalance, 1000);
schedule();
