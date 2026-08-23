export {};

const RECEIPT_COMMISSION = "0,00 TRY";
const RECEIPT_BSMV = "0,18 TRY";
const RECEIPT_MESSAGE_FEE = "0,37 TRY";
const RECEIPT_TOTAL_FEE = "0,55 TRY";

const LEGAL_FOOTER_LINE_1 =
  "Taraflar arasında tüm uyuşmazlıklarda, Banka'nın defter kayıtları ve belgeleri,müstenitli olsun olmasın, kesin ve aksi ileri sürülemez delil niteliğindedir.";
const LEGAL_FOOTER_LINE_2 =
  "Merkez: Finanskent Mahallesi Finans Caddesi No:44A Ümraniye/İstanbul Ticaret Sicil No:475225-5 www.ziraatbank.com.tr";

let activeReceiptClock: { hour: string; minute: string } | null = null;
let suppressRequestContinuationY: number | null = null;

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

function updateActiveReceiptClock(screen: HTMLElement) {
  const transactionLabel = Array.from(screen.querySelectorAll<HTMLElement>("strong")).find(
    (node) => normalize(node.textContent || "").toLocaleUpperCase("tr-TR") === "İŞLEM TARİHİ",
  );
  const row = transactionLabel?.parentElement;
  const value = row?.querySelector<HTMLElement>("span");
  const source = normalize(value?.getAttribute("title") || value?.textContent || "");
  const match = source.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
  if (!match) return;

  activeReceiptClock = {
    hour: match[1].padStart(2, "0"),
    minute: match[2],
  };
}

function applyReceiptFeePolicy() {
  const screens = Array.from(document.querySelectorAll<HTMLElement>(".fixed.inset-0"));

  for (const screen of screens) {
    const screenText = screen.innerText || screen.textContent || "";
    if (!screenText.includes("Fast Mesaj Kodu") || !screenText.includes("İşlem Tutarı")) {
      continue;
    }

    updateActiveReceiptClock(screen);

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
        const firstLine = `${receiptAmount} TRY tutarında Fast işleminin yapılmasını, Bu işlem için`;
        const secondLine = `tarafıma bildirilen ${RECEIPT_TOTAL_FEE} masraf alınmasını talep ederim.`;
        const desired = `${firstLine} ${secondLine}`;
        const hasReferenceBreak = !!line.querySelector("br");

        if (normalize(line.textContent || "") !== normalize(desired) || !hasReferenceBreak) {
          line.replaceChildren(
            document.createTextNode(`${firstLine} `),
            document.createElement("br"),
            document.createTextNode(secondLine),
          );
        }

        Object.assign(line.style, {
          whiteSpace: "normal",
          lineHeight: "1.18",
        });
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
  let nextY = y;
  const lower = next.toLocaleLowerCase("tr-TR");
  const isReceiptPdfCanvas = this.canvas?.width === 1240 && this.canvas?.height === 1754;

  if (isReceiptPdfCanvas && next.startsWith("Taraflar arasında tüm uyuşmazlıklarda")) {
    this.save();
    this.fillStyle = "#1d1d1d";
    this.textAlign = "left";
    this.textBaseline = "alphabetic";
    this.font = '500 10.8px Arial, Helvetica, sans-serif';
    originalFillText.call(this, LEGAL_FOOTER_LINE_1, 62, 765, 1062);
    originalFillText.call(this, LEGAL_FOOTER_LINE_2, 62, 783, 1062);
    this.restore();
    return;
  }

  if (
    isReceiptPdfCanvas &&
    (
      next.startsWith("kesin ve aksi ileri sürülemez delil niteliğindedir") ||
      next.startsWith("Merkez: Finanskent Mahallesi Finans Caddesi") ||
      next === "www.ziraatbank.com.tr"
    )
  ) {
    return;
  }

  if (isReceiptPdfCanvas && next === "Saygılarımızla") {
    this.save();
    this.fillStyle = "#242424";
    this.textAlign = "center";
    this.textBaseline = "alphabetic";
    this.font = '500 11px Arial, Helvetica, sans-serif';
    originalFillText.call(this, next, x, 654);
    this.restore();
    return;
  }

  if (isReceiptPdfCanvas && next === "İNTERNET ŞUBESİ") {
    this.save();
    this.fillStyle = "#202020";
    this.textAlign = "center";
    this.textBaseline = "alphabetic";
    this.font = '500 11px Arial, Helvetica, sans-serif';
    originalFillText.call(this, next, x, 688);
    this.restore();
    return;
  }

  if (isReceiptPdfCanvas) {
    const timestampMatch = next.match(
      /^(\d{2}\/\d{2}\/\d{4})-(\d{2}):(\d{2}):(\d{2})\s+EFTTGIDD\s+INTERNET$/i,
    );

    if (timestampMatch) {
      const hour = activeReceiptClock?.hour || timestampMatch[2];
      const minute = activeReceiptClock?.minute || timestampMatch[3];
      next = `${timestampMatch[1]}-${hour}:${minute}:${timestampMatch[4]} EFTTGIDD INTERNET`;
      nextY = 660;
    } else if (next === "INTERNET" && nextY >= 650 && nextY <= 760) {
      return;
    }

    const requestStart = next.match(/^(\d{1,3}(?:\.\d{3})*|\d+),\d{2}\s+TRY\s+tutarında/i);
    if (requestStart && lower.includes("işleminin yapılmasını")) {
      const amountMatch = next.match(/^(\d{1,3}(?:\.\d{3})*|\d+),\d{2}\s+TRY/i);
      if (amountMatch) {
        const firstLine = `${amountMatch[0]} tutarında Fast işleminin yapılmasını, Bu işlem için`;
        const secondLine = `tarafıma bildirilen ${RECEIPT_TOTAL_FEE} masraf alınmasını talep ederim.`;

        if (typeof maxWidth === "number") {
          originalFillText.call(this, firstLine, x, nextY, maxWidth);
          originalFillText.call(this, secondLine, x, nextY + 18, maxWidth);
        } else {
          originalFillText.call(this, firstLine, x, nextY);
          originalFillText.call(this, secondLine, x, nextY + 18);
        }

        suppressRequestContinuationY = nextY + 18;
        return;
      }
    }

    if (
      suppressRequestContinuationY !== null &&
      nextY >= suppressRequestContinuationY &&
      nextY <= suppressRequestContinuationY + 40 &&
      lower.includes("talep ederim")
    ) {
      suppressRequestContinuationY = null;
      return;
    }
  }

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
    return originalFillText.call(this, next, x, nextY, maxWidth);
  }
  return originalFillText.call(this, next, x, nextY);
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

const receiptFrameMoveTo = CanvasRenderingContext2D.prototype.moveTo;
CanvasRenderingContext2D.prototype.moveTo = function receiptFrameMoveToPatch(x: number, y: number) {
  return receiptFrameMoveTo.call(this, x, y);
};

const receiptFrameArcTo = CanvasRenderingContext2D.prototype.arcTo;
CanvasRenderingContext2D.prototype.arcTo = function receiptFrameArcToPatch(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
) {
  return receiptFrameArcTo.call(this, x1, y1, x2, y2, radius);
};

const receiptFrameFillText = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function receiptFrameFillTextPatch(
  text: string,
  x: number,
  y: number,
  maxWidth?: number,
) {
  const isReceiptPdfCanvas = this.canvas?.width === 1240 && this.canvas?.height === 1754;
  const nextText = String(text);

  if (isReceiptPdfCanvas) {
    if (y >= 160 && y <= 350) {
      if (x === 95) this.font = '700 14px Arial, Helvetica, sans-serif';
      if (x === 275) this.font = '500 13.6px Arial, Helvetica, sans-serif';
      if (x === 292) this.font = '500 13.4px Arial, Helvetica, sans-serif';

      if (x === 665) {
        if (y === 170) this.font = '700 14px Arial, Helvetica, sans-serif';
        else if (y === 195) this.font = '700 14.4px Arial, Helvetica, sans-serif';
        else this.font = '700 13.9px Arial, Helvetica, sans-serif';
      }
    }

    if (x === 106 && y >= 414 && y <= 558) {
      this.font = '500 15.6px Arial, Helvetica, sans-serif';
      y = 414 + Math.round((y - 414) / 24) * 20;
    }

    if (x === 106 && y === 588) {
      this.font = '500 14.8px Arial, Helvetica, sans-serif';
      y = 566;
    }

    if (x === 94 && y === 668) {
      this.font = '500 15.4px Arial, Helvetica, sans-serif';
      y = 638;
    }

    if (/^\d{2}\/\d{2}\/\d{4}-\d{2}:\d{2}:\d{2}\s+EFTTGIDD\s+INTERNET$/i.test(nextText)) {
      this.font = '500 14.6px Arial, Helvetica, sans-serif';
    }

    if (nextText === "T.C. ZİRAAT BANKASI A.Ş.") {
      this.font = '700 11.8px Arial, Helvetica, sans-serif';
      y = 672;
    }
  }

  if (typeof maxWidth === "number") {
    return receiptFrameFillText.call(this, text, x, y, maxWidth);
  }
  return receiptFrameFillText.call(this, text, x, y);
};
