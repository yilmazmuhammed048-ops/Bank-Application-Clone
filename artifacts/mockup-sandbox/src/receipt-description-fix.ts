export {};

type StoredTransaction = {
  id?: string | number;
  description?: string;
  transactionNumber?: string;
};

function getTransactions(): StoredTransaction[] {
  try {
    const parsed = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function findDescription(transactionNumber: string) {
  const key = String(transactionNumber || "").trim();
  if (!key) return "";

  const transaction = getTransactions().find(
    (item) => String(item.transactionNumber || item.id || "").trim() === key,
  );

  return String(transaction?.description || "").trim();
}

function syncReceiptDescription() {
  const screens = document.querySelectorAll<HTMLElement>(".fixed.inset-0");

  screens.forEach((screen) => {
    const paragraphs = Array.from(screen.querySelectorAll<HTMLParagraphElement>("p"));
    const fastLine = paragraphs.find((paragraph) =>
      /Fast\s+Mesaj\s+Kodu\s*:/i.test(paragraph.textContent || ""),
    );

    if (!fastLine) return;

    const transactionNumber =
      (fastLine.textContent || "").match(/Fast\s+Sorgu\s+No\s*:\s*([^\s]+)/i)?.[1] || "";
    const description = findDescription(transactionNumber);

    const existing = screen.querySelector<HTMLParagraphElement>(
      '[data-receipt-description-fix="true"]',
    );

    if (!description) {
      existing?.remove();
      return;
    }

    const row = existing || document.createElement("p");
    row.dataset.receiptDescriptionFix = "true";
    row.textContent = `Açıklama : ${description}`;

    if (!existing) {
      fastLine.insertAdjacentElement("afterend", row);
    }
  });
}

const observer = new MutationObserver(syncReceiptDescription);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    syncReceiptDescription();
    observer.observe(document.body, { childList: true, subtree: true });
  });
} else {
  syncReceiptDescription();
  observer.observe(document.body, { childList: true, subtree: true });
}

const ORIGINAL_FILL_TEXT = CanvasRenderingContext2D.prototype.fillText;
const DETAIL_X = 106.01;
const DETAIL_OFFSET = 20;
const shiftedContexts = new WeakSet<CanvasRenderingContext2D>();

CanvasRenderingContext2D.prototype.fillText = function patchedFillText(
  text: string,
  x: number,
  y: number,
  maxWidth?: number,
) {
  const source = String(text ?? "");
  const isPdfDetailLine = Math.abs(x - DETAIL_X) < 0.02 && y >= 414 && y <= 620;

  if (isPdfDetailLine && /Fast\s+Mesaj\s+Kodu\s*:/i.test(source)) {
    const transactionNumber =
      source.match(/Fast\s+Sorgu\s+No\s*:\s*([^\s]+)/i)?.[1] || "";
    const description = findDescription(transactionNumber);

    if (maxWidth === undefined) {
      ORIGINAL_FILL_TEXT.call(this, source, x, y);
    } else {
      ORIGINAL_FILL_TEXT.call(this, source, x, y, maxWidth);
    }

    if (description) {
      const descriptionText = `Açıklama : ${description}`;
      if (maxWidth === undefined) {
        ORIGINAL_FILL_TEXT.call(this, descriptionText, x, y + DETAIL_OFFSET);
      } else {
        ORIGINAL_FILL_TEXT.call(this, descriptionText, x, y + DETAIL_OFFSET, maxWidth);
      }
      shiftedContexts.add(this);
    }

    return;
  }

  const shouldShift = isPdfDetailLine && shiftedContexts.has(this) && y > 434;
  const targetY = shouldShift ? y + DETAIL_OFFSET : y;

  if (maxWidth === undefined) {
    ORIGINAL_FILL_TEXT.call(this, source, x, targetY);
  } else {
    ORIGINAL_FILL_TEXT.call(this, source, x, targetY, maxWidth);
  }
};
