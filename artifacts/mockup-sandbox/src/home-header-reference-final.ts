const HOME_EXACT_REFERENCE_STYLE_ID = "home-exact-reference-20260826";

function installHomeExactReference() {
  const previous = document.getElementById(HOME_EXACT_REFERENCE_STYLE_ID);
  if (previous) previous.remove();

  const style = document.createElement("style");
  style.id = HOME_EXACT_REFERENCE_STYLE_ID;
  style.textContent = `
    /*
      Measured directly from the supplied 946x2048 reference screenshot.
      946 source px = 390 CSS px. This is the final home-only override.
    */
    main > div:has(> div.pb-24) {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif !important;
      background: #fff !important;
    }

    /* Exact supplied red header artwork. System status icons remain device-owned. */
    main > div:has(> div.pb-24) > header {
      position: relative !important;
      display: block !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      width: 100% !important;
      height: 144.7px !important;
      min-height: 144.7px !important;
      max-height: 144.7px !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: #e30620 url('/home-header-reference-exact.webp?v=1') center top / 100% 100% no-repeat !important;
      color: transparent !important;
    }

    main > div:has(> div.pb-24) > header::before,
    main > div:has(> div.pb-24) > header::after,
    main > div:has(> div.pb-24) > header[class]::before,
    main > div:has(> div.pb-24) > header[class]::after {
      content: none !important;
      display: none !important;
      background: none !important;
      background-image: none !important;
      filter: none !important;
      transform: none !important;
    }

    /* Bitmap owns the visible avatar/search/message/greeting. Keep invisible hit targets alive. */
    main > div:has(> div.pb-24) > header > div:first-child {
      position: absolute !important;
      inset: 0 !important;
      z-index: 2 !important;
      opacity: 0 !important;
      visibility: visible !important;
      pointer-events: auto !important;
    }

    main > div:has(> div.pb-24) > header > p {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* Main content begins at reference y=351. */
    main > div:has(> div.pb-24) > div.pb-24 {
      box-sizing: border-box !important;
      padding-bottom: 148px !important;
      background: #fff !important;
    }

    /* Tips: reference y=351..494 = 59.4 CSS px. */
    main > div:has(> div.pb-24) > div.pb-24 > button:first-child {
      height: 59.4px !important;
      min-height: 59.4px !important;
      box-sizing: border-box !important;
      padding: 0 15.7px !important;
      background: #efefef !important;
      color: #1f2023 !important;
      font-size: 17.2px !important;
      line-height: 1 !important;
      font-weight: 650 !important;
      letter-spacing: -.026em !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > button:first-child svg {
      width: 19px !important;
      height: 19px !important;
      color: #e30620 !important;
      stroke-width: 2.2 !important;
    }

    /* Account canvas: reference y=495..1283 = 325px total (55px tabs + 270px account). */
    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 {
      box-sizing: border-box !important;
      padding-left: 15.7px !important;
      padding-right: 15.7px !important;
      background: #fff !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > div:first-child {
      height: 55px !important;
      min-height: 55px !important;
      margin-top: 0 !important;
      gap: 25.5px !important;
      align-items: flex-end !important;
      border-bottom: 0 !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > div:first-child > button:nth-child(1),
    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > div:first-child > button:nth-child(2) {
      padding-bottom: 11.8px !important;
      font-size: 16.8px !important;
      line-height: 1 !important;
      letter-spacing: -.025em !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > div:first-child > button:nth-child(1) {
      font-weight: 650 !important;
      color: #242326 !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > div:first-child > button:nth-child(1)::after {
      bottom: 0 !important;
      height: 2px !important;
      width: 89px !important;
      background: #e30620 !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > div:first-child > button:nth-child(2) {
      color: #6d7072 !important;
      font-weight: 400 !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > div:first-child > button:last-child {
      width: 40px !important;
      height: 40px !important;
      margin-bottom: 4.5px !important;
      border-radius: 12px !important;
      background: #f0f0f0 !important;
      transform: none !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > div:first-child > button:last-child svg {
      width: 19px !important;
      height: 19px !important;
      stroke-width: 1.65 !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section {
      position: relative !important;
      height: 270px !important;
      min-height: 270px !important;
      box-sizing: border-box !important;
      padding-top: 20px !important;
      padding-bottom: 24.5px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section::after {
      content: "" !important;
      position: absolute !important;
      top: 18px !important;
      right: 0 !important;
      width: 40px !important;
      height: 40px !important;
      border-radius: 12px !important;
      background-color: #f0f0f0 !important;
      background-repeat: no-repeat !important;
      background-position: center !important;
      background-size: 23px 23px !important;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30' fill='none' stroke='%232b3033' stroke-width='1.65' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='5' y='6' width='7' height='7' rx='1.2'/%3E%3Crect x='18' y='17' width='7' height='7' rx='1.2'/%3E%3Cpath d='M17 6h3a5 5 0 0 1 5 5v2'/%3E%3Cpath d='m21.5 9.5 3.5 3.5 3.5-3.5'/%3E%3Cpath d='M13 24h-3a5 5 0 0 1-5-5v-2'/%3E%3Cpath d='M8.5 20.5 5 17l-3.5 3.5'/%3E%3C/svg%3E") !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section h2 {
      margin-right: 52px !important;
      color: #e20b24 !important;
      font-size: 15.6px !important;
      line-height: 17px !important;
      font-weight: 650 !important;
      letter-spacing: -.012em !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:nth-of-type(1) {
      margin-top: 12.7px !important;
      gap: 9px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:nth-of-type(1) > span:first-child {
      display: inline-flex !important;
      height: 27.2px !important;
      align-items: center !important;
      box-sizing: border-box !important;
      padding: 0 8px !important;
      border-radius: 9px !important;
      background: #aa9a6d !important;
      color: #fff !important;
      font-size: 10.9px !important;
      line-height: 1 !important;
      font-weight: 600 !important;
      white-space: nowrap !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:nth-of-type(1) > span:last-child {
      color: #242729 !important;
      font-size: 13.8px !important;
      line-height: 1 !important;
      font-weight: 400 !important;
      letter-spacing: -.02em !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:nth-of-type(2) {
      justify-content: flex-start !important;
      margin-top: 18px !important;
      padding-right: 0 !important;
      gap: 7.3px !important;
    }

    /* Reference IBAN is fixed for this displayed account; keep the app data logic untouched elsewhere. */
    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:nth-of-type(2) > span {
      flex: 0 0 auto !important;
      max-width: none !important;
      overflow: visible !important;
      text-overflow: clip !important;
      white-space: nowrap !important;
      color: #25282a !important;
      font-size: 0 !important;
      line-height: 1 !important;
      font-weight: 400 !important;
      letter-spacing: -.025em !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:nth-of-type(2) > span::after {
      content: "TR31 0001 0090 1041 2062 7050 01" !important;
      font-size: 14.7px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:nth-of-type(2) > button {
      width: 24px !important;
      height: 24px !important;
      flex: 0 0 24px !important;
      margin: 0 !important;
      color: #e30620 !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:nth-of-type(2) > button svg {
      width: 19px !important;
      height: 19px !important;
      stroke-width: 2 !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > p:nth-of-type(1) {
      margin-top: 19px !important;
      color: #33383b !important;
      font-size: 12px !important;
      line-height: 1 !important;
      font-weight: 400 !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > p:nth-of-type(2) {
      margin-top: 4.5px !important;
      color: #1e1d22 !important;
      font-size: 19px !important;
      line-height: 20px !important;
      font-weight: 650 !important;
      letter-spacing: -.015em !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:last-child {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      margin-top: 18px !important;
      gap: 10px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > div.px-5 > section > div:last-child > button {
      display: flex !important;
      height: 50px !important;
      min-height: 50px !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
      padding: 0 12.7px !important;
      border: 0 !important;
      border-radius: 999px !important;
      background: #ed0018 !important;
      box-shadow: none !important;
      color: #fff !important;
      font-size: 14.2px !important;
      line-height: 1 !important;
      font-weight: 400 !important;
      letter-spacing: -.018em !important;
      white-space: nowrap !important;
    }

    /* Shortcuts: reference y=1284..1689 = 167 CSS px. */
    main > div:has(> div.pb-24) > div.pb-24 > section {
      position: relative !important;
      height: 167px !important;
      min-height: 167px !important;
      box-sizing: border-box !important;
      margin-top: 0 !important;
      padding: 20px 15.3px 0 !important;
      overflow: visible !important;
      background: #efefef !important;
    }

    /* User excluded the promo/ad band from the match; do not let older pseudo-bands alter the shortcut geometry. */
    main > div:has(> div.pb-24) > div.pb-24 > section::after {
      content: none !important;
      display: none !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:first-child {
      position: relative !important;
      margin-bottom: 16px !important;
      transform: none !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:first-child h2 {
      color: #202326 !important;
      font-size: 17.2px !important;
      line-height: 1 !important;
      font-weight: 650 !important;
      letter-spacing: -.02em !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:first-child::after {
      content: "Tüm Kısayollarım" !important;
      position: absolute !important;
      top: 0 !important;
      right: 17px !important;
      color: #202426 !important;
      font-size: 11.8px !important;
      line-height: 1 !important;
      font-weight: 400 !important;
      letter-spacing: -.01em !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:first-child h2::after {
      content: "→" !important;
      position: absolute !important;
      top: -2px !important;
      right: 0 !important;
      color: #e30620 !important;
      font-size: 17px !important;
      line-height: 1 !important;
      font-weight: 400 !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child {
      gap: 8.2px !important;
      transform: none !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button {
      height: 84px !important;
      min-height: 84px !important;
      border-radius: 9px !important;
      gap: 6px !important;
      box-shadow: none !important;
      color: #202326 !important;
      font-size: 12px !important;
      line-height: 1.08 !important;
      font-weight: 400 !important;
      letter-spacing: -.01em !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button > span:first-child {
      display: grid !important;
      width: 21px !important;
      height: 21px !important;
      flex: 0 0 21px !important;
      place-items: center !important;
      color: #e30620 !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button > span:first-child svg {
      width: 20px !important;
      height: 20px !important;
      stroke-width: 1.75 !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button:nth-child(2) > span:first-child svg {
      width: 19px !important;
      height: 22px !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button:nth-child(3) > span:first-child svg,
    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button:nth-child(4) > span:first-child svg {
      display: none !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button:nth-child(3) > span:first-child::before,
    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button:nth-child(4) > span:first-child::before {
      content: "" !important;
      display: block !important;
      width: 21px !important;
      height: 21px !important;
      background-repeat: no-repeat !important;
      background-position: center !important;
      background-size: contain !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button:nth-child(3) > span:first-child::before {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30' fill='none' stroke='%23e30620' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='6' y='4' width='18' height='8' rx='2'/%3E%3Cpath d='M9 12v13h12V12'/%3E%3Cpath d='M15 15v7M12 19l3 3 3-3'/%3E%3C/svg%3E") !important;
    }

    main > div:has(> div.pb-24) > div.pb-24 > section > div:last-child > button:nth-child(4) > span:first-child::before {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30' fill='none' stroke='%23e30620' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 8c4 1 7-2 11-1 4 1 7-2 11-1v16c-4-1-7 2-11 1-4-1-7 2-11 1V8Z'/%3E%3Ccircle cx='15' cy='15' r='3'/%3E%3C/svg%3E") !important;
    }

    /* Reference bottom navigation begins around CSS y=763 and includes the iOS bottom safe area. */
    main > div:has(> div.pb-24) > nav {
      height: 82px !important;
      box-sizing: border-box !important;
      padding: 11px 3.5px 0 !important;
      align-items: flex-start !important;
      border-top: 1px solid #eeeeee !important;
      background: #fff !important;
      box-shadow: none !important;
    }

    main > div:has(> div.pb-24) > nav > button {
      gap: 4px !important;
      color: #777b7d !important;
      font-size: 11.8px !important;
      line-height: 1 !important;
      font-weight: 500 !important;
    }

    main > div:has(> div.pb-24) > nav > button:first-child {
      color: #df0b25 !important;
      font-weight: 600 !important;
    }

    main > div:has(> div.pb-24) > nav > button > svg {
      display: none !important;
    }

    main > div:has(> div.pb-24) > nav > button::before {
      content: "" !important;
      display: block !important;
      width: 22px !important;
      height: 22px !important;
      flex: 0 0 22px !important;
      background-color: currentColor !important;
      -webkit-mask-repeat: no-repeat !important;
      -webkit-mask-position: center !important;
      -webkit-mask-size: contain !important;
      mask-repeat: no-repeat !important;
      mask-position: center !important;
      mask-size: contain !important;
    }

    main > div:has(> div.pb-24) > nav > button:nth-child(1)::before {
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='m4 12 10-8 10 8v11H4V12Z'/%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' d='M10 20h8'/%3E%3C/svg%3E") !important;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='m4 12 10-8 10 8v11H4V12Z'/%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' d='M10 20h8'/%3E%3C/svg%3E") !important;
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

    main > div:has(> div.pb-24) > nav > button > span:last-child {
      width: 5.5px !important;
      height: 5.5px !important;
      margin-top: 7px !important;
    }

    @media (max-width: 370px) {
      main > div:has(> div.pb-24) > header {
        background-size: cover !important;
      }
    }
  `;

  document.head.appendChild(style);
}

installHomeExactReference();
