export {};

type StoredTransaction = {
  id?: string | number;
  transactionNumber?: string;
  description?: string;
};

const MARKER = "data-receipt-description-line";

function normalize(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function readDescription(transactionNumber: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
    if (!Array.isArray(parsed)) return "";

    const transaction = (parsed as StoredTransaction[]).find(
      (item) => String(item.transactionNumber ?? item.id ?? "") === transactionNumber,
    );

    return normalize(String(transaction?.description ?? ""));
  } catch {
    return "";
  }
}

function syncReceiptDescription() {
  const overlays = Array.from(document.querySelectorAll<HTMLElement>("div.fixed.inset-0"));

  for (const overlay of overlays) {
    const fastLine = Array.from(overlay.querySelectorAll<HTMLParagraphElement>("p")).find((node) =>
      /^Fast Mesaj Kodu\s*:/i.test(normalize(node.textContent || "")),
    );
    if (!fastLine) continue;

    const fastText = normalize(fastLine.textContent || "");
    const transactionNumber = fastText.match(/Fast Sorgu No\s*:\s*([^\s]+)/i)?.[1]?.trim() || "";
    if (!transactionNumber) continue;

    const description = readDescription(transactionNumber);
    const parent = fastLine.parentElement;
    if (!parent) continue;

    let descriptionLine = parent.querySelector<HTMLParagraphElement>(`p[${MARKER}]`);

    if (!description) {
      descriptionLine?.remove();
      continue;
    }

    if (!descriptionLine) {
      descriptionLine = document.createElement("p");
      descriptionLine.setAttribute(MARKER, "true");
      descriptionLine.className = fastLine.className;
      parent.insertBefore(descriptionLine, fastLine);
    }

    if (descriptionLine.textContent !== description) {
      descriptionLine.textContent = description;
    }

    const fastStyle = window.getComputedStyle(fastLine);
    Object.assign(descriptionLine.style, {
      fontFamily: fastStyle.fontFamily,
      fontSize: fastStyle.fontSize,
      fontWeight: fastStyle.fontWeight,
      lineHeight: fastStyle.lineHeight,
      letterSpacing: fastStyle.letterSpacing,
      color: fastStyle.color,
      textAlign: fastStyle.textAlign,
      marginTop: "0",
      marginBottom: "3px",
      padding: "0",
      whiteSpace: "normal",
      overflowWrap: "anywhere",
    });
  }
}

let queued = false;
function queueSync() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    syncReceiptDescription();
  });
}

const observer = new MutationObserver(queueSync);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});

window.addEventListener("storage", queueSync);
queueSync();
