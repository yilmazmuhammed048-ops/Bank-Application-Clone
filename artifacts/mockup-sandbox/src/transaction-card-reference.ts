const STYLE_ID = "transaction-card-reference-style";
const DELETED_STORAGE_KEY = "demo_deleted_transaction_signatures";
const LONG_PRESS_MS = 650;

const pressTimers = new WeakMap<HTMLButtonElement, number>();
const suppressClickUntil = new WeakMap<HTMLButtonElement, number>();
const wiredCards = new WeakSet<HTMLButtonElement>();
let activeDeleteCard: HTMLButtonElement | null = null;
let deletedSignatures = readDeletedSignatures();

function readDeletedSignatures() {
  try {
    const saved = localStorage.getItem(DELETED_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return new Set<string>(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set<string>();
  }
}

function persistDeletedSignatures() {
  localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(Array.from(deletedSignatures)));
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    [data-transaction-reference-card="true"] {
      min-height: 96px !important;
      border-radius: 9px !important;
      background: #fff !important;
      -webkit-touch-callout: none !important;
      -webkit-user-select: none !important;
      user-select: none !important;
      touch-action: manipulation !important;
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

    [data-transaction-delete-action="true"] {
      position: absolute !important;
      z-index: 5 !important;
      top: 31px !important;
      right: 10px !important;
      display: none !important;
      height: 31px !important;
      min-width: 54px !important;
      padding: 0 14px !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 999px !important;
      background: #e30620 !important;
      color: #fff !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      box-shadow: 0 2px 8px rgba(121, 0, 16, .18) !important;
    }

    [data-transaction-delete-active="true"] [data-transaction-delete-action="true"] {
      display: flex !important;
    }

    [data-transaction-delete-active="true"] [data-transaction-reference-receipt="true"] {
      display: none !important;
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

function buildTransactionSignature(
  date: HTMLElement,
  detailText: string,
  amount: HTMLElement | undefined,
) {
  return [
    date.textContent?.replace(/\s+/g, " ").trim() || "",
    detailText.replace(/\s+/g, " ").trim(),
    amount?.textContent?.replace(/\s+/g, " ").trim() || "",
  ].join("||");
}

function deactivateDeleteCard() {
  if (activeDeleteCard) {
    delete activeDeleteCard.dataset.transactionDeleteActive;
  }
  activeDeleteCard = null;
}

function activateDeleteCard(card: HTMLButtonElement) {
  if (activeDeleteCard && activeDeleteCard !== card) {
    delete activeDeleteCard.dataset.transactionDeleteActive;
  }

  activeDeleteCard = card;
  card.dataset.transactionDeleteActive = "true";
  suppressClickUntil.set(card, Date.now() + 900);

  if ("vibrate" in navigator) {
    navigator.vibrate?.(15);
  }
}

function deleteCard(card: HTMLButtonElement, signature: string) {
  deletedSignatures.add(signature);
  persistDeletedSignatures();
  card.style.setProperty("display", "none", "important");
  if (activeDeleteCard === card) activeDeleteCard = null;
}

function ensureDeleteAction(card: HTMLButtonElement, signature: string) {
  let action = card.querySelector<HTMLElement>("[data-transaction-delete-action='true']");

  if (!action) {
    action = document.createElement("span");
    action.dataset.transactionDeleteAction = "true";
    action.setAttribute("role", "button");
    action.setAttribute("aria-label", "Hesap hareketini sil");
    action.tabIndex = 0;
    action.textContent = "Sil";

    action.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    action.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const currentSignature = action?.dataset.transactionSignature;
      if (currentSignature) deleteCard(card, currentSignature);
    });

    action.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      const currentSignature = action?.dataset.transactionSignature;
      if (currentSignature) deleteCard(card, currentSignature);
    });

    card.appendChild(action);
  }

  action.dataset.transactionSignature = signature;
}

function clearPressTimer(card: HTMLButtonElement) {
  const timer = pressTimers.get(card);
  if (timer !== undefined) {
    window.clearTimeout(timer);
    pressTimers.delete(card);
  }
}

function wireLongPress(card: HTMLButtonElement) {
  if (wiredCards.has(card)) return;
  wiredCards.add(card);

  card.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if ((event.target as Element | null)?.closest("[data-transaction-delete-action='true']")) return;

    clearPressTimer(card);
    const timer = window.setTimeout(() => {
      activateDeleteCard(card);
    }, LONG_PRESS_MS);
    pressTimers.set(card, timer);
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    card.addEventListener(eventName, () => clearPressTimer(card));
  });

  card.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  card.addEventListener(
    "click",
    (event) => {
      if ((event.target as Element | null)?.closest("[data-transaction-delete-action='true']")) return;

      const until = suppressClickUntil.get(card) || 0;
      if (Date.now() < until) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      if (activeDeleteCard && activeDeleteCard !== card) {
        deactivateDeleteCard();
      }
    },
    true,
  );
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

    const signature = buildTransactionSignature(
      date,
      detailText,
      amount instanceof HTMLElement ? amount : undefined,
    );

    if (deletedSignatures.has(signature)) {
      node.style.setProperty("display", "none", "important");
      return;
    }

    node.style.removeProperty("display");
    ensureDeleteAction(node, signature);
    wireLongPress(node);
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
