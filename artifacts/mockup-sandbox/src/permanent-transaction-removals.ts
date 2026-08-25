export {};

// Sadece 20 Ağustos'taki bu üç eski hareket kalıcı olarak gizli kalsın.
// Önceden localStorage'a yanlışlıkla eklenmiş başka silme anahtarlarını temizliyoruz;
// böylece 21 Ağustos ve sonrasındaki hareketler tekrar görünür.
const DELETED_KEYS_STORAGE = "demo_deleted_transaction_keys";
const PERMANENTLY_REMOVED_KEYS = [
  "ARCHIVE-20260820-1904-48000",
  "ARCHIVE-20260820-1929-990",
  "ARCHIVE-20260820-2118-10000",
];

function transactionKey(transaction: any) {
  return String(
    transaction?.transactionNumber ??
      `${transaction?.id ?? ""}|${transaction?.date ?? ""}|${transaction?.time ?? ""}|${transaction?.amount ?? ""}`,
  );
}

// Kalıcı silme listesinde yalnızca yukarıdaki üç hareket kalsın.
localStorage.setItem(DELETED_KEYS_STORAGE, JSON.stringify(PERMANENTLY_REMOVED_KEYS));

// Eski oturumdan localStorage'da kalmış bu üç hareket varsa temizle.
// Diğer hareketlere dokunma; ana state yükleyicisi onları tekrar getirir.
try {
  const parsed = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
  if (Array.isArray(parsed)) {
    const filtered = parsed.filter(
      (transaction) => !PERMANENTLY_REMOVED_KEYS.includes(transactionKey(transaction)),
    );
    localStorage.setItem("demo_transactions", JSON.stringify(filtered));
  }
} catch {}
