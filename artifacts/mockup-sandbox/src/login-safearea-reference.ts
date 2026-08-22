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

      /* Keep the same geometry that already looks correct in Safari. Home Screen
         must not rescale/reposition the supplied references; it only masks the
         baked status/home-indicator strips. */
      img[alt="Ziraat Mobil giriş ekranı"],
      img[alt="Ziraat Mobil şifre ekranı"] {
        top: -4.4% !important;
        left: 0 !important;
        width: 100% !important;
        height: 106.8% !important;
        object-fit: fill !important;
        transform: none !important;
      }

      /* The password panel itself stays fixed to the visible PWA viewport. */
      div:has(> img[alt="Ziraat Mobil şifre ekranı"]) {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 160 !important;
        overflow: hidden !important;
        background: #ffffff !important;
      }

      div:has(> img[alt="Ziraat Mobil giriş ekranı"])::before,
      div:has(> img[alt="Ziraat Mobil giriş ekranı"])::after,
      div:has(> img[alt="Ziraat Mobil şifre ekranı"])::before,
      div:has(> img[alt="Ziraat Mobil şifre ekranı"])::after {
        content: none !important;
        display: none !important;
      }

      [data-iphone13-exact-login-header="true"],
      [data-iphone13-login-safe-header="true"] {
        display: none !important;
      }

      /* Invisible tap target over the single Login pill in the reference. */
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
      }

      /* Do not move the password controls in standalone mode. Their component
         geometry already matches the reference in Safari. Only make the real input
         paint over the baked placeholder so text never doubles. */
      div:has(> input[aria-label="Şifreniz"]) {
        box-sizing: border-box !important;
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      input[aria-label="Şifreniz"] {
        border: 0 !important;
        background: #ffffff !important;
        box-shadow: none !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        min-width: 0 !important;
        color: #3f474b !important;
        caret-color: #333 !important;
      }

      input[aria-label="Şifreniz"]::placeholder {
        color: #9da1a3 !important;
        opacity: 1 !important;
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
