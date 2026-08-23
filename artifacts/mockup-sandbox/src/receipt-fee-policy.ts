export {};

const RECEIPT_COMMISSION = "0,00 TRY";
const RECEIPT_MESSAGE_FEE = "0,37 TRY";
const RECEIPT_TOTAL_FEE = "0,37 TRY";

function applyReceiptFeePolicy() {
  const screens = Array.from(document.querySelectorAll<HTMLElement>(".fixed.inset-0"));

  for (const screen of screens) {
    const screenText = screen.innerText || screen.textContent || "";
    if (!screenText.includes("Fast Mesaj Kodu") || !screenText.includes("İşlem Tutarı")) {
      continue;
    }

    const lines = Array.from(screen.querySelectorAll<HTMLParagraphElement>("p"));
    for (const line of lines) {
      const text = (line.textContent || "").trim();

      if (text.startsWith("Komisyon :")) {
        const next = `Komisyon : ${RECEIPT_COMMISSION} BSMV : 0,00 TRY Mesaj Ücreti : ${RECEIPT_MESSAGE_FEE}`;
        if (line.textContent !== next) line.textContent = next;
      }

      if (text.startsWith("Toplam Masraf :")) {
        const next = `Toplam Masraf : ${RECEIPT_TOTAL_FEE}`;
        if (line.textContent !== next) line.textContent = next;
      }
    }
  }
}

let scheduled = false;
function scheduleApply() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    applyReceiptFeePolicy();
  });
}

const observer = new MutationObserver(scheduleApply);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});

document.addEventListener("DOMContentLoaded", applyReceiptFeePolicy);
scheduleApply();
