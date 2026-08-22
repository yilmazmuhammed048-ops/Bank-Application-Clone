const LOGIN_SAFE_STYLE_ID = "iphone13-login-safearea-reference";

function installIphone13LoginSafeArea() {
  if (document.getElementById(LOGIN_SAFE_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = LOGIN_SAFE_STYLE_ID;
  style.textContent = `
    @media (display-mode: standalone) and (min-width: 380px) and (max-width: 400px) {
      /* Only the login root owns the iPhone 13 safe-area geometry. */
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

      /* Keep both supplied iPhone 13 references at native viewport geometry,
         while masking only the fake status/home-indicator areas baked into them. */
      img[alt="Ziraat Mobil giriş ekranı"],
      img[alt="Ziraat Mobil şifre ekranı"] {
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: fill !important;
        transform: none !important;
        clip-path: inset(
          var(--iphone13-login-safe-top)
          0
          var(--iphone13-login-safe-bottom)
          0
        ) !important;
      }

      /* Password panel stays as a full-screen sheet above the login reference. */
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

      /* The screenshot already contains the visible white Login pill. The React
         button stays invisible but receives the tap over that exact area. */
      button[aria-label="Giriş Yap"] {
        position: absolute !important;
        left: 12.9% !important;
        top: 59.5% !important;
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

      /* Replace the baked-in password field with one clean interactive capsule.
         The white halo masks the reference outline underneath, then the single
         gray border redraws the complete original rounded rectangle. */
      div:has(> input[aria-label="Şifreniz"]) {
        left: 3.8% !important;
        top: 38.9% !important;
        width: 92.4% !important;
        height: 6.15% !important;
        box-sizing: border-box !important;
        border: 1px solid #9da1a3 !important;
        border-radius: 999px !important;
        background: #ffffff !important;
        box-shadow: 0 0 0 4px #ffffff !important;
        padding-left: 4.2% !important;
        padding-right: 4.2% !important;
        overflow: hidden !important;
      }

      input[aria-label="Şifreniz"] {
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        min-width: 0 !important;
      }

      div:has(> input[aria-label="Şifreniz"]) > button {
        white-space: nowrap !important;
      }

      /* Keep the actual password controls interactive above the supplied image. */
      input[aria-label="Şifreniz"],
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
