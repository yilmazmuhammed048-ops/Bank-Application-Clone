const LOGIN_SAFE_STYLE_ID = "iphone13-login-safearea-reference";

function installIphone13LoginSafeArea() {
  if (document.getElementById(LOGIN_SAFE_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = LOGIN_SAFE_STYLE_ID;
  style.textContent = `
    @media (display-mode: standalone) and (min-width: 380px) and (max-width: 400px) {
      div:has(> img[alt="Ziraat Mobil giriş ekranı"]) {
        --iphone13-login-safe-top: max(env(safe-area-inset-top, 0px), 47px);
        --iphone13-login-safe-bottom: max(env(safe-area-inset-bottom, 0px), 34px);
        position: relative !important;
        overflow: hidden !important;
        background: #d91417 !important;
      }

      /* Preserve every approved coordinate outside the promo strip. */
      img[alt="Ziraat Mobil giriş ekranı"],
      img[alt="Ziraat Mobil şifre ekranı"] {
        top: -4.4% !important;
        left: 0 !important;
        width: 100% !important;
        height: 106.8% !important;
        object-fit: fill !important;
        transform: none !important;
      }

      div:has(> img[alt="Ziraat Mobil giriş ekranı"]) > img[alt="Ziraat Mobil giriş ekranı"] {
        clip-path: inset(52px 0 var(--iphone13-login-safe-bottom) 0) !important;
      }

      /* Exact TR + Ziraat Bankası + message/bell row. End it before the promo cards. */
      div:has(> img[alt="Ziraat Mobil giriş ekranı"])::before {
        content: "" !important;
        display: block !important;
        position: absolute !important;
        z-index: 30 !important;
        left: 0 !important;
        top: var(--iphone13-login-safe-top) !important;
        width: 100% !important;
        height: 56px !important;
        pointer-events: none !important;
        background-image: url('/ziraat-login-reference.jpg') !important;
        background-repeat: no-repeat !important;
        background-size: 100% auto !important;
        background-position: center -43px !important;
      }

      div:has(> img[alt="Ziraat Mobil giriş ekranı"])::after {
        content: "" !important;
        display: block !important;
        position: absolute !important;
        z-index: 29 !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: var(--iphone13-login-safe-top) !important;
        pointer-events: none !important;
        background: #d91417 !important;
      }

      [data-iphone13-exact-login-header="true"],
      [data-iphone13-login-safe-header="true"] {
        display: none !important;
      }

      /* Post-login loading skeleton: keep controls below the real iPhone 13 status area.
         The red header itself still fills behind the system status bar. */
      #root > div > header:first-child {
        box-sizing: border-box !important;
        padding-top: calc(max(env(safe-area-inset-top, 0px), 47px) + 10px) !important;
        background-color: #e30620 !important;
        background-position: center top !important;
      }

      /* Invisible tap target over the single Login pill in the supplied reference. */
      button[aria-label="Giriş Yap"] {
        position: absolute !important;
        left: 12.9% !important;
        top: 62.95% !important;
        width: 74.2% !important;
        height: 6.05% !important;
        z-index: 120 !important;
        pointer-events: auto !important;
        touch-action: manipulation !important;
        -webkit-tap-highlight-color: transparent !important;
        background: transparent !important;
        color: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
        font-size: 0 !important;
        opacity: 1 !important;
        overflow: visible !important;
      }

      /* Hide the original promo row before painting the shifted row. This prevents
         the old card text/top border from peeking out behind the replacement. */
      button[aria-label="Giriş Yap"]::after {
        content: "" !important;
        position: fixed !important;
        z-index: -2 !important;
        left: 0 !important;
        top: calc(var(--iphone13-login-safe-top) + 52px) !important;
        width: 100vw !important;
        height: 28px !important;
        pointer-events: none !important;
        background: #d91417 !important;
      }

      /* Move ONLY the promo/card strip 16px down in iPhone 13 Home Screen mode.
         This layer replaces the original strip with the same reference artwork,
         shifted down, while every other element stays at its approved coordinate. */
      button[aria-label="Giriş Yap"]::before {
        content: "" !important;
        position: fixed !important;
        z-index: -1 !important;
        left: 0 !important;
        top: calc(var(--iphone13-login-safe-top) + 60px) !important;
        width: 100vw !important;
        height: 96px !important;
        pointer-events: none !important;
        background-color: #d91417 !important;
        background-image: url('/ziraat-login-reference.jpg') !important;
        background-repeat: no-repeat !important;
        background-size: 100vw 106.8dvh !important;
        background-position: center calc(-4.4dvh - var(--iphone13-login-safe-top) - 44px) !important;
      }

      /* Password sheet starts below the real iPhone 13 status safe area. */
      div:has(> img[alt="Ziraat Mobil şifre ekranı"]) {
        position: absolute !important;
        left: 0 !important;
        right: 0 !important;
        top: var(--iphone13-login-safe-top) !important;
        bottom: 0 !important;
        width: 100% !important;
        height: auto !important;
        z-index: 160 !important;
        overflow: hidden !important;
        background: #ffffff !important;
      }

      div:has(> img[alt="Ziraat Mobil şifre ekranı"])::before,
      div:has(> img[alt="Ziraat Mobil şifre ekranı"])::after {
        content: none !important;
        display: none !important;
      }

      /* One complete password capsule: the reference owns the outline; controls only paint inside it. */
      div:has(> input[aria-label="Şifreniz"]) {
        left: 3.8% !important;
        top: 38.9% !important;
        width: 92.4% !important;
        height: 6.15% !important;
        box-sizing: border-box !important;
        border: 0 !important;
        border-radius: 999px !important;
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
        overflow: visible !important;
      }

      input[aria-label="Şifreniz"] {
        position: absolute !important;
        left: 4.2% !important;
        top: 15% !important;
        width: 47% !important;
        height: 70% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: #ffffff !important;
        box-shadow: none !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        min-width: 0 !important;
        color: #3f474b !important;
        caret-color: #333 !important;
        font-size: 18px !important;
        font-weight: 600 !important;
        line-height: 1 !important;
        letter-spacing: .12em !important;
      }

      input[aria-label="Şifreniz"]::placeholder {
        color: #9da1a3 !important;
        opacity: 1 !important;
        font-size: 18px !important;
        font-weight: 600 !important;
        letter-spacing: 0 !important;
      }

      div:has(> input[aria-label="Şifreniz"]) > button {
        position: absolute !important;
        right: 4.2% !important;
        top: 0 !important;
        width: 43% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: linear-gradient(to bottom, transparent 0 15%, #ffffff 15% 85%, transparent 85% 100%) !important;
        box-shadow: none !important;
        color: #333b3f !important;
        font-size: 17px !important;
        font-weight: 600 !important;
        line-height: 1 !important;
        text-decoration: underline !important;
        text-underline-offset: 2px !important;
        white-space: nowrap !important;
      }

      input[aria-label="Şifreniz"],
      div:has(> input[aria-label="Şifreniz"]) > button,
      button[aria-label="Giriş"],
      button[aria-label="Kapat"] {
        pointer-events: auto !important;
        touch-action: manipulation !important;
      }
    }
  `;

  document.head.appendChild(style);
}

installIphone13LoginSafeArea();
