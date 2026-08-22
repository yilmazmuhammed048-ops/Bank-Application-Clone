export {};

document.addEventListener(
  "click",
  (event) => {
    const element = event.target instanceof Element ? event.target : null;
    const button = element?.closest<HTMLButtonElement>("button");
    if (!button) return;

    const receiptScreen = button.closest<HTMLElement>(".fixed.inset-0");
    if (!receiptScreen) return;

    // Restrict this bridge to the open receipt/detail screen only.
    const text = receiptScreen.textContent || "";
    if (!text.includes("Fast Mesaj Kodu") || !text.includes("İşlem Tutarı")) return;

    const header = button.closest("header");
    if (!header) return;

    const headerButtons = Array.from(header.querySelectorAll<HTMLButtonElement>("button"));
    const isReceiptHeaderAction =
      headerButtons.length > 0 && button === headerButtons[headerButtons.length - 1];
    if (!isReceiptHeaderAction) return;

    const pdfButton = receiptScreen.querySelector<HTMLButtonElement>(
      'button[aria-label="Dekontu paylaş"]',
    );
    if (!pdfButton) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // Use the existing working exporter, which reads the currently open receipt.
    pdfButton.click();
  },
  true,
);
