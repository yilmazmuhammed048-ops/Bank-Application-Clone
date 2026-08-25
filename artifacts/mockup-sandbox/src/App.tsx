import { useEffect, useMemo, useState } from "react";
import headerWaveUrl from "./assets/header-wave.jpg";
import {
  LoadingScreen,
  LoginScreen,
  SplashScreen,
} from "./components/mockups/zirat/LoginScreen";
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

type ReceiptDetail = {
  label: string;
  value: string;
};

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
  balanceAfter?: string | number;
  details?: ReceiptDetail[];
  hideCounterparty?: boolean;
  charges?: string;
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
  balanceAfter?: number;
  details: ReceiptDetail[];
  hideCounterparty: boolean;
  charges?: string;
};

const DEFAULT_BALANCE = 1601.16;

const DEFAULT_TRANSACTIONS: AdminTransaction[] = [
  {
    id: 140,
    title: "FAST Giden",
    description: "Kuveyt Türk Katılım Bankası A.Ş. FAST işlemi",
    amount: "5.500,00",
    date: "24 Ağustos 2026",
    time: "19:37",
    recipientName: "Kuveyt Türk Katılım Bankası A.Ş.",
    recipientIban: "TR970020500009923879…",
    recipientBank: "Kuveyt Türk Katılım Bankası A.Ş.",
    transactionNumber: "20260824193755",
    balanceAfter: "1.601,16",
    type: "expense",
  },
  {
    id: 139,
    title: "ATM Para Çekme",
    description: "ATM PARA ÇEKME KART",
    amount: "4.000,00",
    date: "24 Ağustos 2026",
    time: "19:30",
    recipientName: "ATM PARA ÇEKME KART",
    transactionNumber: "20260824193040",
    balanceAfter: "7.101,16",
    details: [
      { label: "Kart No", value: "650083******1816" },
      { label: "ATM", value: "Z0215002" },
      { label: "Journal No", value: "12…" },
    ],
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 138,
    title: "ATM QR ile Para Çekme",
    description: "ATM QR İLE PARA ÇEKME",
    amount: "7.500,00",
    date: "24 Ağustos 2026",
    time: "19:29",
    recipientName: "ATM QR İLE PARA ÇEKME",
    transactionNumber: "20260824192975",
    balanceAfter: "11.101,16",
    details: [
      { label: "Hesap No", value: "4038-104120627-5001…" },
      { label: "İşlem Kanalı", value: "ATM QR" },
    ],
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 137,
    title: "ATM Para Çekme",
    description: "ATM PARA ÇEKME KART",
    amount: "8.000,00",
    date: "24 Ağustos 2026",
    time: "19:28",
    recipientName: "ATM PARA ÇEKME KART",
    transactionNumber: "20260824192880",
    balanceAfter: "18.601,16",
    details: [
      { label: "Kart No", value: "650083******1816" },
      { label: "ATM", value: "Z0215001" },
      { label: "Journal No", value: "0…" },
    ],
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 136,
    title: "Ziraat Mobil Havale",
    description: "Ziraat Mobil Havale",
    amount: "25.000,00",
    date: "24 Ağustos 2026",
    time: "19:27",
    recipientName: "ZEKİ CANKURT",
    recipientBank: "Ziraat Bankası",
    transactionNumber: "20260824192725",
    balanceAfter: "26.601,16",
    type: "income",
  },
  {
    id: 135,
    title: "MESAJ ÜCRETİ TUTARI",
    description: "MESAJ ÜCRETİ TUTARI",
    amount: "0,37",
    date: "24 Ağustos 2026",
    time: "15:50",
    recipientName: "MESAJ ÜCRETİ TUTARI",
    transactionNumber: "20260824155037",
    balanceAfter: "1.601,16",
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 134,
    title: "BSMV TUTARI",
    description: "BSMV TUTARI",
    amount: "0,18",
    date: "24 Ağustos 2026",
    time: "15:50",
    recipientName: "BSMV TUTARI",
    transactionNumber: "20260824155018",
    balanceAfter: "1.601,53",
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 133,
    title: "FAST Gelen",
    description: "0062-Türkiye Garanti Bankası A.Ş. FAST işlemi",
    amount: "105,00",
    date: "16 Ağustos 2026",
    time: "01:36",
    recipientName: "REMZİHAN ÇILINÇLI",
    recipientBank: "Türkiye Garanti Bankası A.Ş.",
    transactionNumber: "20260816013605",
    balanceAfter: "270,82",
    type: "income",
  },
  {
    id: 132,
    title: "FAST Giden",
    description: "297-GÜVEN MARKET / FAST işlemi",
    amount: "130,00",
    date: "15 Ağustos 2026",
    time: "12:27",
    recipientName: "GÜVEN MARKET",
    recipientIban: "TR0800006701000000045543297",
    recipientBank: "Yapı ve Kredi Bankası A.Ş.",
    transactionNumber: "20260815122730",
    balanceAfter: "165,82",
    type: "expense",
  },
  {
    id: 131,
    title: "MESAJ ÜCRETİ TUTARI",
    description: "MESAJ ÜCRETİ TUTARI",
    amount: "0,37",
    date: "14 Ağustos 2026",
    time: "20:25",
    recipientName: "MESAJ ÜCRETİ TUTARI",
    transactionNumber: "20260814202537",
    balanceAfter: "295,82",
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 130,
    title: "BSMV TUTARI",
    description: "BSMV TUTARI",
    amount: "0,18",
    date: "14 Ağustos 2026",
    time: "20:25",
    recipientName: "BSMV TUTARI",
    transactionNumber: "20260814202518",
    balanceAfter: "296,19",
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 129,
    title: "KOMİSYON TUTARI",
    description: "KOMİSYON TUTARI",
    amount: "3,63",
    date: "14 Ağustos 2026",
    time: "20:25",
    recipientName: "KOMİSYON TUTARI",
    transactionNumber: "20260814202563",
    balanceAfter: "296,37",
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 128,
    title: "FAST Giden",
    description: "FAST para transferi",
    amount: "2.200,00",
    date: "14 Ağustos 2026",
    time: "20:25",
    recipientName: "osman can yiğit",
    recipientIban: "TR470006200104100006660801",
    recipientBank: "Türkiye Garanti Bankası A.Ş.",
    transactionNumber: "20260814202522",
    balanceAfter: "300,00",
    type: "expense",
  },
  {
    id: 127,
    title: "FAST Gelen",
    description: "0046-Akbank T.A.Ş. FAST işlemi",
    amount: "2.500,00",
    date: "14 Ağustos 2026",
    time: "20:01",
    recipientName: "DOĞUKAN YILDIRIM",
    recipientBank: "Akbank T.A.Ş.",
    transactionNumber: "20260814200125",
    balanceAfter: "2.500,00",
    type: "income",
  },

  {
    id: 126,
    title: "ATM Para Çekme",
    description: "ATM PARA ÇEKME KART",
    amount: "1.250,00",
    date: "19 Ağustos 2026",
    time: "18:42",
    recipientName: "ATM PARA ÇEKME KART",
    transactionNumber: "20260819184212",
    balanceAfter: "1.520,27",
    details: [
      { label: "Kart No", value: "650083******1816" },
      { label: "ATM", value: "Z0215004" },
      { label: "Journal No", value: "1842…" },
    ],
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 125,
    title: "FAST Gelen",
    description: "0046-Akbank T.A.Ş. FAST işlemi",
    amount: "2.500,00",
    date: "18 Ağustos 2026",
    time: "17:14",
    recipientName: "DOĞUKAN YILDIRIM",
    recipientBank: "Akbank T.A.Ş.",
    transactionNumber: "20260818171425",
    balanceAfter: "2.770,82",
    type: "income",
  },
  {
    id: 124,
    title: "MESAJ ÜCRETİ TUTARI",
    description: "MESAJ ÜCRETİ TUTARI",
    amount: "0,37",
    date: "18 Ağustos 2026",
    time: "17:13",
    recipientName: "MESAJ ÜCRETİ TUTARI",
    transactionNumber: "20260818171337",
    balanceAfter: "270,82",
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 123,
    title: "BSMV TUTARI",
    description: "BSMV TUTARI",
    amount: "0,18",
    date: "18 Ağustos 2026",
    time: "17:13",
    recipientName: "BSMV TUTARI",
    transactionNumber: "20260818171318",
    balanceAfter: "271,19",
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 122,
    title: "ATM QR ile Para Çekme",
    description: "ATM QR İLE PARA ÇEKME",
    amount: "900,00",
    date: "12 Ağustos 2026",
    time: "13:26",
    recipientName: "ATM QR İLE PARA ÇEKME",
    transactionNumber: "20260812132690",
    balanceAfter: "3.245,44",
    details: [
      { label: "Hesap No", value: "4038-104120627-5001…" },
      { label: "İşlem Kanalı", value: "ATM QR" },
    ],
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 121,
    title: "MESAJ ÜCRETİ TUTARI",
    description: "MESAJ ÜCRETİ TUTARI",
    amount: "0,37",
    date: "12 Ağustos 2026",
    time: "13:25",
    recipientName: "MESAJ ÜCRETİ TUTARI",
    transactionNumber: "20260812132537",
    balanceAfter: "4.145,44",
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 120,
    title: "BSMV TUTARI",
    description: "BSMV TUTARI",
    amount: "0,18",
    date: "12 Ağustos 2026",
    time: "13:25",
    recipientName: "BSMV TUTARI",
    transactionNumber: "20260812132518",
    balanceAfter: "4.145,81",
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 119,
    title: "FAST Giden",
    description: "297-GÜVEN MARKET / FAST işlemi",
    amount: "650,00",
    date: "10 Ağustos 2026",
    time: "21:08",
    recipientName: "GÜVEN MARKET",
    recipientIban: "TR0800006701000000045543297",
    recipientBank: "Yapı ve Kredi Bankası A.Ş.",
    transactionNumber: "20260810210865",
    balanceAfter: "4.146,00",
    type: "expense",
  },
  {
    id: 118,
    title: "Ziraat Mobil Havale",
    description: "Ziraat Mobil Havale",
    amount: "7.000,00",
    date: "8 Ağustos 2026",
    time: "16:32",
    recipientName: "ZEKİ CANKURT",
    recipientBank: "Ziraat Bankası",
    transactionNumber: "20260808163270",
    balanceAfter: "4.796,00",
    type: "income",
  },
  {
    id: 117,
    title: "MESAJ ÜCRETİ TUTARI",
    description: "MESAJ ÜCRETİ TUTARI",
    amount: "0,37",
    date: "8 Ağustos 2026",
    time: "16:31",
    recipientName: "MESAJ ÜCRETİ TUTARI",
    transactionNumber: "20260808163137",
    balanceAfter: "-2.204,00",
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 116,
    title: "BSMV TUTARI",
    description: "BSMV TUTARI",
    amount: "0,18",
    date: "8 Ağustos 2026",
    time: "16:31",
    recipientName: "BSMV TUTARI",
    transactionNumber: "20260808163118",
    balanceAfter: "-2.203,63",
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 115,
    title: "ATM Para Çekme",
    description: "ATM PARA ÇEKME KART",
    amount: "2.000,00",
    date: "5 Ağustos 2026",
    time: "11:47",
    recipientName: "ATM PARA ÇEKME KART",
    transactionNumber: "20260805114720",
    balanceAfter: "4.796,55",
    details: [
      { label: "Kart No", value: "650083******1816" },
      { label: "ATM", value: "Z0215003" },
      { label: "Journal No", value: "1147…" },
    ],
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 114,
    title: "FAST Gelen",
    description: "0062-Türkiye Garanti Bankası A.Ş. FAST işlemi",
    amount: "105,00",
    date: "2 Ağustos 2026",
    time: "09:36",
    recipientName: "REMZİHAN ÇILINÇLI",
    recipientBank: "Türkiye Garanti Bankası A.Ş.",
    transactionNumber: "20260802093605",
    balanceAfter: "6.796,55",
    type: "income",
  },
  {
    id: 113,
    title: "MESAJ ÜCRETİ TUTARI",
    description: "MESAJ ÜCRETİ TUTARI",
    amount: "0,37",
    date: "2 Ağustos 2026",
    time: "09:35",
    recipientName: "MESAJ ÜCRETİ TUTARI",
    transactionNumber: "20260802093537",
    balanceAfter: "6.691,55",
    hideCounterparty: true,
    type: "expense",
  },
  {
    id: 112,
    title: "BSMV TUTARI",
    description: "BSMV TUTARI",
    amount: "0,18",
    date: "2 Ağustos 2026",
    time: "09:35",
    recipientName: "BSMV TUTARI",
    transactionNumber: "20260802093518",
    balanceAfter: "6.691,92",
    hideCounterparty: true,
    type: "expense",
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

function calculateCommission(transaction: Transaction) {
  const proportional = transaction.amount * 0.001;
  return Math.min(25, Math.max(2, proportional));
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

function transactionSortValue(item: { date: string; time: string }) {
  const months: Record<string, number> = {
    ocak: 0, şubat: 1, mart: 2, nisan: 3, mayıs: 4, haziran: 5,
    temmuz: 6, ağustos: 7, eylül: 8, ekim: 9, kasım: 10, aralık: 11,
  };
  const parts = item.date.trim().split(/\s+/);
  const day = Number(parts[0]) || 1;
  const month = months[(parts[1] || "").toLocaleLowerCase("tr-TR")] ?? 0;
  const year = Number(parts[2]) || 2026;
  const timeMatch = String(item.time || "00:00").match(/^(\d{1,2})[:.](\d{1,2})/);
  const hour = Number(timeMatch?.[1] || 0);
  const minute = Number(timeMatch?.[2] || 0);
  return new Date(year, month, day, hour, minute).getTime();
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
        recipientIban: item.recipientIban || "",
        recipientBank: item.recipientBank || "",
        transactionNumber: item.transactionNumber || String(item.id),
        balanceAfter:
          item.balanceAfter === undefined ? undefined : parseAmount(item.balanceAfter),
        details: Array.isArray(item.details) ? item.details : [],
        hideCounterparty: Boolean(item.hideCounterparty),
        charges: item.charges,
      };
    })
    .sort((a, b) => transactionSortValue(b) - transactionSortValue(a));
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

    const createdAt = new Date();
    const now = createdAt.getTime();
    const newTransaction: Transaction = {
      id: String(now),
      title: "FAST Giden",
      subtitle: "FAST PARA TRANSFERİ",
      amount,
      kind: "debit",
      date: createdAt.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: createdAt.toLocaleTimeString("tr-TR", {
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
            className="bg-[#d90b17] bg-cover bg-center px-5 pb-4 pt-4 text-white"
            style={{ backgroundImage: `url(${headerWaveUrl})` }}
          >
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

          <p className="mt-3 text-sm">
            İyi Günler <strong>{MY_NAME}</strong>
          </p>
        </header>
        )}

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
  const rows = useMemo(() => {
    let runningBalance = balance;

    return transactions.map((tx) => {
      const balanceAfter = tx.balanceAfter ?? runningBalance;
      runningBalance = tx.kind === "credit"
        ? balanceAfter - tx.amount
        : balanceAfter + tx.amount;
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
                    {tx.kind === "credit" && !tx.hideCounterparty ? "Gönd: " : ""}
                    {tx.recipientName || tx.title}
                  </p>
                  {(tx.subtitle || tx.recipientBank) && (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-[1.35] text-[#666]">
                      {[tx.subtitle, tx.recipientBank].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {tx.recipientIban && (
                    <p className="mt-1 truncate text-[10px] text-[#8a8a8a]">{tx.recipientIban}</p>
                  )}
                  {tx.transactionNumber && (
                    <p className="mt-1 text-[10px] text-[#999]">İşlem No: {tx.transactionNumber}</p>
                  )}
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
  const [masked, setMasked] = useState(false);
  const receiptDisplayTime = useMemo(() => {
    const raw = String(transaction.time || "00:00").trim();
    const match = raw.match(/^(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?$/);
    const hour = String(Number(match?.[1] ?? 0)).padStart(2, "0");
    const minute = String(Number(match?.[2] ?? 0)).padStart(2, "0");
    const second = String(Math.floor(Math.random() * 60)).padStart(2, "0");
    return `${hour}.${minute}.${second}`;
  }, [transaction.id, transaction.time]);

  const displayedIban = !transaction.recipientIban
    ? ""
    : masked
      ? `${transaction.recipientIban.slice(0, 7)} **** **** **** **** ${transaction.recipientIban.slice(-5)}`
      : transaction.recipientIban;
  const displayedName = masked
    ? `${transaction.recipientName.charAt(0)}${"*".repeat(Math.max(5, transaction.recipientName.length - 1))}`
    : transaction.recipientName.toLocaleUpperCase("tr-TR");
  const senderName = transaction.kind === "credit" ? displayedName : MY_NAME.toLocaleUpperCase("tr-TR");
  const receiverName = transaction.kind === "credit" ? MY_NAME.toLocaleUpperCase("tr-TR") : displayedName;
  const directionTitle = transaction.kind === "credit" ? "HESABA GELEN İŞLEM" : "HESAPTAN İŞLEM";
  const signedAmount = `${transaction.kind === "credit" ? "+" : "-"}${formatMoney(transaction.amount)}`;
  const commission = calculateCommission(transaction);
  const formattedCommission = formatMoney(commission).replace("TL", "TRY");

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
                <DocumentRow label="İŞLEM TARİHİ" value={`${transaction.date} ${receiptDisplayTime}`} />
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
              <p>İşlem No : {transaction.transactionNumber}</p>
              {!transaction.hideCounterparty && <p>Gönderen : <strong>{senderName}</strong></p>}
              {transaction.recipientBank && <p>Alan Banka : {transaction.recipientBank}</p>}
              {displayedIban && <p className="break-words">Alıcı Hesap : {displayedIban} Alıcı : <strong>{receiverName}</strong></p>}
              {transaction.details.map((detail) => <p key={`${detail.label}-${detail.value}`}>{detail.label} : {detail.value}</p>)}
              <p>İşlem Tutarı : {formatMoney(transaction.amount).replace("TL", "TRY")}</p>
              {!transaction.hideCounterparty && <p>Komisyon / Masraf : {transaction.charges || formattedCommission}</p>}
              <p className="mt-1">{transaction.subtitle}</p>

              <div className="mt-5 flex items-end justify-between border-b border-[#444] pb-1">
                <div>
                  <p>Hesabınızda {signedAmount} tutarında işlem yapılmıştır.</p>
                  <p className="mt-1">{transaction.date} {receiptDisplayTime} INTERNET</p>
                  <p>INTERNET</p>
                </div>
                <div className="pb-1 text-right text-[6px] font-bold leading-tight">
                  <p>Saygılarımızla</p>
                  <p>T.C. ZİRAAT BANKASI A.Ş.</p>
                  <p>İNTERNET ŞUBESİ</p>
                </div>
              </div>

              <p className="mt-1 text-[6.5px] leading-relaxed">Bu belge uygulama içi örnek verilerden üretilmiştir; resmi banka belgesi değildir.</p>
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
