export {};

document.addEventListener(
  "click",
  (event) => {
    const element = event.target instanceof Element ? event.target : null;
    const button = element?.closest<HTMLButtonElement>("button");
    if (!button) return;

    const receiptScreen = button.closest<HTMLElement>(".fixed.inset-0");
    if (!receiptScreen) return;

    // Only act on the open receipt/detail screen, never on the account-movements page.
    const screenText = receiptScreen.textContent || "";
    if (!screenText.includes("Fast Mesaj Kodu") || !screenText.includes("İşlem Tutarı")) return;

    const header = button.closest("header");
    if (!header) return;

    const headerButtons = Array.from(header.querySelectorAll<HTMLButtonElement>("button"));
    if (!headerButtons.length || button !== headerButtons[headerButtons.length - 1]) return;

    const workingPdfButton = receiptScreen.querySelector<HTMLButtonElement>(
      'button[aria-label="Dekontu paylaş"]',
    );
    if (!workingPdfButton) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // Reuse the already-working receipt PDF exporter so the currently open receipt
    // remains the single source of truth for all PDF fields.
    workingPdfButton.click();
  },
  true,
);
