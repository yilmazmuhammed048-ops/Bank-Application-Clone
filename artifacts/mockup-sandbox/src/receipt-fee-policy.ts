export {};

const RECEIPT_COMMISSION = "0,00 TRY";
const RECEIPT_BSMV = "0,18 TRY";
const RECEIPT_MESSAGE_FEE = "0,37 TRY";
const RECEIPT_TOTAL_FEE = "0,55 TRY";

function normalize(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function extractReceiptAmount(lines: HTMLParagraphElement[]) {
  const amountLine = lines.find((line) =>
    normalize(line.textContent || "").toLocaleUpperCase("tr-TR").startsWith("İŞLEM TUTARI"),
  );
  if (!amountLine) return null;

  const match = normalize(amountLine.textContent || "").match(/(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})\s*(?:TRY|TL)/i);
  return match ? `${match[1]},${match[2]}` : null;
}

function applyReceiptFeePolicy() {
  const screens = Array.from(document.querySelectorAll<HTMLElement>(".fixed.inset-0"));

  for (const screen of screens) {
    const screenText = screen.innerText || screen.textContent || "";
    if (!screenText.includes("Fast Mesaj Kodu") || !screenText.includes("İşlem Tutarı")) {
      continue;
    }

    const lines = Array.from(screen.querySelectorAll<HTMLParagraphElement>("p"));
    const receiptAmount = extractReceiptAmount(lines);

    for (const line of lines) {
      const text = normalize(line.textContent || "");

      if (text.startsWith("Alıcı Hesap :")) {
        const receiver = line.querySelector<HTMLElement>("strong");
        if (receiver) {
          const nextReceiver = (receiver.textContent || "").toLocaleLowerCase("tr-TR");
          if (receiver.textContent !== nextReceiver) receiver.textContent = nextReceiver;
        }
        continue;
      }

      if (text.startsWith("Komisyon :")) {
        const next = `Komisyon : ${RECEIPT_COMMISSION} BSMV : ${RECEIPT_BSMV} Mesaj Ücreti : ${RECEIPT_MESSAGE_FEE}`;
        if (line.textContent !== next) line.textContent = next;
        continue;
      }

      if (text.startsWith("Toplam Masraf :")) {
        const next = `Toplam Masraf : ${RECEIPT_TOTAL_FEE}`;
        if (line.textContent !== next) line.textContent = next;
        continue;
      }

      if (
        receiptAmount &&
        text.includes("tutarında") &&
        text.toLocaleLowerCase("tr-TR").includes("işleminin yapılmasını") &&
        text.toLocaleLowerCase("tr-TR").includes("masraf alınmasını talep ederim")
      ) {
        const next = `${receiptAmount} TRY tutarında Fast işleminin yapılmasını, Bu işlem için tarafıma bildirilen ${RECEIPT_TOTAL_FEE} masraf alınmasını talep ederim.`;
        if (line.textContent !== next) line.textContent = next;
      }
    }
  }
}

const originalFillText = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function receiptFeeFillText(
  text: string,
  x: number,
  y: number,
  maxWidth?: number,
) {
  let next = String(text);
  const lower = next.toLocaleLowerCase("tr-TR");

  if (next.startsWith("Alıcı Hesap :")) {
    const receiverMatch = next.match(/^(.*Alıcı\s*:\s*)(.+)$/u);
    if (receiverMatch) {
      next = `${receiverMatch[1]}${receiverMatch[2].toLocaleLowerCase("tr-TR")}`;
    }
  }

  if (next.startsWith("Komisyon :")) {
    next = `Komisyon : ${RECEIPT_COMMISSION}  BSMV : ${RECEIPT_BSMV}  Mesaj Ücreti : ${RECEIPT_MESSAGE_FEE}`;
  } else if (next.startsWith("Toplam Masraf :")) {
    next = `Toplam Masraf : ${RECEIPT_TOTAL_FEE}`;
  } else if (next.includes("tutarında") && lower.includes("işleminin yapılmasını")) {
    next = next
      .replace(/(tutarında\s+).+?(\s+işleminin yapılmasını)/i, "$1Fast$2")
      .replace(/,\s*bu işlem için/i, ", Bu işlem için");
  }

  if (next.toLocaleLowerCase("tr-TR").includes("bildirilen")) {
    next = next.replace(/(bildirilen\s+)\d{1,3}(?:\.\d{3})*(?:,\d{2})?\s*TRY/i, `$1${RECEIPT_TOTAL_FEE}`);
  }

  if (next.toLocaleLowerCase("tr-TR").includes("masraf alınmasını talep ederim")) {
    next = next.replace(/\d{1,3}(?:\.\d{3})*(?:,\d{2})?\s*TRY(?=\s+masraf)/i, RECEIPT_TOTAL_FEE);
  }

  if (typeof maxWidth === "number") {
    return originalFillText.call(this, next, x, y, maxWidth);
  }
  return originalFillText.call(this, next, x, y);
};

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
