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
        background: linear-gradient(
          to bottom,
          #d91417 0,
          #d91417 calc(100% - var(--iphone13-login-safe-bottom)),
          #ffffff calc(100% - var(--iphone13-login-safe-bottom)),
          #ffffff 100%
        ) !important;
      }

      /* Home Screen master reference approved for iPhone 13.
         Its own status bar and home-indicator strips were removed, so only the
         real iOS safe areas remain outside this image. */
      div:has(> img[alt="Ziraat Mobil giriş ekranı"]) > img[alt="Ziraat Mobil giriş ekranı"] {
        content: url('/iphone13-home-reference.svg') !important;
        position: absolute !important;
        left: 0 !important;
        top: var(--iphone13-login-safe-top) !important;
        width: 100% !important;
        height: calc(100% - var(--iphone13-login-safe-top) - var(--iphone13-login-safe-bottom)) !important;
        object-fit: fill !important;
        clip-path: none !important;
        transform: none !important;
      }

      div:has(> img[alt="Ziraat Mobil giriş ekranı"])::before,
      div:has(> img[alt="Ziraat Mobil giriş ekranı"])::after {
        content: none !important;
        display: none !important;
      }

      [data-iphone13-exact-login-header="true"],
      [data-iphone13-login-safe-header="true"] {
        display: none !important;
      }

      /* Invisible interaction target over the single visible Login pill in the
         approved Home Screen reference. */
      button[aria-label="Giriş Yap"] {
        position: absolute !important;
        left: 13.3% !important;
        top: 65.35% !important;
        width: 73.6% !important;
        height: 6.15% !important;
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

      img[alt="Ziraat Mobil şifre ekranı"] {
        top: -4.4% !important;
        left: 0 !important;
        width: 100% !important;
        height: 106.8% !important;
        object-fit: fill !important;
        transform: none !important;
      }

      div:has(> img[alt="Ziraat Mobil şifre ekranı"])::before,
      div:has(> img[alt="Ziraat Mobil şifre ekranı"])::after {
        content: none !important;
        display: none !important;
      }

      /* One complete password capsule: reference owns the outline. */
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
