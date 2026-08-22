const INCOMING_AMOUNT_COLOR = "#56B164";

function applyIncomingAmountColor() {
  document
    .querySelectorAll<HTMLElement>('[data-transaction-reference-amount="true"]')
    .forEach((amount) => {
      const isIncoming = amount.textContent?.trim().startsWith("+") ?? false;

      if (isIncoming) {
        amount.style.setProperty("color", INCOMING_AMOUNT_COLOR, "important");
      } else {
        amount.style.removeProperty("color");
      }
    });
}

applyIncomingAmountColor();

const observer = new MutationObserver(() => {
  window.requestAnimationFrame(applyIncomingAmountColor);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
