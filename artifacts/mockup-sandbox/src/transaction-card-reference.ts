const STYLE_ID = "transaction-card-reference-style";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    [data-transaction-reference-card="true"] {
      min-height: 96px !important;
      border-radius: 9px !important;
      background: #fff !important;
    }

    [data-transaction-reference-date="true"] {
      width: 67px !important;
      flex: 0 0 67px !important;
      background: #fff !important;
      border-right-color: #e5e7e8 !important;
    }

    [data-transaction-reference-date="true"] > span:nth-child(1) {
      font-size: 27px !important;
      font-weight: 300 !important;
      line-height: 1 !important;
      color: #3e4a50 !important;
    }

    [data-transaction-reference-date="true"] > span:nth-child(2) {
      margin-top: 7px !important;
      font-size: 10px !important;
      font-weight: 500 !important;
      letter-spacing: .05em !important;
      color: #4f5a60 !important;
    }

    [data-transaction-reference-date="true"] > span:nth-child(3) {
      margin-top: 6px !important;
      font-size: 10px !important;
      font-weight: 400 !important;
      color: #4f5a60 !important;
    }

    [data-transaction-reference-details="true"] {
      position: relative !important;
      min-width: 0 !important;
      padding: 10px 116px 27px 10px !important;
      color: #465157 !important;
    }

    [data-transaction-reference-details="true"] > p {
      display: none !important;
    }

    [data-transaction-reference-details="true"]::before {
      content: attr(data-reference-detail);
      display: block;
      white-space: pre-line;
      overflow-wrap: anywhere;
      color: #465157;
      font-size: 12px;
      font-weight: 400;
      line-height: 1.28;
      letter-spacing: -.01em;
    }

    [data-transaction-reference-amount="true"] {
      top: 10px !important;
      right: 10px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      line-height: 1 !important;
      color: #3c474d !important;
    }

    [data-transaction-reference-receipt="true"] {
      top: 38px !important;
      right: 22px !important;
      width: 19px !important;
      height: 19px !important;
      color: #111 !important;
      stroke-width: 1.7 !important;
    }

    [data-transaction-reference-balance="true"] {
      right: 10px !important;
      bottom: 9px !important;
      display: flex !important;
      align-items: baseline !important;
      gap: 4px !important;
      white-space: nowrap !important;
      line-height: 1 !important;
    }

    [data-transaction-reference-balance="true"] > span:first-child {
      display: inline !important;
      margin: 0 !important;
      color: #687177 !important;
      font-size: 10px !important;
      font-weight: 400 !important;
      letter-spacing: 0 !important;
      text-transform: none !important;
    }

    [data-transaction-reference-balance="true"] > span:last-child {
      display: inline !important;
      margin: 0 !important;
      color: #3c474d !important;
      font-size: 11px !important;
      font-weight: 600 !important;
    }
  `;

  document.head.appendChild(style);
}

function normalizeOperation(value: string) {
  const trimmed = value.trim();
  if (/fast/i.test(trimmed)) return "FAST İşlemi";
  return trimmed;
}

function buildReferenceDetail(details: HTMLElement) {
  const paragraphs = Array.from(details.querySelectorAll(":scope > p"));
  if (paragraphs.length < 3) return null;

  const lines = paragraphs.map((paragraph) => paragraph.textContent?.trim() || "");

  if (/^Gönd:/i.test(lines[0])) {
    const recipientName = lines[0].replace(/^Gönd:\s*/i, "");
    const bank = lines[1].replace(/\s+FAST\s+işlemi$/i, "").replace(/\/$/, "");
    const iban = lines[2];
    return `${bank}/\n${iban}-${recipientName}/FAST İşlemi`;
  }

  const bank = lines[0].replace(/\/$/, "");
  const iban = lines[1];
  const tailParts = lines[2].split(/\s+—\s+/);
  const recipientName = tailParts.shift()?.trim() || "";
  const operation = normalizeOperation(tailParts.join(" — "));

  return `${bank}/\n${iban}-${recipientName}${operation ? `/${operation}` : ""}`;
}

function decorateTransactionCards() {
  const filterButton = Array.from(document.querySelectorAll("button")).find(
    (button) => button.textContent?.trim() === "Son 1 ay",
  );

  const filterRow = filterButton?.parentElement;
  const list = filterRow?.nextElementSibling;
  if (!list) return;

  Array.from(list.children).forEach((node) => {
    if (!(node instanceof HTMLButtonElement)) return;

    const children = Array.from(node.children);
    const date = children[0];
    const details = children[1];
    const amount = children.find(
      (child) => child instanceof HTMLDivElement && child.classList.contains("absolute") && child.classList.contains("top-3"),
    );
    const balance = children.find(
      (child) => child instanceof HTMLDivElement && child.classList.contains("bottom-[11px]"),
    );
    const receipt = children.find((child) => child instanceof SVGElement);

    if (!(date instanceof HTMLElement) || !(details instanceof HTMLElement)) return;

    const detailText = buildReferenceDetail(details);
    if (!detailText) return;

    node.dataset.transactionReferenceCard = "true";
    date.dataset.transactionReferenceDate = "true";
    details.dataset.transactionReferenceDetails = "true";
    if (details.dataset.referenceDetail !== detailText) {
      details.dataset.referenceDetail = detailText;
    }

    if (amount instanceof HTMLElement) {
      amount.dataset.transactionReferenceAmount = "true";
    }

    if (receipt instanceof SVGElement) {
      receipt.dataset.transactionReferenceReceipt = "true";
    }

    if (balance instanceof HTMLElement) {
      balance.dataset.transactionReferenceBalance = "true";
    }
  });
}

function applyReference() {
  installStyles();
  decorateTransactionCards();
}

applyReference();

const observer = new MutationObserver(() => {
  window.requestAnimationFrame(applyReference);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
