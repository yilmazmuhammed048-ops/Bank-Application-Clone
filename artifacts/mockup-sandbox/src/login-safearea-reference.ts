const LOGIN_SAFE_STYLE_ID = "iphone13-login-safearea-reference";

function isIphone13Standalone() {
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const displayStandalone = window.matchMedia("(display-mode: standalone)").matches;
  return (iosStandalone || displayStandalone) && window.innerWidth >= 380 && window.innerWidth <= 400;
}

function installLoginSafeStyle() {
  if (document.getElementById(LOGIN_SAFE_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = LOGIN_SAFE_STYLE_ID;
  style.textContent = `
    @media (display-mode: standalone) and (min-width: 380px) and (max-width: 400px) {
      div:has(> img[alt="Ziraat Mobil giriş ekranı"]),
      div:has(> img[alt="Ziraat Mobil şifre ekranı"]) {
        --iphone13-login-safe-top: max(env(safe-area-inset-top, 0px), 47px);
        position: relative !important;
        background: #df0712 !important;
      }

      div:has(> img[alt="Ziraat Mobil giriş ekranı"])::before,
      div:has(> img[alt="Ziraat Mobil şifre ekranı"])::before {
        content: "" !important;
        position: absolute !important;
        z-index: 55 !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: calc(var(--iphone13-login-safe-top) + 64px) !important;
        background: #df0712 !important;
        pointer-events: none !important;
      }

      [data-iphone13-login-safe-header="true"] {
        position: absolute !important;
        z-index: 60 !important;
        top: var(--iphone13-login-safe-top) !important;
        left: 0 !important;
        right: 0 !important;
        height: 56px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-sizing: border-box !important;
        padding: 0 15px !important;
        color: #fff !important;
        background: #df0712 !important;
        pointer-events: none !important;
      }

      [data-iphone13-login-safe-tr="true"] {
        position: absolute !important;
        left: 16px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        font-size: 16px !important;
        line-height: 1 !important;
        font-weight: 400 !important;
      }

      [data-iphone13-login-safe-brand="true"] {
        display: flex !important;
        align-items: center !important;
        gap: 5px !important;
        margin-left: -8px !important;
        white-space: nowrap !important;
        font-size: 24px !important;
        line-height: 1 !important;
        font-weight: 700 !important;
        letter-spacing: -.035em !important;
      }

      [data-iphone13-login-safe-brand="true"] svg {
        width: 24px !important;
        height: 31px !important;
        flex: 0 0 auto !important;
      }

      [data-iphone13-login-safe-actions="true"] {
        position: absolute !important;
        right: 13px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
      }

      [data-iphone13-login-safe-actions="true"] svg {
        width: 23px !important;
        height: 23px !important;
        fill: none !important;
        stroke: #fff !important;
        stroke-width: 1.8 !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function safeHeaderMarkup() {
  return `
    <span data-iphone13-login-safe-tr="true">TR</span>
    <span data-iphone13-login-safe-brand="true">
      <svg viewBox="0 0 76 96" aria-hidden="true" fill="white">
        <rect x="35.2" y="0" width="5.6" height="21" />
        <polygon points="32.8,3 32.8,10.5 25.5,14 25.5,6.5" />
        <polygon points="43.2,3 43.2,10.5 50.5,14 50.5,6.5" />
        <polygon points="25.5,16 32.8,13 32.8,17.5 25.5,20.5" />
        <polygon points="50.5,16 43.2,13 43.2,17.5 50.5,20.5" />
        <polygon points="36.6,21 36.6,33 29,38.5 29,26.5" />
        <polygon points="26.8,28 26.8,40 10,52 10,40" />
        <polygon points="39.4,21 39.4,33 47,38.5 47,26.5" />
        <polygon points="49.2,28 49.2,40 66,52 66,40" />
        <polygon points="36.6,41 36.6,53 29,58.5 29,46.5" />
        <polygon points="26.8,48 26.8,60 10,72 10,60" />
        <polygon points="39.4,41 39.4,53 47,58.5 47,46.5" />
        <polygon points="49.2,48 49.2,60 66,72 66,60" />
        <polygon points="36.6,61 36.6,73 29,78.5 29,66.5" />
        <polygon points="26.8,68 26.8,80 10,92 10,80" />
        <polygon points="39.4,61 39.4,73 47,78.5 47,66.5" />
        <polygon points="49.2,68 49.2,80 66,92 66,80" />
        <polygon points="36.6,80 36.6,96 10,76 10,64" />
        <polygon points="39.4,80 39.4,96 66,76 66,64" />
      </svg>
      <span>Ziraat Bankası</span>
    </span>
    <span data-iphone13-login-safe-actions="true">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H8l-4 4V4Z"/><path d="M8 8h8M8 12h5"/></svg>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>
    </span>
  `;
}

function installLoginSafeHeaders() {
  if (!isIphone13Standalone()) return;

  document
    .querySelectorAll<HTMLImageElement>(
      'img[alt="Ziraat Mobil giriş ekranı"], img[alt="Ziraat Mobil şifre ekranı"]',
    )
    .forEach((image) => {
      const host = image.parentElement;
      if (!host || host.querySelector('[data-iphone13-login-safe-header="true"]')) return;

      const header = document.createElement("div");
      header.setAttribute("data-iphone13-login-safe-header", "true");
      header.innerHTML = safeHeaderMarkup();
      host.appendChild(header);
    });
}

installLoginSafeStyle();
installLoginSafeHeaders();

const loginSafeObserver = new MutationObserver(() => {
  window.requestAnimationFrame(installLoginSafeHeaders);
});

loginSafeObserver.observe(document.body, { childList: true, subtree: true });
