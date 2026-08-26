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

const HOME_REFERENCE_FINAL_STYLE_ID = "home-reference-final-polish-20260826";

function installHomeReferenceFinalPolish() {
  if (document.getElementById(HOME_REFERENCE_FINAL_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = HOME_REFERENCE_FINAL_STYLE_ID;
  style.textContent = `
    /* Final home-screen alignment layer. Data values intentionally remain dynamic. */
    main > div:has(> div.pb-24) > header {
      background-color: #df071f !important;
      background-image:
        radial-gradient(120% 95% at 42% -25%, rgba(255,65,82,.38) 0 42%, transparent 43%),
        linear-gradient(143deg, transparent 0 53%, rgba(125,0,18,.20) 53% 64%, transparent 64.5%),
        linear-gradient(180deg, #e30b25 0%, #dc061f 100%) !important;
      background-position: center !important;
      background-size: cover !important;
    }

    main > div:has(> div.pb-24) > header::before {
      left: -14% !important;
      top: -57px !important;
      width: 126% !important;
      height: 112px !important;
      border-radius: 0 0 72% 44% !important;
      transform: rotate(4deg) !important;
      background: linear-gradient(180deg, rgba(255,69,84,.30), rgba(128,0,17,.08)) !important;
    }

    main > div:has(> div.pb-24) > header::after {
      right: -82px !important;
      bottom: -52px !important;
      width: 282px !important;
      height: 118px !important;
      border-radius: 58% 0 0 0 !important;
      transform: rotate(24deg) !important;
      background: linear-gradient(90deg, rgba(119,0,17,.23), rgba(119,0,17,.04)) !important;
    }

    /* Reference message glyph has three inner message lines. */
    main > div:has(> div.pb-24) > header > div:first-child > button:last-child svg {
      display: none !important;
    }

    main > div:has(> div.pb-24) > header > div:first-child > button:last-child::before {
      content: "" !important;
      display: block !important;
      width: 24px !important;
      height: 24px !important;
      background-repeat: no-repeat !important;
      background-position: center !important;
      background-size: contain !important;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' fill='none' stroke='%23ffffff' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 5.5h18v14H11l-5.5 4v-4H5v-14Z'/%3E%3Cpath d='M9 10h10M9 13.5h10M9 17h6.5'/%3E%3C/svg%3E") !important;
    }

    /* Tabs: pull Kredi Kartlarım left and seat the menu button slightly lower. */
    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > div:first-child {
      gap: 16px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > div:first-child > button:last-child {
      transform: translateY(5px) !important;
    }

    /* Account content sits a few pixels lower in the reference. */
    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section {
      padding-top: 28px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section::after {
      top: 26px !important;
      background-size: 26px 26px !important;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30' fill='none' stroke='%232b3033' stroke-width='1.65' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='5' y='6' width='7' height='7' rx='1.2'/%3E%3Crect x='18' y='17' width='7' height='7' rx='1.2'/%3E%3Cpath d='M17 6h3a5 5 0 0 1 5 5v2'/%3E%3Cpath d='m21.5 9.5 3.5 3.5 3.5-3.5'/%3E%3Cpath d='M13 24h-3a5 5 0 0 1-5-5v-2'/%3E%3Cpath d='M8.5 20.5 5 17l-3.5 3.5'/%3E%3C/svg%3E") !important;
    }

    /* Reference chip is noticeably shorter, which also brings the account number left. */
    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:nth-of-type(1) {
      gap: 9px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:nth-of-type(1) > span:first-child {
      height: 29px !important;
      padding: 0 8px !important;
      border-radius: 9px !important;
      font-size: 11.4px !important;
      white-space: nowrap !important;
    }

    /* Keep IBAN share icon attached to the actual dynamic IBAN text. */
    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:nth-of-type(2) {
      gap: 7px !important;
    }

    /* Shortcut title/card geometry. */
    main > div:has(> div.pb-24) > div.pb-24 > section > div:first-child {
      transform: translateY(4px) !important;
      margin-bottom: 20px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:first-child::after {
      content: "Tüm Kısayollarım" !important;
      right: 19px !important;
      color: #25282a !important;
      font-size: 12.6px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:first-child h2::after {
      content: "→" !important;
      position: absolute !important;
      top: -1px !important;
      right: 0 !important;
      color: #e30620 !important;
      font-size: 19px !important;
      line-height: 1 !important;
      font-weight: 400 !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child {
      transform: translateY(6px) !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button {
      height: 85px !important;
      min-height: 85px !important;
      gap: 6px !important;
      border-radius: 10px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button > span:first-child {
      width: 28px !important;
      height: 28px !important;
      flex-basis: 28px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button > span:first-child::before {
      width: 27px !important;
      height: 27px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button:nth-child(1) > span:first-child::before,
    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button:nth-child(2) > span:first-child::before {
      width: 25px !important;
      height: 25px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button > span:last-child::after {
      font-size: 13.4px !important;
      line-height: 1.08 !important;
      letter-spacing: -.018em !important;
    }

    /* Bottom navigation: use reference-like glyphs and never wrap Tüm Menü. */
    main > div:has(> div.pb-24) > nav > button {
      gap: 5px !important;
      font-size: 12.4px !important;
      line-height: 1 !important;
    }

    main > div:has(> div.pb-24) > nav > button > svg {
      display: none !important;
    }

    main > div:has(> div.pb-24) > nav > button::before {
      content: "" !important;
      display: block !important;
      width: 24px !important;
      height: 24px !important;
      flex: 0 0 24px !important;
      background-color: currentColor !important;
      -webkit-mask-repeat: no-repeat !important;
      -webkit-mask-position: center !important;
      -webkit-mask-size: contain !important;
      mask-repeat: no-repeat !important;
      mask-position: center !important;
      mask-size: contain !important;
    }

    main > div:has(> div.pb-24) > nav > button:nth-child(1)::before {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='m4 12 10-8 10 8v11H17v-7h-6v7H4V12Z'/%3E%3C/svg%3E") !important;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='m4 12 10-8 10 8v11H17v-7h-6v7H4V12Z'/%3E%3C/svg%3E") !important;
    }

    main > div:has(> div.pb-24) > nav > button:nth-child(2)::before {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M5 7h14a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3V7Zm0 4h13m0 5h4'/%3E%3Ccircle cx='18' cy='16' r='1' fill='black'/%3E%3C/svg%3E") !important;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M5 7h14a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3V7Zm0 4h13m0 5h4'/%3E%3Ccircle cx='18' cy='16' r='1' fill='black'/%3E%3C/svg%3E") !important;
    }

    main > div:has(> div.pb-24) > nav > button:nth-child(3)::before {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M4 9h18m-4-4 4 4-4 4M24 19H6m4 4-4-4 4-4'/%3E%3C/svg%3E") !important;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M4 9h18m-4-4 4 4-4 4M24 19H6m4 4-4-4 4-4'/%3E%3C/svg%3E") !important;
    }

    main > div:has(> div.pb-24) > nav > button:nth-child(4)::before {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Crect x='6' y='4' width='16' height='20' rx='2' fill='none' stroke='black' stroke-width='2'/%3E%3Cpath d='m10 14 2.6 2.6L18 11' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Crect x='6' y='4' width='16' height='20' rx='2' fill='none' stroke='black' stroke-width='2'/%3E%3Cpath d='m10 14 2.6 2.6L18 11' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
    }

    main > div:has(> div.pb-24) > nav > button:nth-child(5)::before {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath d='M5 7h18M5 14h18M5 21h18' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") !important;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath d='M5 7h18M5 14h18M5 21h18' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") !important;
    }

    main > div:has(> div.pb-24) > nav > button > span:first-of-type {
      width: auto !important;
      height: auto !important;
      margin-top: 0 !important;
      white-space: nowrap !important;
    }

    main > div:has(> div.pb-24) > nav > button > span:nth-of-type(2) {
      width: 6px !important;
      height: 6px !important;
      margin-top: 1px !important;
    }
  `;

  document.head.appendChild(style);
}

installHomeReferenceFinalPolish();
