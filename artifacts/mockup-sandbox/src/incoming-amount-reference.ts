const INCOMING_AMOUNT_COLOR = "#56B164";
const TRANSACTION_TYPOGRAPHY_STYLE_ID = "transaction-typography-reference-style";

function installTransactionTypographyReference() {
  if (document.getElementById(TRANSACTION_TYPOGRAPHY_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = TRANSACTION_TYPOGRAPHY_STYLE_ID;
  style.textContent = `
    [data-transaction-reference-card="true"] {
      min-height: 102px !important;
    }

    [data-transaction-reference-date="true"] {
      width: 66px !important;
      flex: 0 0 66px !important;
    }

    [data-transaction-reference-date="true"] > span:nth-child(1) {
      font-size: 30px !important;
      font-weight: 300 !important;
      line-height: .96 !important;
      letter-spacing: -.04em !important;
    }

    [data-transaction-reference-date="true"] > span:nth-child(2) {
      margin-top: 8px !important;
      font-size: 13px !important;
      font-weight: 300 !important;
      line-height: 1 !important;
      letter-spacing: .015em !important;
    }

    [data-transaction-reference-date="true"] > span:nth-child(3) {
      margin-top: 7px !important;
      font-size: 12.5px !important;
      font-weight: 300 !important;
      line-height: 1 !important;
    }

    [data-transaction-reference-details="true"] {
      padding: 10px 112px 31px 11px !important;
    }

    [data-transaction-reference-details="true"]::before {
      font-size: 15px !important;
      font-weight: 300 !important;
      line-height: 1.16 !important;
      letter-spacing: -.018em !important;
      color: #465157 !important;
    }

    [data-transaction-reference-amount="true"] {
      top: 10px !important;
      right: 10px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      line-height: 1 !important;
      letter-spacing: -.012em !important;
    }

    [data-transaction-reference-receipt="true"] {
      top: 42px !important;
      right: 24px !important;
      width: 19px !important;
      height: 19px !important;
    }

    [data-transaction-reference-balance="true"] {
      right: 10px !important;
      bottom: 9px !important;
      gap: 5px !important;
    }

    [data-transaction-reference-balance="true"] > span:first-child {
      font-size: 12.5px !important;
      font-weight: 300 !important;
      letter-spacing: -.015em !important;
      color: #59656b !important;
    }

    [data-transaction-reference-balance="true"] > span:last-child {
      font-size: 13px !important;
      font-weight: 600 !important;
      letter-spacing: -.012em !important;
    }

    button[aria-label="Ana sayfa"] svg {
      width: 27px !important;
      height: 27px !important;
      stroke-width: 1.55 !important;
      fill: none !important;
    }

    /* Splash screen: the reference artwork ends in #ce1515, while the app shell
       normally uses #DF0E24. On iPhone Home Screen the bottom safe area can expose
       that shell color as a visible strip. Match the shell to the artwork only while
       the splash image is mounted so the artwork continues behind the home indicator. */
    html:has(img[src="/ziraat-splash-reference.jpg"]),
    body:has(img[src="/ziraat-splash-reference.jpg"]),
    #root:has(img[src="/ziraat-splash-reference.jpg"]) {
      background: #ce1515 !important;
    }

    #root > div:has(> img[src="/ziraat-splash-reference.jpg"]) {
      position: fixed !important;
      inset: 0 !important;
      width: 100% !important;
      height: auto !important;
      min-height: 100% !important;
      background: #ce1515 !important;
    }

    /* iPhone 13 Home Screen: extend only the artwork into the system safe area.
       The header is pulled upward by the safe inset, then that inset is added a
       second time to the header height/padding so the controls remain at their
       approved safe position and the content below does not move. */
    @media (display-mode: standalone) and (min-width: 380px) and (max-width: 400px) {
      main > div:has(> div.pb-24) > header {
        --iphone13-home-safe-top: max(env(safe-area-inset-top, 0px), 47px);
        margin-top: calc(-1 * var(--iphone13-home-safe-top)) !important;
        height: calc(96px + var(--iphone13-home-safe-top) + var(--iphone13-home-safe-top)) !important;
        min-height: calc(96px + var(--iphone13-home-safe-top) + var(--iphone13-home-safe-top)) !important;
        max-height: calc(96px + var(--iphone13-home-safe-top) + var(--iphone13-home-safe-top)) !important;
        padding-top: calc(2px + var(--iphone13-home-safe-top) + var(--iphone13-home-safe-top)) !important;
        background-position: center top !important;
      }

      main > div:has(> div.pb-24) > header::before {
        height: calc(96px + var(--iphone13-home-safe-top) + var(--iphone13-home-safe-top)) !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function applyIncomingAmountColor() {
  document
    .querySelectorAll<HTMLElement>('[data-transaction-reference-amount="true"]')
    .forEach((amount) => {
      const isIncoming = amount.textContent?.trim().startsWith("+") ?? false;

      if (isIncoming) {
        amount.style.setProperty("color", INCOMING_AMOUNT_COLOR, "important");
      } else {
        amount.style.removeProperty("color");
      }
    });
}

installTransactionTypographyReference();
applyIncomingAmountColor();

const observer = new MutationObserver(() => {
  window.requestAnimationFrame(applyIncomingAmountColor);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});