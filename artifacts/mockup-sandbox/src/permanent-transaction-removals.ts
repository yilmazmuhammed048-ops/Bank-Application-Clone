export {};

// Bu hareketler artık uygulamada hiçbir koşulda geri gelmemeli.
// main.tsx paylaşılan veriyi yüklemeden önce bu modül çalışır ve ana yükleyicinin
// kullandığı kalıcı silme listesine anahtarları ekler.
const DELETED_KEYS_STORAGE = "demo_deleted_transaction_keys";
const PERMANENTLY_REMOVED_KEYS = [
  "ARCHIVE-20260820-1904-48000",
  "ARCHIVE-20260820-1929-990",
  "ARCHIVE-20260820-2118-10000",
];

function readDeletedKeys() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DELETED_KEYS_STORAGE) || "[]");
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [] as string[];
  }
}

function transactionKey(transaction: any) {
  return String(
    transaction?.transactionNumber ??
      `${transaction?.id ?? ""}|${transaction?.date ?? ""}|${transaction?.time ?? ""}|${transaction?.amount ?? ""}`,
  );
}

const deletedKeys = new Set([...readDeletedKeys(), ...PERMANENTLY_REMOVED_KEYS]);
localStorage.setItem(DELETED_KEYS_STORAGE, JSON.stringify(Array.from(deletedKeys)));

// Eski oturumdan localStorage'da kalmışlarsa onları da anında temizle.
try {
  const parsed = JSON.parse(localStorage.getItem("demo_transactions") || "[]");
  if (Array.isArray(parsed)) {
    const filtered = parsed.filter(
      (transaction) => !PERMANENTLY_REMOVED_KEYS.includes(transactionKey(transaction)),
    );
    localStorage.setItem("demo_transactions", JSON.stringify(filtered));
  }
} catch {}
