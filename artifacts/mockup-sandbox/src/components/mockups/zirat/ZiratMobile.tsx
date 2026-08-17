import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
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
  Sparkles,
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
  recipientName: string;
  recipientIban: string;
  transactionNumber: string;
  type?: "Gelen ödeme" | "Giden ödeme";
};

type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  kind: "credit" | "debit";
  date: string;
  recipientName: string;
  recipientIban: string;
  transactionNumber: string;
};

const DEFAULT_BALANCE = 125000;

const DEFAULT_TRANSACTIONS: AdminTransaction[] = [
  {
    id: 2,
    title: "Market",
    description: "Kart ile ödeme",
    amount: "450,00",
    date: "17 Ağustos 2026",
    type: "Giden ödeme",
  },
  {
    id: 1,
    title: "Maaş",
    description: "Hesaba gelen ödeme",
    amount: "35.000,00",
    date: "15 Ağustos 2026",
    type: "Gelen ödeme",
  },
];

const MY_NAME = "Muhammed Yılmaz";
const MY_PHONE = "05XX XXX XX XX";
const MY_IBAN = "TR00 0000 0000 0000 0000 0000 00";
const MY_ACCOUNT = "00000000";

function parseAmount(value: string | number) {
  if (typeof value === "number") return value;

  const cleaned = String(value)
    .replace(/TL/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  return Number(cleaned) || 0;
}

function formatMoney(value: number) {
  return `${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function getAdminBalance() {
  const savedAccount = localStorage.getItem("demo_account");

  if (savedAccount) {
    try {
      const account = JSON.parse(savedAccount);
      const parsedAccountBalance = parseAmount(account.balance);

      if (Number.isFinite(parsedAccountBalance)) {
        return parsedAccountBalance;
      }
    } catch {}
  }

  const saved = localStorage.getItem("demo_balance");

  if (saved === null) {
    return DEFAULT_BALANCE;
  }

  const parsed = Number(saved);

  return Number.isFinite(parsed) ? parsed : DEFAULT_BALANCE;
}

function getAdminTransactions(): AdminTransaction[] {
  const saved = localStorage.getItem("demo_transactions");

  if (!saved) {
    return DEFAULT_TRANSACTIONS;
  }

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return DEFAULT_TRANSACTIONS;
    }

    return parsed;
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

function convertTransactions(
  items: AdminTransaction[],
): Transaction[] {
  return items.map((item) => {
    const amount = parseAmount(item.amount);

    const isCredit =
      item.type === "income" ||
      String(item.amount).includes("+");

    return {
      id: String(item.id),
      title: item.title,
      subtitle: item.description,
      amount: `${isCredit ? "+" : "-"}${formatMoney(
        Math.abs(amount),
      )}`,
      kind: isCredit ? "credit" : "debit",
      date: item.date,
      recipientName: item.recipientName,
      recipientIban: item.recipientIban,
      transactionNumber: item.transactionNumber,
    };
  });
}

function readAccountData() {
  return {
    balance: getAdminBalance(),
    transactions: convertTransactions(
      getAdminTransactions(),
    ),
  };
}

export default function ZiratMobile() {
  const [view, setView] = useState<View>("home");

  const [balance, setBalance] = useState(
    () => readAccountData().balance,
  );

  const [transactions, setTransactions] = useState<Transaction[]>(
    () => readAccountData().transactions,
  );

  const [tab, setTab] = useState<"accounts" | "cards">("accounts");

  const [menuOpen, setMenuOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [showTransfer, setShowTransfer] = useState(false);

  const [recipient, setRecipient] =
    useState("Ayşe Demir");

  const [recipientIban, setRecipientIban] = useState(
    "TR00 0000 0000 0000 0000 0000 0000",
  );

  const [transferAmount, setTransferAmount] =
    useState("850,00");

  const [showTips, setShowTips] = useState(false);

  const [showAgenda, setShowAgenda] = useState(false);

  const [showInstructions, setShowInstructions] =
    useState(false);

  const refreshFromAdmin = () => {
    const data = readAccountData();

    setBalance(data.balance);
    setTransactions(data.transactions);
  };

  useEffect(() => {
    const handleStorage = () => {
      refreshFromAdmin();
    };

    window.addEventListener("storage", handleStorage);

    const timer = window.setInterval(() => {
      refreshFromAdmin();
    }, 1000);

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

    const newTransaction: Transaction = {
      id: String(Date.now()),
      title: `${recipient}'e Transfer`,
      subtitle: recipientIban,
      amount: `-${formatMoney(amount)}`,
      kind: "debit",
      date: "Bugün",
    };

    setBalance((current) => Math.max(0, current - amount));

    setTransactions((current) => [
      newTransaction,
      ...current,
    ]);

    setShowTransfer(false);
  };

  return (
    <main className="min-h-screen bg-[#f2f0f1] text-[#242326]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fafafa] shadow-xl">

        {/* HEADER */}
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
              <span className="text-sm">
                Ziraat Mobil&apos;de Ara
              </span>
            </div>

            <button className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
              <MessageSquare size={20} />
            </button>
          </div>

          <p className="mt-4 text-sm">
            İyi Günler{" "}
            <strong>{MY_NAME}</strong>
          </p>
        </header>

        {/* DEMO BİLGİSİ */}
        <div className="border-b border-[#eee] bg-[#fff8e1] px-5 py-2.5 text-center text-xs text-[#8a6a00]">
          Bu ekran yalnızca demo amaçlıdır.
        </div>

        {/* HOME */}
        {view === "home" && (
          <div className="pb-24">

            {/* TIPS */}
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex w-full items-center justify-between bg-white px-5 py-4 text-left font-semibold"
            >
              İpuçlarına hemen göz at!
              <ChevronDown
                size={19}
                className={`text-[#e30620] ${
                  showTips ? "rotate-180" : ""
                }`}
              />
            </button>

            {showTips && (
              <div className="bg-white px-5 pb-4 text-sm text-[#777]">
                Hesap hareketlerinizi ve bakiyenizi bu demo
                ekranından görüntüleyebilirsiniz.
              </div>
            )}

            <div className="px-5">

              {/* TABS */}
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

                <button
                  className="ml-auto mb-2 grid h-9 w-9 place-items-center rounded-xl bg-[#efeeee]"
                >
                  <MoreVertical size={18} />
                </button>
              </div>

              {/* ACCOUNT */}
              {tab === "accounts" && (
                <section className="pt-5">

                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#c9162d]">
                      ZİRAAT SÜPER ŞUBE
                    </h2>

                    <button className="grid h-9 w-9 place-items-center rounded-xl bg-[#efeeee]">
                      <RefreshIcon />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="rounded-lg bg-[#b7a66d] px-3 py-1.5 text-xs font-bold text-white">
                      Vadesiz TL
                    </span>

                    <span className="text-sm text-[#555]">
                      {MY_ACCOUNT}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-[#777]">
                      {MY_IBAN}
                    </span>

                    <button className="text-[#d3132b]">
                      <Share2 size={18} />
                    </button>
                  </div>

                  <p className="mt-5 text-xs text-[#777]">
                    Bakiye
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {formatMoney(balance)}
                  </p>

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

              {/* CARD */}
              {tab === "cards" && (
                <section className="mt-5 rounded-2xl bg-[#f1eded] p-5">

                  <div className="flex items-center gap-3">
                    <CreditCard className="text-[#d3132b]" />

                    <div>
                      <p className="font-bold">
                        Demo Bankkart
                      </p>

                      <p className="text-sm text-[#777]">
                        •••• 2468
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm text-[#777]">
                    Kullanılabilir limit
                  </p>

                  <p className="text-2xl font-bold">
                    50.000,00 TL
                  </p>

                </section>
              )}
            </div>

            {/* SHORTCUTS */}
            <section className="mt-6 bg-[#f5f3f3] px-5 py-5">

              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  Kısayollarım
                </h2>

                <button
                  onClick={() => setView("actions")}
                  className="flex items-center gap-1 text-sm"
                >
                  Tümünü Gör
                  <ArrowRight
                    size={16}
                    className="text-[#e30620]"
                  />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">

                <Shortcut
                  icon={<PieChart size={23} />}
                  label="Varlıklarım"
                  onClick={() => setView("products")}
                />

                <Shortcut
                  icon={<ClipboardList size={23} />}
                  label={"Son\nİşlemler"}
                  onClick={() => setView("transactions")}
                />

                <Shortcut
                  icon={<QrCode size={23} />}
                  label={"QR ile\nPara Çekme"}
                  onClick={() => {}}
                />

                <Shortcut
                  icon={<Banknote size={23} />}
                  label={"Para\nTransferi"}
                  onClick={() => setShowTransfer(true)}
                />

              </div>
            </section>

            {/* INSTRUCTIONS */}
            <button
              onClick={() =>
                setShowInstructions(!showInstructions)
              }
              className="flex w-full items-center justify-between border-b border-[#eee] bg-white px-5 py-4 text-left font-bold"
            >
              Yaklaşan Talimatlarım
              <ChevronDown
                size={19}
                className={`text-[#e30620] ${
                  showInstructions ? "rotate-180" : ""
                }`}
              />
            </button>

            {showInstructions && (
              <div className="bg-white px-5 pb-4">
                <div className="rounded-xl border border-[#eee] p-4">
                  <p className="font-semibold">
                    Kira ödemesi
                  </p>

                  <p className="mt-1 text-xs text-[#888]">
                    Yaklaşan ödeme bulunuyor.
                  </p>
                </div>
              </div>
            )}

            {/* AGENDA */}
            <button
              onClick={() => setShowAgenda(!showAgenda)}
              className="flex w-full items-center justify-between border-b border-[#eee] bg-white px-5 py-4 text-left font-bold"
            >
              Finansal Ajanda

              <ChevronDown
                size={19}
                className={`text-[#e30620] ${
                  showAgenda ? "rotate-180" : ""
                }`}
              />
            </button>

            {showAgenda && (
              <div className="bg-white px-5 pb-4 text-sm text-[#777]">
                Yaklaşan finansal etkinlik bulunmamaktadır.
              </div>
            )}

            {/* INFO */}
            <section className="bg-[#f4f2f2] px-5 py-5">

              <div className="flex items-center gap-2">
                <Sparkles
                  size={21}
                  className="text-[#e30620]"
                />

                <h2 className="font-bold">
                  Demo Bankacılık
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">

                <InfoCard
                  icon={<TrendingUp size={20} />}
                  title="Varlıklarım"
                />

                <InfoCard
                  icon={<CreditCard size={20} />}
                  title="Kartlarım"
                />

                <InfoCard
                  icon={<ShieldCheck size={20} />}
                  title="Güvenlik"
                />

                <InfoCard
                  icon={<FileText size={20} />}
                  title="Belgeler"
                />

              </div>
            </section>

            {/* LAST LOGIN */}
            <section className="border-t border-[#eee] bg-white px-5 py-5">

              <p className="text-xs text-[#999]">
                Son Giriş
              </p>

              <p className="mt-1 text-sm font-bold">
                17 Ağustos 2026 / 01:30
              </p>

            </section>
          </div>
        )}

        {/* TRANSACTIONS */}
        {view === "transactions" && (
          <Transactions
            transactions={transactions}
            onBack={() => setView("home")}
            onSelect={setSelectedTransaction}
          />
        )}

        {/* OTHER VIEWS */}
        {view !== "home" &&
          view !== "transactions" && (
            <OtherView
              view={view}
              onBack={() => setView("home")}
              onTransfer={() => setShowTransfer(true)}
            />
          )}

        {/* BOTTOM NAV */}
        <BottomNav
          view={view}
          onChange={setView}
        />

        {/* TRANSFER */}
        {showTransfer && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            onClick={() => setShowTransfer(false)}
          >
            <div
              className="w-full max-w-[430px] rounded-t-3xl bg-white p-5 pb-8"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  Para Transferi
                </h2>

                <button
                  onClick={() => setShowTransfer(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#f2eeee]"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="text-sm font-semibold">
                Alıcı Adı

                <input
                  value={recipient}
                  onChange={(e) =>
                    setRecipient(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#ddd] p-3 outline-none"
                />
              </label>

              <label className="mt-4 block text-sm font-semibold">
                Alıcı IBAN

                <input
                  value={recipientIban}
                  onChange={(e) =>
                    setRecipientIban(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#ddd] p-3 font-mono text-sm outline-none"
                />
              </label>

              <label className="mt-4 block text-sm font-semibold">
                Tutar

                <div className="mt-2 flex rounded-xl border border-[#ddd] p-3">
                  <input
                    value={transferAmount}
                    onChange={(e) =>
                      setTransferAmount(e.target.value)
                    }
                    className="flex-1 outline-none"
                  />

                  <span>TL</span>
                </div>
              </label>

              <button
                onClick={sendTransfer}
                className="mt-5 w-full rounded-full bg-[#e30620] py-4 font-bold text-white"
              >
                Transferi Onayla
              </button>

            </div>
          </div>
        )}

        {/* RECEIPT */}
        {selectedTransaction && (
          <Receipt
            transaction={selectedTransaction}
            onClose={() =>
              setSelectedTransaction(null)
            }
          />
        )}

        {/* MENU */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-[320px] bg-white p-5"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  Profil
                </h2>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#f2eeee]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-8 rounded-2xl bg-[#f5f3f3] p-4">

                <div className="grid h-14 w-14 place-items-center rounded-full bg-[#e30620] text-white">
                  <User />
                </div>

                <p className="mt-4 font-bold">
                  {MY_NAME}
                </p>

                <p className="mt-1 text-sm text-[#777]">
                  {MY_PHONE}
                </p>

              </div>

              <div className="mt-5 space-y-2">
                <MenuRow
                  icon={<User size={19} />}
                  text="Profil Bilgileri"
                />

                <MenuRow
                  icon={<ShieldCheck size={19} />}
                  text="Güvenlik"
                />

                <MenuRow
                  icon={<FileText size={19} />}
                  text="Belgelerim"
                />
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------- */
/* COMPONENTS */
/* -------------------------------------------------- */

function Shortcut({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-[105px] flex-col items-center justify-center gap-2 rounded-xl bg-white text-center text-xs font-semibold shadow-sm"
    >
      <span className="text-[#e30620]">
        {icon}
      </span>

      <span className="whitespace-pre-line">
        {label}
      </span>
    </button>
  );
}

function InfoCard({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button className="flex items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm">
      <span className="text-[#e30620]">
        {icon}
      </span>

      <span className="text-sm font-semibold">
        {title}
      </span>
    </button>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
      <path d="M3.5 10.5A9 9 0 0 1 20 7.5" />
      <path d="M20.5 13.5A9 9 0 0 1 4 16.5" />
    </svg>
  );
}

function Transactions({
  transactions,
  onBack,
  onSelect,
}: {
  transactions: Transaction[];
  onBack: () => void;
  onSelect: (transaction: Transaction) => void;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] pb-24">

      <header className="bg-[#e30620] px-4 py-5 text-white">
        <div className="flex items-center justify-between">

          <button onClick={onBack}>
            <ArrowLeft />
          </button>

          <h1 className="text-xl font-bold">
            Hesap Hareketleri
          </h1>

          <button onClick={onBack}>
            <Home />
          </button>

        </div>
      </header>

      {transactions.length === 0 ? (
        <div className="flex min-h-[500px] flex-col items-center justify-center px-8 text-center">

          <FileText
            size={52}
            className="text-[#777]"
          />

          <h2 className="mt-5 font-bold">
            Hesap hareketi bulunmamaktadır.
          </h2>

        </div>
      ) : (
        <div className="divide-y divide-[#eee]">

          {transactions.map((tx) => (
            <button
              key={tx.id}
              onClick={() => onSelect(tx)}
              className="flex w-full items-center gap-3 bg-white px-4 py-4 text-left"
            >

              <div
                className={`grid h-11 w-11 place-items-center rounded-full ${
                  tx.kind === "credit"
                    ? "bg-[#e6f7ee] text-[#15803d]"
                    : "bg-[#fff0f1] text-[#c9162d]"
                }`}
              >
                {tx.kind === "credit" ? (
                  <ArrowDownToLine size={20} />
                ) : (
                  <ArrowRight size={20} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {tx.title}
                </p>

                <p className="truncate text-xs text-[#888]">
                  {tx.subtitle}
                </p>

                <p className="mt-1 text-xs text-[#aaa]">
                  {tx.date}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`font-bold ${
                    tx.kind === "credit"
                      ? "text-[#15803d]"
                      : "text-[#c9162d]"
                  }`}
                >
                  {tx.amount}
                </p>

                <p className="mt-1 text-[10px] text-[#aaa]">
                  Dekont
                </p>
              </div>

            </button>
          ))}

        </div>
      )}
    </div>
  );
}

function Receipt({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const iban = transaction.recipientIban;

  const copy = () => {
    navigator.clipboard?.writeText(iban).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#fafafa]">
      <header className="bg-[#e30620] px-4 py-5 text-white">
        <div className="flex items-center justify-between">
          <button onClick={onClose}>
            <ArrowLeft />
          </button>
          <h1 className="text-xl font-bold">Dekont</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="bg-white px-5 py-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e6f7ee] text-[#15803d]">
          <Check size={32} />
        </div>
        <p className="mt-4 text-2xl font-bold">
          {transaction.amount}
        </p>
        <p className="mt-1 text-sm text-[#777]">
          İşlem tamamlandı
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <ReceiptRow label="İşlem" value={transaction.title} />
          <ReceiptRow label="Açıklama" value={transaction.subtitle} />
          <ReceiptRow label="Alıcı / Gönderen" value={transaction.recipientName} />
          <ReceiptRow label="İşlem Numarası" value={transaction.transactionNumber} />
          <ReceiptRow label="Tarih" value={transaction.date} />

          <div className="flex items-center justify-between gap-3 border-t border-[#eee] p-4">
            <span className="text-sm text-[#888]">IBAN</span>
            <div className="flex items-center gap-2 text-right">
              <span className="text-sm font-semibold">{iban}</span>
              <button onClick={copy} className="text-[#e30620]">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-[#fff8e1] p-4 text-xs text-[#8a6a00]">
          Bu ekran yalnızca demo amaçlıdır. Gerçek finansal işlem gerçekleştirmez.
        </p>
      </div>

      <div className="bg-white p-5">
        <button
          onClick={onClose}
          className="w-full rounded-full bg-[#e30620] py-4 font-bold text-white"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#eee] p-4">
      <span className="text-sm text-[#888]">
        {label}
      </span>

      <span className="text-right text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}

function OtherView({
  view,
  onBack,
  onTransfer,
}: {
  view: View;
  onBack: () => void;
  onTransfer: () => void;
}) {
  const titles: Record<string, string> = {
    products: "Ürünler",
    actions: "İşlemler",
    applications: "Başvurular",
    menu: "Tüm Menü",
  };

  const items =
    view === "actions"
      ? [
          ["Para Transferi", Send],
          ["QR ile Para Çekme", QrCode],
          ["Fatura Ödeme", ReceiptText],
        ]
      : view === "products"
        ? [
            ["Yeni Hesap Aç", Banknote],
            ["Kartlarım", CreditCard],
            ["Birikim Hedefi", TrendingUp],
          ]
        : [
            ["Kredi Başvurusu", FileText],
            ["Limit Artırımı", ArrowRight],
            ["Güvenlik Merkezi", ShieldCheck],
          ];

  return (
    <div className="min-h-screen bg-[#f8f7f7] px-5 pb-28 pt-6">

      <div className="flex items-center gap-3">

        <button
          onClick={onBack}
          className="grid h-10 w-10 place-items-center rounded-xl bg-white"
        >
          <ArrowLeft size={19} />
        </button>

        <h1 className="text-2xl font-bold">
          {titles[view]}
        </h1>

      </div>

      <div className="mt-7 rounded-2xl bg-[#e30620] p-5 text-white">

        <Sparkles size={23} />

        <p className="mt-4 text-xl font-bold">
          Günlük bankacılık, tek dokunuşla.
        </p>

        <p className="mt-2 text-sm text-white/80">
          Demo alanı · Gerçek işlem gerçekleştirmez.
        </p>

      </div>

      <div className="mt-5 space-y-3">

        {items.map(([label, Icon]) => (
          <button
            key={String(label)}
            onClick={
              label === "Para Transferi"
                ? onTransfer
                : undefined
            }
            className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm"
          >

            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff0f1] text-[#d3132b]">
              <Icon size={21} />
            </span>

            <span className="flex-1 font-semibold">
              {String(label)}
            </span>

            <ChevronRight
              size={18}
              className="text-[#aaa]"
            />

          </button>
        ))}

      </div>
    </div>
  );
}

function BottomNav({
  view,
  onChange,
}: {
  view: View;
  onChange: (view: View) => void;
}) {
  const items: {
    label: string;
    view: View;
    icon: React.ElementType;
  }[] = [
    {
      label: "Ana Sayfa",
      view: "home",
      icon: Home,
    },
    {
      label: "Ürünler",
      view: "products",
      icon: LayoutGrid,
    },
    {
      label: "İşlemler",
      view: "actions",
      icon: Send,
    },
    {
      label: "Başvurular",
      view: "applications",
      icon: FileText,
    },
    {
      label: "Tüm Menü",
      view: "menu",
      icon: Menu,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 flex h-[76px] w-full max-w-[430px] -translate-x-1/2 items-start justify-around border-t border-[#eee] bg-white px-1 pt-3 shadow-[0_-3px_14px_rgba(60,35,37,.05)]">

      {items.map(
        ({ label, view: target, icon: Icon }) => (
          <button
            key={label}
            onClick={() => onChange(target)}
            className={`flex w-1/5 flex-col items-center gap-1 text-[11px] font-semibold ${
              view === target
                ? "text-[#df0b25]"
                : "text-[#777]"
            }`}
          >

            <Icon size={20} />

            <span>{label}</span>

            {view === target && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#df0b25]" />
            )}

          </button>
        ),
      )}

    </nav>
  );
}

function MenuRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <button className="flex w-full items-center gap-3 rounded-xl bg-[#f7f5f5] p-4 text-left">

      <span className="text-[#e30620]">
        {icon}
      </span>

      <span className="font-semibold">
        {text}
      </span>

      <ChevronRight
        size={17}
        className="ml-auto text-[#aaa]"
      />

    </button>
  );
}