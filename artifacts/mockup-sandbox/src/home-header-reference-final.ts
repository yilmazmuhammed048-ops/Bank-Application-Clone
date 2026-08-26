const HOME_HEADER_REFERENCE_FINAL_ID = "home-header-reference-final-20260826";

function installHomeHeaderReferenceFinal() {
  if (document.getElementById(HOME_HEADER_REFERENCE_FINAL_ID)) return;

  const style = document.createElement("style");
  style.id = HOME_HEADER_REFERENCE_FINAL_ID;
  style.textContent = `
    /* Final home header artwork: smooth curved layers matching the supplied reference. */
    main > div:has(> div.pb-24) > header {
      position: relative !important;
      overflow: hidden !important;
      background-color: #e30620 !important;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 946 350' preserveAspectRatio='none'%3E%3Crect width='946' height='350' fill='%23e30620'/%3E%3Cpath d='M-90 3 C145 66 339 26 564 67 C731 98 836 139 1035 196 L1035 -40 L-90 -40 Z' fill='%23ff3047' opacity='.23'/%3E%3Cpath d='M-110 54 C129 103 322 79 518 122 C696 161 830 222 1030 318 L1030 392 L-110 392 Z' fill='%23a8071c' opacity='.17'/%3E%3Cpath d='M-125 132 C128 72 324 89 520 139 C685 181 815 246 1024 346 L1024 392 L-125 392 Z' fill='%23c1081d' opacity='.20'/%3E%3Cpath d='M265 -35 C448 22 638 63 812 130 C886 158 949 190 1026 235 L1026 -35 Z' fill='%23ff1833' opacity='.16'/%3E%3Cpath d='M434 90 C605 122 780 187 1005 326 L1005 390 L842 390 C730 286 607 202 434 145 Z' fill='%238b0618' opacity='.12'/%3E%3C/svg%3E") !important;
      background-repeat: no-repeat !important;
      background-position: center top !important;
      background-size: 100% 100% !important;
    }

    /* Remove older geometric pseudo-layers so only the smooth reference artwork remains. */
    main > div:has(> div.pb-24) > header::before,
    main > div:has(> div.pb-24) > header::after {
      content: none !important;
      display: none !important;
      background: none !important;
    }

    /* Keep all header controls above the artwork. */
    main > div:has(> div.pb-24) > header > * {
      position: relative !important;
      z-index: 1 !important;
    }
  `;

  document.head.appendChild(style);
}

installHomeHeaderReferenceFinal();
