const HOME_HEADER_REFERENCE_FINAL_ID = "home-header-reference-final-20260826";

function installHomeHeaderReferenceFinal() {
  const previous = document.getElementById(HOME_HEADER_REFERENCE_FINAL_ID);
  if (previous) previous.remove();

  const style = document.createElement("style");
  style.id = HOME_HEADER_REFERENCE_FINAL_ID;
  style.textContent = `
    /*
      Do not redraw the home header. The repository already contains the exact
      supplied 1170x429 reference crop. Lock that bitmap as the complete header
      so later CSS cannot replace it with gradients, SVG waves or pseudo layers.
    */
    main > div:has(> div.pb-24) > header {
      position: relative !important;
      display: block !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      width: 100% !important;
      height: min(157.67px, 36.6667vw) !important;
      min-height: min(157.67px, 36.6667vw) !important;
      max-height: 157.67px !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background-color: #e30620 !important;
      background-image: url('/header-background-reference.jpg?exact=20260826') !important;
      background-repeat: no-repeat !important;
      background-position: center top !important;
      background-size: 100% 100% !important;
      background-blend-mode: normal !important;
    }

    /* The bitmap already contains the exact avatar, search, message and greeting artwork. */
    main > div:has(> div.pb-24) > header > div:first-child,
    main > div:has(> div.pb-24) > header > p {
      opacity: 0 !important;
      visibility: visible !important;
    }

    /* Keep the transparent avatar/search/message hit area available without repainting it. */
    main > div:has(> div.pb-24) > header > div:first-child {
      pointer-events: auto !important;
    }

    main > div:has(> div.pb-24) > header > p {
      pointer-events: none !important;
    }

    /* Kill every older synthetic wave/geometric layer. */
    main > div:has(> div.pb-24) > header::before,
    main > div:has(> div.pb-24) > header::after {
      content: none !important;
      display: none !important;
      background: none !important;
      background-image: none !important;
    }
  `;

  document.head.appendChild(style);
}

installHomeHeaderReferenceFinal();
