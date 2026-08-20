import { useEffect, useMemo, useState } from "react";
import headerWaveUrl from "./assets/header-wave.jpg";
import {
  LoadingScreen,
  LoginScreen,
  SplashScreen,
} from "./components/mockups/zirat/LoginScreen";
import {
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
const MY_IBAN = "TR31 0001 1041 2062 7050 01";
const MY_ACCOUNT = "4000-104120627-5001";

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
  const [authStage, setAuthStage] = useState<"splash" | "login" | "loading" | "app">("splash");
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
  const [showCampaign, setShowCampaign] = useState(true);

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

  if (authStage === "splash") {
    return <SplashScreen onDone={() => setAuthStage("login")} />;
  }

  if (authStage === "login") {
    return <LoginScreen onLogin={() => setAuthStage("loading")} />;
  }

  if (authStage === "loading") {
    return <LoadingScreen onDone={() => setAuthStage("app")} />;
  }

  return (
    <main className="min-h-screen bg-[#f2f0f1] text-[#242326]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fafafa] shadow-xl">
        {view !== "transactions" && (
          <header
            className="bg-[#d90b17] bg-cover bg-center px-4 pb-5 pt-5 text-white"
            style={{ backgroundImage: `url(${headerWaveUrl})` }}
          >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="relative grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-white text-[#969b9d] shadow-sm"
            >
              <User size={22} strokeWidth={1.7} fill="currentColor" />
              <span className="absolute -right-0.5 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#555] px-1 text-[10px] font-bold text-white">9</span>
            </button>

            <div className="flex h-[46px] flex-1 items-center gap-3 rounded-full border border-white/60 bg-black/10 px-4">
              <Search size={22} strokeWidth={1.8} />
              <span className="text-[15px]">Ziraat Mobil&apos;de Ara</span>
            </div>

            <button className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] border border-white/30 bg-white/15 shadow-sm">
              <MessageSquare size={23} strokeWidth={1.8} />
            </button>
          </div>

          <p className="mt-4 text-[16px] font-light">
            İyi Akşamlar <strong className="font-bold">{MY_NAME}</strong>
          </p>
        </header>
        )}

        {view === "home" && (
          <div className="pb-24">
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex w-full items-center justify-between border-b border-[#e6e6e6] bg-[#f5f5f5] px-4 py-[18px] text-left text-[18px] font-bold"
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

            <div className="px-4">
              <div className="mt-4 flex items-end gap-5">
                <button
                  onClick={() => setTab("accounts")}
                  className={`relative pb-3 text-[18px] font-semibold ${
                    tab === "accounts"
                      ? "text-[#242326] after:absolute after:bottom-[-1px] after:left-0 after:h-[3px] after:w-full after:bg-[#e30620]"
                      : "text-[#888]"
                  }`}
                >
                  Hesaplarım
                </button>

                <button
                  onClick={() => setTab("cards")}
                  className={`relative pb-3 text-[18px] font-normal ${
                    tab === "cards"
                      ? "text-[#242326] after:absolute after:bottom-[-1px] after:left-0 after:h-[3px] after:w-full after:bg-[#e30620]"
                      : "text-[#888]"
                  }`}
                >
                  Kredi Kartlarım
                </button>

                <button className="ml-auto mb-1 grid h-11 w-11 place-items-center rounded-[14px] bg-[#f0f0f0]">
                  <MoreVertical size={18} />
                </button>
              </div>

              {tab === "accounts" && (
                <section className="relative border-t border-[#ddd] pt-5">
                  <h2 className="text-lg font-bold text-[#c9162d]">
                    ZİRAAT SÜPER ŞUBE
                  </h2>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="rounded-[8px] bg-[#a99a60] px-2.5 py-1 text-[11px] font-bold text-white">
                      Vadesiz TL
                    </span>
                    <span className="text-[13px] font-medium tracking-[-0.015em] text-[#444]">{MY_ACCOUNT}</span>
                  </div>

                  <div className="mt-5 flex items-center pr-14">
                    <span className="truncate text-[14px] font-medium text-[#333]">{MY_IBAN}</span>
                    <button className="grid h-8 w-8 place-items-center text-[#d3132b]" aria-label="IBAN paylaş">
                      <Share2 size={20} strokeWidth={2.2} />
                    </button>
                  </div>

                  <button className="absolute right-0 top-[76px] grid h-11 w-11 place-items-center rounded-[14px] bg-[#f0f0f0] text-[#222]" aria-label="QR işlemleri">
                    <QrCode size={23} strokeWidth={1.7} />
                  </button>

                  <p className="mt-5 text-[13px] text-[#555]">Bakiye</p>
                  <p className="mt-0.5 text-[24px] font-bold tracking-[-0.02em]">{formatMoney(balance)}</p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setView("products")}
                      className="rounded-full bg-[#e30620] py-3.5 text-[14px] font-medium text-white"
                    >
                      Tüm Hesaplarım
                    </button>

                    <button
                      onClick={() => setView("transactions")}
                      className="rounded-full bg-[#e30620] py-3.5 text-[14px] font-medium text-white"
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

            <section className="mt-6 bg-[#f1f1f1] px-4 py-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[19px] font-bold">Kısayollarım</h2>
                <button className="flex items-center gap-1 text-[13px] font-medium text-[#444]">Tüm Kısayollarım <ArrowRight size={18} className="text-[#e30620]" /></button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Shortcut icon={<PieChart size={23} />} label={"Varlıklarım"} onClick={() => setView("products")} />
                <Shortcut icon={<ClipboardList size={23} />} label={"Son\nİşlemler"} onClick={() => setView("transactions")} />
                <Shortcut icon={<QrCode size={23} />} label={"QR ile\nPara Çekme"} onClick={() => {}} />
                <Shortcut icon={<Banknote size={23} />} label={"Para\nTransferi"} onClick={() => setShowTransfer(true)} />
              </div>
            </section>

            {showCampaign && (
              <section className="relative flex min-h-[76px] items-center overflow-hidden bg-[#343d40] px-4 pr-16 text-white">
                <div className="absolute inset-y-0 right-12 w-28 -skew-x-12 bg-white/5" />
                <p className="relative max-w-[250px] text-[17px] font-bold leading-tight">Mevduat Teklifi almak için tıklayınız. <ArrowRight className="ml-1 inline" size={20} /></p>
                <button onClick={() => setShowCampaign(false)} className="absolute right-4 grid h-10 w-10 place-items-center rounded-[12px] border border-white/60" aria-label="Kampanyayı kapat"><X size={22} /></button>
              </section>
            )}
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

        {view !== "transactions" && (
          <BottomNav view={view} onChange={setView} />
        )}

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
  const monthMap: Record<string, string> = {
    OCAK: "OCA",
    ŞUBAT: "ŞUB",
    MART: "MAR",
    NİSAN: "NİS",
    MAYIS: "MAY",
    HAZİRAN: "HAZ",
    TEMMUZ: "TEM",
    AĞUSTOS: "AĞU",
    EYLÜL: "EYL",
    EKİM: "EKİ",
    KASIM: "KAS",
    ARALIK: "ARA",
  };

  const rows = useMemo(() => {
    let runningBalance = balance;

    return transactions.map((tx) => {
      const balanceAfter = runningBalance;

      runningBalance =
        tx.kind === "credit"
          ? runningBalance - tx.amount
          : runningBalance + tx.amount;

      return { ...tx, balanceAfter };
    });
  }, [transactions, balance]);

  return (
    <div className="min-h-screen bg-[#f2f3f4] pb-6 text-[#364047]">
      <header className="bg-[#d90b17] text-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="relative flex h-[58px] items-center px-2.5">
          <button
            onClick={onBack}
            className="grid h-10 w-10 place-items-center rounded-full transition-colors active:bg-white/10"
            aria-label="Geri"
          >
            <ArrowLeft size={25} strokeWidth={1.9} />
          </button>

          <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[18px] font-semibold tracking-[-0.01em]">
            Hesap Hareketleri
          </h1>

          <div className="ml-auto flex items-center gap-1">
            <button
              className="grid h-10 w-10 place-items-center rounded-full transition-colors active:bg-white/10"
              aria-label="Mesajlar"
            >
              <Mail size={23} strokeWidth={1.8} />
            </button>

            <button
              onClick={onBack}
              className="grid h-10 w-10 place-items-center rounded-full transition-colors active:bg-white/10"
              aria-label="Ana sayfa"
            >
              <Home size={23} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex gap-2.5 px-3 py-3">
        <button className="flex h-[50px] flex-1 items-center justify-between rounded-[8px] border border-[#92999d] bg-white px-4 text-[15px] font-medium text-[#3f484e]">
          <span>Son 1 ay</span>
          <ChevronDown size={17} className="text-[#626b70]" />
        </button>

        <button
          className="grid h-[50px] w-[50px] place-items-center rounded-[8px] border border-[#92999d] bg-white text-[#343d42]"
          aria-label="Filtre"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7h16M7 12h10M10 17h4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-[5px] px-3">
        {rows.map((tx) => {
          const parts = tx.date.trim().split(/\s+/);
          const day = parts[0] || "--";
          const monthKey = (parts[1] || "").toLocaleUpperCase("tr-TR");
          const month = monthMap[monthKey] || monthKey.slice(0, 3);
          const compactIban = tx.recipientIban.replace(/\s/g, "");

          return (
            <button
              key={tx.id}
              onClick={() => onSelect(tx)}
              className="relative flex min-h-[104px] w-full overflow-hidden rounded-[9px] border border-[#e4e6e7] bg-white text-left shadow-[0_1px_1px_rgba(20,28,34,0.025)] transition-colors active:bg-[#fafafa]"
            >
              <div className="flex w-[67px] shrink-0 flex-col items-center justify-center border-r border-[#eceeef] bg-[#fcfcfc]">
                <span className="text-[27px] font-light leading-none tracking-[-0.04em] text-[#303a40]">
                  {day}
                </span>
                <span className="mt-1 text-[10px] font-bold tracking-[0.1em] text-[#697277]">
                  {month}
                </span>
                <span className="mt-1 text-[10px] tabular-nums text-[#8a9195]">
                  {tx.time}
                </span>
              </div>

              <div className="min-w-0 flex-1 py-[12px] pl-3 pr-[106px]">
                {tx.kind === "credit" ? (
                  <>
                    <p className="truncate text-[12px] font-medium leading-[1.25] text-[#333d43]">
                      Gönd: {tx.recipientName.toLocaleUpperCase("tr-TR")}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-[1.3] text-[#5f696e]">
                      {tx.recipientBank} FAST işlemi
                    </p>
                    <p className="mt-1 truncate text-[10px] tracking-[0.01em] text-[#8a9195]">
                      {compactIban}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="line-clamp-1 text-[11px] font-medium leading-[1.25] text-[#333d43]">
                      {tx.recipientBank}/
                    </p>
                    <p className="mt-1 truncate text-[10px] text-[#7b8489]">
                      {compactIban}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-[1.3] text-[#5f696e]">
                      {tx.recipientName} — {tx.subtitle}
                    </p>
                  </>
                )}
              </div>

              <div
                className={`absolute right-3 top-3 whitespace-nowrap text-[12px] font-bold tabular-nums ${
                  tx.kind === "credit" ? "text-[#24934c]" : "text-[#303a40]"
                }`}
              >
                {tx.kind === "credit" ? "+" : "-"}
                {formatMoney(tx.amount)}
              </div>

              <ReceiptText
                size={17}
                strokeWidth={1.7}
                className="absolute right-3 top-[42px] text-[#5f686d]"
              />

              <div className="absolute bottom-[11px] right-3 text-right leading-none">
                <span className="block text-[8px] font-medium uppercase tracking-[0.04em] text-[#a0a6a9]">Kalan Bakiye</span>
                <span className="mt-1 block text-[10px] font-semibold tabular-nums text-[#505a5f]">
                  {formatMoney(tx.balanceAfter)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Receipt({ transaction, onClose }: { transaction: Transaction; onClose: () => void; }) {
  const [masked, setMasked] = useState(false);

  const displayedIban = masked
    ? `${transaction.recipientIban.slice(0, 7)} **** **** **** **** ${transaction.recipientIban.slice(-5)}`
    : transaction.recipientIban;
  const displayedName = masked
    ? `${transaction.recipientName.charAt(0)}${"*".repeat(Math.max(5, transaction.recipientName.length - 1))}`
    : transaction.recipientName.toLocaleUpperCase("tr-TR");
  const senderName = transaction.kind === "credit" ? displayedName : MY_NAME.toLocaleUpperCase("tr-TR");
  const receiverName = transaction.kind === "credit" ? MY_NAME.toLocaleUpperCase("tr-TR") : displayedName;
  const directionTitle = transaction.kind === "credit" ? "HESABA GELEN FAST" : "HESAPTAN FAST";
  const signedAmount = `${transaction.kind === "credit" ? "+" : "-"}${formatMoney(transaction.amount)}`;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#f1f2f3] text-[#30383d]">
      <header className="sticky top-0 z-10 bg-[#e30620] px-2.5 text-white">
        <div className="mx-auto flex w-full max-w-[430px] items-center">
          <button onClick={onClose} className="grid h-[56px] w-10 place-items-center"><ArrowLeft size={23} /></button>
          <h1 className="flex-1 text-center text-[17px] font-semibold">Hesap Hareketleri</h1>
          <button className="grid h-[56px] w-10 place-items-center"><Share2 size={19} /></button>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[430px] flex-col px-3 py-3">
        <div className="relative flex min-h-[570px] flex-1 flex-col rounded-[10px] bg-white px-5 pb-5 pt-16 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <button className="absolute right-5 top-5 text-[#111]" aria-label="Dekontu paylaş"><Share2 size={22} strokeWidth={1.8} /></button>
          <span className="absolute left-1/2 top-5 -translate-x-1/2 text-[7px] font-bold tracking-[0.16em] text-[#aaa]">ÖRNEK</span>

          <div className="mx-auto w-full max-w-[310px] text-[#111]">
            <div className="mb-2 flex items-end justify-between">
              <div className="flex items-center gap-1.5 font-bold">
                <img src="/ziraat-amblem.jpg" alt="Ziraat Bankası" className="h-7 w-5 shrink-0 object-contain" />
                <span className="text-[12px] tracking-[-0.03em]">Ziraat Bankası</span>
              </div>
              <h2 className="text-[10px] font-bold">{directionTitle}</h2>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[6.5px] leading-[1.45]">
              <div className="rounded-[3px] border border-[#c9c9c9] p-2">
                <DocumentRow label="ŞUBE KODU/ADI" value="4000 / ZİRAAT SÜPER ŞUBE" />
                <DocumentRow label="IBAN" value={MY_IBAN} />
                <DocumentRow label="HESAP NUMARASI" value={MY_ACCOUNT} />
                <DocumentRow label="VERGİ DAİRESİ" value="-" />
                <DocumentRow label="VERGİ KİMLİK NO" value="10067921118" />
                <DocumentRow label="İŞLEM TARİHİ" value={`${transaction.date} ${transaction.time}`} />
                <DocumentRow label="VALÖR" value={transaction.date} />
                <DocumentRow label="İŞLEM YERİ" value="ZİRAAT MOBİL" />
              </div>
              <div className="rounded-[3px] border border-[#c9c9c9] p-2 font-bold uppercase">
                <p>SAYIN</p>
                <p className="mt-0.5">{masked ? "M******** Y*****" : MY_NAME}</p>
                <p className="mt-3">DİJİTAL BANKACILIK MÜŞTERİSİ</p>
                <p>TÜRKİYE</p>
              </div>
            </div>

            <div className="px-2 pt-2 text-[9px] leading-[1.22]">
              <p>Fast Mesaj Kodu : A01 Fast Sorgu No : {transaction.transactionNumber}</p>
              <p>Gönderen : <strong>{senderName}</strong></p>
              <p>Alan Banka : {transaction.recipientBank}</p>
              <p className="break-words">Alıcı Hesap : {displayedIban} Alıcı : <strong>{receiverName}</strong></p>
              <p>İşlem Tutarı : {formatMoney(transaction.amount).replace("TL", "TRY")}</p>
              <p>Komisyon : 0,00 TRY BSMV : 0,00 TRY Mesaj Ücreti : 0,00 TRY</p>
              <p>Toplam Masraf : 0,00 TRY</p>
              <p className="mt-1">{formatMoney(transaction.amount).replace("TL", "TRY")} tutarında {transaction.title} işleminin yapılmasını talep ederim.</p>

              <div className="mt-5 flex items-end justify-between border-b border-[#444] pb-1">
                <div>
                  <p>Hesabınızdan {signedAmount} tutarında işlem yapılmıştır.</p>
                  <p className="mt-1">{transaction.date} {transaction.time} EFTTGIDD INTERNET</p>
                  <p>INTERNET</p>
                </div>
                <div className="pb-1 text-right text-[6px] font-bold leading-tight">
                  <p>Saygılarımızla</p>
                  <p>T.C. ZİRAAT BANKASI A.Ş.</p>
                  <p>İNTERNET ŞUBESİ</p>
                </div>
              </div>

              <p className="mt-1 text-[6.5px] leading-relaxed">Taraflar arasında tüm uyuşmazlıklarda, Banka&apos;nın defter kayıtları ve belgeleri kesin delil niteliğindedir.</p>
              <p className="mt-1 text-[6.5px]">Merkez: Finans Kent Mahallesi Finans Caddesi No:44A Ümraniye/İstanbul</p>
              <p className="mt-1 text-[6.5px]">www.ziraatbank.com.tr</p>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <button onClick={() => setMasked((value) => !value)} className="flex w-full items-center gap-3 px-2 py-3 text-left">
              <span className={`grid h-6 w-6 place-items-center rounded-[5px] border ${masked ? "border-[#e30620] bg-[#e30620] text-white" : "border-[#9da3a6] bg-white"}`}>{masked && <Check size={15} />}</span>
              <span className="text-[13px] font-semibold text-[#4a5459]">Adres ve Kimlik Bilgilerimi Maskele</span>
            </button>

            <button className="mt-2 w-full rounded-full bg-[#e30620] py-4 text-[14px] font-bold text-white">E-POSTA GÖNDER</button>
            <button onClick={onClose} className="mt-3 w-full rounded-full border border-[#222] bg-white py-4 text-[14px] font-bold text-[#465055]">GERİ</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[74px_1fr] gap-1">
      <strong>{label}</strong>
      <span className="truncate">: &nbsp;{value}</span>
    </div>
  );
}

function ReceiptLine({ label, value, strong = false, green = false }: { label: string; value: string; strong?: boolean; green?: boolean; }) {
  return (
    <div className="border-b border-[#eef0f1] py-2.5">
      <p className="text-[9px] font-medium uppercase tracking-[0.06em] text-[#9aa0a4]">{label}</p>
      <p className={`mt-1 text-[11px] leading-[1.4] ${strong ? "font-bold" : "font-medium"} ${green ? "text-[#16803c]" : "text-[#343d42]"}`}>{value}</p>
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

