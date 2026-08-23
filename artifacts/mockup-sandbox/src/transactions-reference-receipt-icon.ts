export {};

const REFERENCE_RECEIPT_ICON =
  "data:image/png;base64,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";

function movementList() {
  const filter = document.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');
  const list = filter?.parentElement?.nextElementSibling;
  return list instanceof HTMLElement ? list : null;
}

function directReceiptSvg(row: HTMLButtonElement) {
  return Array.from(row.children).find(
    (element): element is SVGElement => element instanceof SVGElement,
  );
}

function balanceBox(row: HTMLButtonElement) {
  return Array.from(row.children).find(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && /Kalan\s+Bakiye/i.test(element.textContent || ""),
  );
}

function applyReferenceLayout() {
  const list = movementList();
  if (!list) return;

  const rows = Array.from(list.children).filter(
    (element): element is HTMLButtonElement => element instanceof HTMLButtonElement,
  );

  for (const row of rows) {
    let icon = row.querySelector<HTMLImageElement>('img[data-reference-receipt-icon="true"]');

    if (!icon) {
      const oldIcon = directReceiptSvg(row);
      if (oldIcon) {
        icon = document.createElement("img");
        icon.dataset.referenceReceiptIcon = "true";
        icon.alt = "";
        icon.src = REFERENCE_RECEIPT_ICON;
        icon.style.position = "absolute";
        icon.style.width = "20px";
        icon.style.height = "20px";
        icon.style.right = "29px";
        icon.style.top = "39px";
        icon.style.objectFit = "contain";
        icon.style.pointerEvents = "none";
        oldIcon.replaceWith(icon);
      }
    }

    const balance = balanceBox(row);
    if (!balance) continue;

    const spans = Array.from(balance.querySelectorAll<HTMLSpanElement>("span"));
    const label = spans[0];
    const value = spans.at(-1);
    if (!label || !value) continue;

    label.textContent = "Kalan Bakiye:";

    balance.style.display = "flex";
    balance.style.flexDirection = "row";
    balance.style.alignItems = "baseline";
    balance.style.justifyContent = "flex-end";
    balance.style.gap = "4px";
    balance.style.whiteSpace = "nowrap";
    balance.style.right = "12px";
    balance.style.bottom = "8px";

    label.style.display = "inline";
    label.style.margin = "0";
    value.style.display = "inline";
    value.style.margin = "0";
  }
}

let scheduled = false;
function scheduleApply() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    applyReferenceLayout();
  });
}

const observer = new MutationObserver(scheduleApply);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});

document.addEventListener("DOMContentLoaded", scheduleApply);
window.addEventListener("storage", scheduleApply);
scheduleApply();
