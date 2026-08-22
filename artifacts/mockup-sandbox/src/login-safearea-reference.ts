const LOGIN_SAFE_STYLE_ID = "iphone13-login-safearea-reference";

function installIphone13LoginSafeArea() {
  if (document.getElementById(LOGIN_SAFE_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = LOGIN_SAFE_STYLE_ID;
  style.textContent = `
    @media (display-mode: standalone) and (min-width: 380px) and (max-width: 400px) {
      div:has(> img[alt="Ziraat Mobil giriş ekranı"]),
      div:has(> img[alt="Ziraat Mobil şifre ekranı"]) {
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

      /* Keep the supplied iPhone 13 reference at its native 390x844 geometry.
         Only mask the fake status/home-indicator areas already baked into the
         screenshot. The real PWA safe areas then show through behind iOS. */
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

      /* Remove every previous safe-area/header patch. */
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

      /* The visible Home Screen reference button sits at 59.5% of the viewport.
         Keep the real React button exactly on top of that visual button so the
         entire pill is tappable, not only its lower edge. */
      button[aria-label="Giriş Yap"] {
        left: 12.9% !important;
        top: 59.5% !important;
        width: 74.2% !important;
        height: 5.65% !important;
        z-index: 80 !important;
        pointer-events: auto !important;
        touch-action: manipulation !important;
        -webkit-tap-highlight-color: transparent !important;
      }
    }
  `;

  document.head.appendChild(style);
}

installIphone13LoginSafeArea();
