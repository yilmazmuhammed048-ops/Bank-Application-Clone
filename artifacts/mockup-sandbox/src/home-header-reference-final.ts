const HOME_HEADER_REFERENCE_FINAL_ID = "home-header-reference-final-20260826";

function installHomeHeaderReferenceFinal() {
  const previous = document.getElementById(HOME_HEADER_REFERENCE_FINAL_ID);
  if (previous) previous.remove();

  const style = document.createElement("style");
  style.id = HOME_HEADER_REFERENCE_FINAL_ID;
  style.textContent = `
    /*
      Use the COMPLETE supplied reference header bitmap verbatim.
      It owns the red artwork, status bar, avatar, search, message and greeting.
      Do not redraw or layer over it.
    */
    main > div:has(> div.pb-24) > header {
      position: relative !important;
      display: block !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      width: 100% !important;
      height: min(158px, 36.7442vw) !important;
      min-height: min(158px, 36.7442vw) !important;
      max-height: 158px !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background-color: #e30620 !important;
      background-image: url('/header-top-reference-full.jpg?exact=20260826-v4') !important;
      background-repeat: no-repeat !important;
      background-position: center top !important;
      background-size: 100% 100% !important;
      background-blend-mode: normal !important;
    }

    /* Remove every older synthetic gradient / SVG / pseudo layer. */
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

    /* The bitmap owns the complete visible header. Hide duplicate live DOM artwork. */
    main > div:has(> div.pb-24) > header > div:first-child,
    main > div:has(> div.pb-24) > header > p {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
  `;

  document.head.appendChild(style);
}

installHomeHeaderReferenceFinal();
