export {};

function numberOf(value: string) {
  const parsed = Number(
    value
      .replace(/TL|TRY/gi, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d+-.]/g, ""),
  );
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function normalizeStatementBalances(screen: HTMLElement) {
  const filter = screen.querySelector<HTMLButtonElement>('button[aria-label="Filtre"]');
  const list = filter?.parentElement?.nextElementSibling as HTMLElement | null;
  if (!list) return;

  const rows = Array.from(list.children)
    .filter((element): element is HTMLButtonElement => element instanceof HTMLButtonElement)
    .map((button) => {
      const divs = Array.from(button.children).filter(
        (element): element is HTMLDivElement => element instanceof HTMLDivElement,
      );
      const amountBox = divs.find(
        (div) => /[+-]?\s*[\d.]+,\d{2}\s*TL/i.test(div.textContent || "") &&
          !/Kalan Bakiye/i.test(div.textContent || ""),
      );
      const balanceBox = divs.find((div) => /Kalan Bakiye/i.test(div.textContent || ""));
      if (!amountBox || !balanceBox) return null;

      const amountText =
        (amountBox.textContent || "").match(/[+-]?\s*[\d.]+,\d{2}/)?.[0]?.replace(/\s/g, "") ||
        "0,00";
      const balanceSpans = Array.from(balanceBox.querySelectorAll<HTMLSpanElement>("span"));
      const balanceSpan = balanceSpans[balanceSpans.length - 1];
      if (!balanceSpan) return null;

      return {
        amount: numberOf(amountText),
        balanceSpan,
      };
    })
    .filter((row): row is { amount: number; balanceSpan: HTMLSpanElement } => !!row);

  if (!rows.length) return;

  // Domino hesap: en eski (en alttaki) satırın mevcut bakiyesini başlangıç kabul et.
  // O satırın tutarını uygula ve çıkan sonucu bir sonraki (bir üstteki) satıra taşı.
  let runningBalance = numberOf(rows[rows.length - 1].balanceSpan.textContent || "0");

  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    row.balanceSpan.textContent = `${money(runningBalance)} TL`;
    runningBalance += row.amount;
  }
}

document.addEventListener(
  "click",
  (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest<HTMLButtonElement>('button[aria-label="Mesajlar"]');
    if (!button) return;

    const screen = button.closest<HTMLElement>(".min-h-screen");
    if (!screen?.querySelector('button[aria-label="Filtre"]')) return;

    normalizeStatementBalances(screen);
  },
  true,
);
