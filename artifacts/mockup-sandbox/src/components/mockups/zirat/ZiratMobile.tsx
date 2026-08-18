import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Copy,
  CreditCard,
  FileText,
  Home,
  LayoutGrid,
  Mail,
  Menu,
  MessageSquare,
  MoreVertical,
  PieChart,
  QrCode,
  ReceiptText,
  Search,
  Send,
  Share2,
  ShieldCheck,
  TrendingUp,
  User,
  X,
} from "lucide-react";

type View =
  | "home"
  | "products"
  | "actions"
  | "applications"
  | "menu"
  | "transactions";

type AdminTransaction = {
  id: string | number;
  title: string;
  description: string;
  amount: string;
  date: string;
  time?: string;
  recipientName?: string;
  recipientIban?: string;
  recipientBank?: string;
  transactionNumber?: string;
  type?: "income" | "expense";
};

type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  kind: "credit" | "debit";
  date: string;
  time: string;
  recipientName: string;
  recipientIban: string;
  recipientBank: string;
  transactionNumber: string;
};

const DEFAULT_BALANCE = 125000;

const DEFAULT_TRANSACTIONS: AdminTransaction[] = [
  {
    id: 6,
    title: "FAST Gelen",
    description: "FAST PARA TRANSFERİ",
    amount: "8.750,00",
    date: "18 Ağustos 2026",
    time: "09:41",
    recipientName: "Burak Aydın",
    recipientIban: "TR71 5468 2319 7842 6531 2948 37",
    recipientBank: "Türkiye İş Bankası A.Ş.",
    transactionNumber: "20260818498317",
    type: "income",
  },
  {
    id: 5,
    title: "Kart Ödemesi",
    description: "POS HARCAMASI - MARKET",
    amount: "1.286,45",
    date: "18 Ağustos 2026",
    time: "08:12",
    recipientName: "Güneş Market",
    recipientIban: "TR36 8241 5973 2618 4735 9126 58",
    recipientBank: "Akbank T.A.Ş.",
    transactionNumber: "20260818276194",
    type: "expense",
  },
  {
    id: 4,
    title: "FAST Giden",
    description: "FAST PARA TRANSFERİ",
    amount: "2.350,00",
    date: "17 Ağustos 2026",
    time: "21:06",
    recipientName: "Ece Yalçın",
    recipientIban: "TR58 3174 9628 4513 7862 5941 26",
    recipientBank: "Garanti BBVA",
    transactionNumber: "20260817421683",
    type: "expense",
  },
  {
    id: 3,
    title: "Havale Gelen",
    description: "HAVALE",
    amount: "12.500,00",
    date: "17 Ağustos 2026",
    time: "14:32",
    recipientName: "Mert Karaca",
    recipientIban: "TR24 6931 4857 3126 8495 7312 64",
    recipientBank: "Yapı ve Kredi Bankası A.Ş.",
    transactionNumber: "20260817384621",
    type: "income",
  },
  {
    id: 2,
    title: "Akaryakıt",
    description: "KARTLI ÖDEME",
    amount: "1.950,00",
    date: "16 Ağustos 2026",
    time: "18:46",
    recipientName: "Petrol İstasyonu",
    recipientIban: "TR83 1547 9263 4812 7359 2648 17",
    recipientBank: "QNB",
    transactionNumber: "20260816291847",
    type: "expense",
  },
  {
    id: 1,
    title: "Maaş",
    description: "MAAŞ ÖDEMESİ",
    amount: "35.000,00",
    date: "15 Ağustos 2026",
    time: "09:17",
    recipientName: "Atlas Teknoloji A.Ş.",
    recipientIban: "TR47 9286 3157 8421 6935 2748 61",
    recipientBank: "Türkiye Finans Katılım Bankası A.Ş.",
    transactionNumber: "20260815173594",
    type: "income",
  },
];

const MY_NAME = "Muhammed Yılmaz";
const MY_PHONE = "05XX XXX XX XX";
const MY_IBAN = "TR63 4827 1954 7362 8519 6243 17";
const MY_ACCOUNT = "68421735";

function parseAmount(value: string | number) {
  if (typeof value === "number") return value;

  const cleaned = String(value)
    .replace(/TL/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value: number) {
  return `${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function demoTime(id: string | number) {
  const digits = String(id).replace(/\D/g, "");
  const seed = digits
    .split("")
    .reduce((sum, value) => sum + Number(value || 0), 0);

  const hours = 8 + (seed % 13);
  const minutes = (seed * 17) % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getAdminBalance() {
  const savedAccount = localStorage.getItem("demo_account");

  if (savedAccount) {
    try {
      const account = JSON.parse(savedAccount);
      const parsed = parseAmount(account.balance);
      if (Number.isFinite(parsed)) return parsed;
    } catch {}
  }

  const saved = localStorage.getItem("demo_balance");
  if (saved === null) return DEFAULT_BALANCE;

  const parsed = Number(saved);
  return Number.isFinite(parsed) ? parsed : DEFAULT_BALANCE;
}

function getAdminTransactions(): AdminTransaction[] {
  const saved = localStorage.getItem("demo_transactions");
  if (!saved) return DEFAULT_TRANSACTIONS;

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return DEFAULT_TRANSACTIONS;
    return parsed;
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

function convertTransactions(items: AdminTransaction[]): Transaction[] {
  return items
    .map((item) => {
      const amount = Math.abs(parseAmount(item.amount));
      const isCredit =
        item.type === "income" ||
        String(item.amount).trim().startsWith("+");

      return {
        id: String(item.id),
        title: item.title || "İşlem",
        subtitle: item.description || "İşlem açıklaması",
        amount,
        kind: isCredit ? "credit" : "debit",
        date: item.date || "18 Ağustos 2026",
        time: item.time || demoTime(item.id),
        recipientName: item.recipientName || item.title || "Belirtilmemiş",
        recipientIban:
          item.recipientIban || "TR57 2948 6317 4852 7193 8641 25",
        recipientBank: item.recipientBank || "Banka Bilgisi",
        transactionNumber: item.transactionNumber || String(item.id),
      };
    })
    .sort((a, b) => Number(b.id) - Number(a.id));
}

function readAccountData() {
  return {
    balance: getAdminBalance(),
    transactions: convertTransactions(getAdminTransactions()),
  };
}

export default function ZiratMobile() {
  const [view, setView] = useState<View>("home");
  const [balance, setBalance] = useState(() => readAccountData().balance);
  const [transactions, setTransactions] = useState<Transaction[]>(
    () => readAccountData().transactions,
  );
  const [tab, setTab] = useState<"accounts" | "cards">("accounts");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [recipient, setRecipient] = useState("Ayşe Demir");
  const [recipientIban, setRecipientIban] = useState(
    "TR84 6193 2748 5316 9427 3581 62",
  );
  const [transferAmount, setTransferAmount] = useState("850,00");
  const [showTips, setShowTips] = useState(false);

  const refreshFromAdmin = () => {
    const data = readAccountData();
    setBalance(data.balance);
    setTransactions(data.transactions);
  };

  useEffect(() => {
    const handleStorage = () => refreshFromAdmin();
    window.addEventListener("storage", handleStorage);
    const timer = window.setInterval(refreshFromAdmin, 1000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(timer);
    };
  }, []);

  const sendTransfer = () => {
    const amount = parseAmount(transferAmount);
    if (!amount || amount <= 0) {
      alert("Geçerli bir tutar girin.");
      return;
    }

    const now = Date.now();
    const newTransaction: Transaction = {
      id: String(now),
      title: "FAST Giden",
      subtitle: "FAST PARA TRANSFERİ",
      amount,
      kind: "debit",
      date: "18 Ağustos 2026",
      time: new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      recipientName: recipient,
      recipientIban,
      recipientBank: "Alıcı Banka",
      transactionNumber: String(now),
    };

    setBalance((current) => Math.max(0, current - amount));
    setTransactions((current) => [newTransaction, ...current]);
    setShowTransfer(false);
  };

  return (
    <main className="min-h-screen bg-[#f2f0f1] text-[#242326]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fafafa] shadow-xl">
        <header className="bg-[#e30620] px-5 pb-6 pt-5 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#777]"
            >
              <User size={21} />
            </button>

            <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4">
              <Search size={17} />
              <span className="text-sm">Ziraat Mobil&apos;de Ara</span>
            </div>

            <button className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
              <MessageSquare size={20} />
            </button>
          </div>

          <p className="mt-4 text-sm">
            İyi Günler <strong>{MY_NAME}</strong>
          </p>
        </header>

        {view === "home" && (
          <div className="pb-24">
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex w-full items-center justify-between bg-white px-5 py-4 text-left font-semibold"
            >
              İpuçlarına hemen göz at!
              <ChevronDown
                size={19}
                className={`text-[#e30620] ${showTips ? "rotate-180" : ""}`}
              />
            </button>

            {showTips && (
              <div className="bg-white px-5 pb-4 text-sm text-[#777]">
                Hesap hareketlerinizi ve bakiyenizi görüntüleyebilirsiniz.
              </div>
            )}

            <div className="px-5">
              <div className="mt-5 flex items-end gap-7 border-b border-[#ddd]">
                <button
                  onClick={() => setTab("accounts")}
                  className={`relative pb-3 text-lg font-semibold ${
                    tab === "accounts"
                      ? "text-[#242326] after:absolute after:bottom-[-1px] after:left-0 after:h-[3px] after:w-full after:bg-[#e30620]"
                      : "text-[#888]"
                  }`}
                >
                  Hesaplarım
                </button>

                <button
                  onClick={() => setTab("cards")}
                  className={`relative pb-3 text-lg font-semibold ${
                    tab === "cards"
                      ? "text-[#242326] after:absolute after:bottom-[-1px] after:left-0 after:h-[3px] after:w-full after:bg-[#e30620]"
                      : "text-[#888]"
                  }`}
                >
                  Kredi Kartlarım
                </button>

                <button className="ml-auto mb-2 grid h-9 w-9 place-items-center rounded-xl bg-[#efeeee]">
                  <MoreVertical size={18} />
                </button>
              </div>

              {tab === "accounts" && (
                <section className="pt-5">
                  <h2 className="text-lg font-bold text-[#c9162d]">
                    ZİRAAT SÜPER ŞUBE
                  </h2>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="rounded-lg bg-[#b7a66d] px-3 py-1.5 text-xs font-bold text-white">
                      Vadesiz TL
                    </span>
                    <span className="text-sm text-[#555]">{MY_ACCOUNT}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="truncate text-xs text-[#777]">{MY_IBAN}</span>
                    <button className="text-[#d3132b]">
                      <Share2 size={18} />
                    </button>
                  </div>

                  <p className="mt-5 text-xs text-[#777]">Bakiye</p>
                  <p className="mt-1 text-3xl font-bold">{formatMoney(balance)}</p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setView("products")}
                      className="rounded-full bg-[#e30620] py-3.5 text-sm font-bold text-white"
                    >
                      Tüm Hesaplarım
                    </button>

                    <button
                      onClick={() => setView("transactions")}
                      className="rounded-full bg-[#e30620] py-3.5 text-sm font-bold text-white"
                    >
                      Hesap Hareketleri
                    </button>
                  </div>
                </section>
              )}

              {tab === "cards" && (
                <section className="mt-5 rounded-2xl bg-[#f1eded] p-5">
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-[#d3132b]" />
                    <div>
                      <p className="font-bold">Bankkart</p>
                      <p className="text-sm text-[#777]">•••• 2468</p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm text-[#777]">Kullanılabilir limit</p>
                  <p className="text-2xl font-bold">50.000,00 TL</p>
                </section>
              )}
            </div>

            <section className="mt-6 bg-[#f5f3f3] px-5 py-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Kısayollarım</h2>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Shortcut icon={<PieChart size={23} />} label={"Varlıklarım"} onClick={() => setView("products")} />
                <Shortcut icon={<ClipboardList size={23} />} label={"Son\nİşlemler"} onClick={() => setView("transactions")} />
                <Shortcut icon={<QrCode size={23} />} label={"QR ile\nPara Çekme"} onClick={() => {}} />
                <Shortcut icon={<Banknote size={23} />} label={"Para\nTransferi"} onClick={() => setShowTransfer(true)} />
              </div>
            </section>
          </div>
        )}

        {view === "transactions" && (
          <Transactions
            transactions={transactions}
            balance={balance}
            onBack={() => setView("home")}
            onSelect={setSelectedTransaction}
          />
        )}

        {view !== "home" && view !== "transactions" && (
          <OtherView
            view={view}
            onBack={() => setView("home")}
            onTransfer={() => setShowTransfer(true)}
          />
        )}

        <BottomNav view={view} onChange={setView} />

        {showTransfer && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowTransfer(false)}>
            <div className="w-full max-w-[430px] rounded-t-3xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">Para Transferi</h2>
                <button onClick={() => setShowTransfer(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f2eeee]">
                  <X size={18} />
                </button>
              </div>

              <label className="text-sm font-semibold">
                Alıcı Adı
                <input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-2 w-full rounded-xl border border-[#ddd] p-3 outline-none" />
              </label>

              <label className="mt-4 block text-sm font-semibold">
                Alıcı IBAN
                <input value={recipientIban} onChange={(e) => setRecipientIban(e.target.value)} className="mt-2 w-full rounded-xl border border-[#ddd] p-3 font-mono text-sm outline-none" />
              </label>

              <label className="mt-4 block text-sm font-semibold">
                Tutar
                <div className="mt-2 flex rounded-xl border border-[#ddd] p-3">
                  <input value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="flex-1 outline-none" />
                  <span>TL</span>
                </div>
              </label>

              <button onClick={sendTransfer} className="mt-5 w-full rounded-full bg-[#e30620] py-4 font-bold text-white">
                Transferi Onayla
              </button>
            </div>
          </div>
        )}

        {selectedTransaction && (
          <Receipt transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
        )}

        {menuOpen && (
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMenuOpen(false)}>
            <div className="absolute left-0 top-0 h-full w-[320px] bg-white p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Profil</h2>
                <button onClick={() => setMenuOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f2eeee]">
                  <X size={18} />
                </button>
              </div>

              <div className="mt-8 rounded-2xl bg-[#f5f3f3] p-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-[#e30620] text-white">
                  <User />
                </div>
                <p className="mt-4 font-bold">{MY_NAME}</p>
                <p className="mt-1 text-sm text-[#777]">{MY_PHONE}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Transactions({
  transactions,
  balance,
  onBack,
  onSelect,
}: {
  transactions: Transaction[];
  balance: number;
  onBack: () => void;
  onSelect: (transaction: Transaction) => void;
}) {
  const rows = useMemo(() => {
    let runningBalance = balance;

    return transactions.map((tx) => {
      const balanceAfter = runningBalance;
      runningBalance = tx.kind === "credit" ? runningBalance - tx.amount : runningBalance + tx.amount;
      return { ...tx, balanceAfter };
    });
  }, [transactions, balance]);

  return (
    <div className="min-h-screen bg-[#f3f3f3] pb-24">
      <header className="bg-[#e30620] px-3 pb-3 pt-4 text-white">
        <div className="flex items-center">
          <button onClick={onBack} className="grid h-10 w-10 place-items-center">
            <ArrowLeft size={24} />
          </button>

          <h1 className="flex-1 text-center text-[18px] font-semibold">Hesap Hareketleri</h1>

          <button className="grid h-10 w-10 place-items-center">
            <MessageSquare size={20} />
          </button>

          <button onClick={onBack} className="grid h-10 w-10 place-items-center">
            <Home size={21} />
          </button>
        </div>
      </header>

      <div className="flex gap-2 bg-white px-3 py-3 shadow-sm">
        <button className="flex h-11 flex-1 items-center justify-between rounded-lg border border-[#d9d9d9] bg-white px-4 text-[13px] font-medium text-[#333]">
          Son 1 ay
          <ChevronDown size={17} className="text-[#777]" />
        </button>

        <button className="grid h-11 w-11 place-items-center rounded-lg border border-[#d9d9d9] bg-white">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="space-y-2 px-2.5 py-2.5">
        {rows.map((tx) => {
          const dateParts = tx.date.split(" ");

          return (
            <button key={tx.id} onClick={() => onSelect(tx)} className="w-full overflow-hidden rounded-[14px] bg-white text-left shadow-[0_1px_5px_rgba(0,0,0,0.11)]">
              <div className="flex min-h-[124px]">
                <div className="flex w-[76px] shrink-0 flex-col items-center justify-center border-r border-[#ececec] px-1">
                  <span className="text-[28px] font-semibold leading-none text-[#2b2b2b]">{dateParts[0]}</span>
                  <span className="mt-1 text-center text-[11px] leading-tight text-[#777]">{dateParts.slice(1).join(" ")}</span>
                  <span className="mt-1 text-[11px] font-medium text-[#555]">{tx.time}</span>
                </div>

                <div className="min-w-0 flex-1 px-3 py-3">
                  <p className="truncate text-[13px] font-semibold text-[#252525]">
                    {tx.kind === "credit" ? "Gönd: " : ""}{tx.recipientName}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-[1.35] text-[#666]">
                    {tx.subtitle} · {tx.recipientBank}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-[#8a8a8a]">{tx.recipientIban}</p>
                  <p className="mt-1 text-[10px] text-[#999]">İşlem No: {tx.transactionNumber}</p>
                </div>

                <div className="flex w-[118px] shrink-0 flex-col items-end px-3 py-3">
                  <span className={`text-[14px] font-bold ${tx.kind === "credit" ? "text-[#16803c]" : "text-[#222]"}`}>
                    {tx.kind === "credit" ? "+" : "-"}{formatMoney(tx.amount)}
                  </span>

                  <div className="mt-auto flex items-center gap-1 text-[#e30620]">
                    <ReceiptText size={18} />
                    <span className="text-[10px] font-semibold">Dekont</span>
                  </div>

                  <div className="mt-2 text-right">
                    <p className="text-[9px] text-[#999]">Kalan Bakiye</p>
                    <p className="text-[11px] font-semibold text-[#4a4a4a]">{formatMoney(tx.balanceAfter)}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Receipt({ transaction, onClose }: { transaction: Transaction; onClose: () => void; }) {
  const [copied, setCopied] = useState(false);
  const [masked, setMasked] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(transaction.recipientIban).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const displayedIban = masked
    ? `${transaction.recipientIban.slice(0, 7)} **** **** **** **** ${transaction.recipientIban.slice(-5)}`
    : transaction.recipientIban;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#ececec]">
      <header className="sticky top-0 z-10 bg-[#e30620] px-3 py-4 text-white">
        <div className="mx-auto flex w-full max-w-[430px] items-center">
          <button onClick={onClose} className="grid h-10 w-10 place-items-center"><ArrowLeft size={24} /></button>
          <h1 className="flex-1 text-center text-[18px] font-semibold">Dekont</h1>
          <button className="grid h-10 w-10 place-items-center"><Share2 size={20} /></button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[430px] px-3 py-3">
        <div className="relative overflow-hidden rounded-[4px] bg-white shadow-sm">
          <div className="absolute right-3 top-3 rounded border border-[#d9d9d9] px-2 py-1 text-[9px] font-semibold tracking-[0.18em] text-[#777]">ÖRNEK</div>

          <div className="border-b border-[#e6e6e6] px-5 pb-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#e30620] text-white"><span className="text-xl font-black">Z</span></div>
              <div>
                <p className="text-[16px] font-bold text-[#333]">İşlem Dekontu</p>
                <p className="text-[11px] text-[#888]">{transaction.date} · {transaction.time}</p>
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            <ReceiptLine label="İşlem Türü" value={transaction.title} />
            <ReceiptLine label="Gönderen / Alıcı" value={transaction.recipientName} />
            <ReceiptLine label="Banka" value={transaction.recipientBank} />

            <div className="border-b border-[#ececec] py-3">
              <p className="text-[10px] text-[#999]">IBAN</p>
              <div className="mt-1 flex items-start gap-2">
                <p className="flex-1 break-all text-[12px] font-semibold leading-relaxed text-[#333]">{displayedIban}</p>
                <button onClick={copy} className="mt-0.5 shrink-0 text-[#e30620]">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
              </div>
            </div>

            <ReceiptLine label="İşlem Tutarı" value={`${transaction.kind === "credit" ? "+" : "-"}${formatMoney(transaction.amount)}`} strong green={transaction.kind === "credit"} />
            <ReceiptLine label="İşlem Tarihi" value={`${transaction.date} ${transaction.time}`} />
            <ReceiptLine label="İşlem Numarası" value={transaction.transactionNumber} />
            <ReceiptLine label="Açıklama" value={transaction.subtitle} />
            <ReceiptLine label="Masraf / BSMV" value="0,00 TL" />
          </div>
        </div>

        <button onClick={() => setMasked((value) => !value)} className="mt-3 flex w-full items-center justify-between rounded-[4px] bg-white px-4 py-4 text-left shadow-sm">
          <span className="text-[12px] font-medium text-[#333]">Adres ve Kimlik Bilgilerimi Maskele</span>
          <span className={`relative h-6 w-11 rounded-full ${masked ? "bg-[#e30620]" : "bg-[#d1d1d1]"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${masked ? "left-[22px]" : "left-0.5"}`} />
          </span>
        </button>

        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-[4px] bg-[#e30620] py-4 text-[13px] font-bold text-white">
          <Mail size={18} /> E-POSTA GÖNDER
        </button>

        <button onClick={onClose} className="mt-3 w-full rounded-[4px] border border-[#cfcfcf] bg-white py-4 text-[13px] font-bold text-[#333]">GERİ</button>

        <p className="pb-6 pt-3 text-center text-[9px] text-[#999]">ÖRNEK belge — gerçek banka dekontu değildir.</p>
      </div>
    </div>
  );
}

function ReceiptLine({ label, value, strong = false, green = false }: { label: string; value: string; strong?: boolean; green?: boolean; }) {
  return (
    <div className="border-b border-[#ececec] py-3">
      <p className="text-[10px] text-[#999]">{label}</p>
      <p className={`mt-1 text-[12px] ${strong ? "font-bold" : "font-semibold"} ${green ? "text-[#16803c]" : "text-[#333]"}`}>{value}</p>
    </div>
  );
}

function Shortcut({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void; }) {
  return (
    <button onClick={onClick} className="flex h-[105px] flex-col items-center justify-center gap-2 rounded-xl bg-white text-center text-xs font-semibold shadow-sm">
      <span className="text-[#e30620]">{icon}</span>
      <span className="whitespace-pre-line">{label}</span>
    </button>
  );
}

function OtherView({ view, onBack, onTransfer }: { view: View; onBack: () => void; onTransfer: () => void; }) {
  const titles: Record<string, string> = { products: "Ürünler", actions: "İşlemler", applications: "Başvurular", menu: "Tüm Menü" };
  const items = view === "actions"
    ? [["Para Transferi", Send], ["QR ile Para Çekme", QrCode], ["Fatura Ödeme", ReceiptText]]
    : view === "products"
      ? [["Yeni Hesap Aç", Banknote], ["Kartlarım", CreditCard], ["Birikim Hedefi", TrendingUp]]
      : [["Kredi Başvurusu", FileText], ["Limit Artırımı", ChevronRight], ["Güvenlik Merkezi", ShieldCheck]];

  return (
    <div className="min-h-screen bg-[#f8f7f7] px-5 pb-28 pt-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="grid h-10 w-10 place-items-center rounded-xl bg-white"><ArrowLeft size={19} /></button>
        <h1 className="text-2xl font-bold">{titles[view]}</h1>
      </div>

      <div className="mt-5 space-y-3">
        {items.map(([label, Icon]) => (
          <button key={String(label)} onClick={label === "Para Transferi" ? onTransfer : undefined} className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff0f1] text-[#d3132b]"><Icon size={21} /></span>
            <span className="flex-1 font-semibold">{String(label)}</span>
            <ChevronRight size={18} className="text-[#aaa]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function BottomNav({ view, onChange }: { view: View; onChange: (view: View) => void; }) {
  const items: { label: string; view: View; icon: React.ElementType; }[] = [
    { label: "Ana Sayfa", view: "home", icon: Home },
    { label: "Ürünler", view: "products", icon: LayoutGrid },
    { label: "İşlemler", view: "actions", icon: Send },
    { label: "Başvurular", view: "applications", icon: FileText },
    { label: "Tüm Menü", view: "menu", icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 flex h-[76px] w-full max-w-[430px] -translate-x-1/2 items-start justify-around border-t border-[#eee] bg-white px-1 pt-3 shadow-[0_-3px_14px_rgba(60,35,37,.05)]">
      {items.map(({ label, view: target, icon: Icon }) => (
        <button key={label} onClick={() => onChange(target)} className={`flex w-1/5 flex-col items-center gap-1 text-[11px] font-semibold ${view === target ? "text-[#df0b25]" : "text-[#777]"}`}>
          <Icon size={20} />
          <span>{label}</span>
          {view === target && <span className="h-1.5 w-1.5 rounded-full bg-[#df0b25]" />}
        </button>
      ))}
    </nav>
  );
}
