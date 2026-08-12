import { useState } from "react";
import headerWaveUrl from "@/assets/header-wave.jpg";
import tileAracim   from "@/assets/tile-aracim.jpg";
import tileEvim     from "@/assets/tile-evim.jpg";
import tileIsim     from "@/assets/tile-isim.jpg";
import tileAilem    from "@/assets/tile-ailem.jpg";
import tileSeyahat  from "@/assets/tile-seyahatim.jpg";
import tileEtkinlik from "@/assets/tile-etkinlik.jpg";
import {
  AlignJustify, ArrowDownToLine, ArrowLeft, ArrowRight,
  Banknote, Check, ChevronDown, ChevronRight, ClipboardCheck, ClipboardList,
  Copy, CreditCard,
  FileText, Home, Landmark, LayoutGrid, MessageSquare,
  MoreVertical, PieChart, QrCode,
  ReceiptText, Repeat2, Search, Send, Share2, ShieldCheck, Sparkles,
  TrendingUp, User, X,
} from "lucide-react";

type View = "home" | "products" | "actions" | "applications" | "menu" | "transactions";
type Panel = "deposit" | "transfer" | "qr" | "bill" | null;

interface Receipt {
  id: string;
  type: string;
  amount: string;
  iban: string;
  fromName: string;
  toName: string;
  date: string;
  account: string;
  ref: string;
}

interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  rawAmount: number;
  date: string;
  kind: "credit" | "debit";
  receipt: Receipt;
}

/* ── helpers ─────────────────────────────────────────── */
function formatTry(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TL";
}
function parseTryAmount(s: string) {
  return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
}
function nowLabel() {
  const d = new Date();
  const months = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function shortTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

const MY_IBAN = "TR31 0001 0090 1041 2062 7050 01";
const MY_ACCOUNT = "Ziraat Süper Şube · Vadesiz TL";
const MY_NAME = "Muhammed Yılmaz";

// Custom SVG for ATM withdrawal (QR ile Para Çekme)
function AtmDownIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* ATM body */}
      <rect x="3" y="2" width="18" height="20" rx="2.5" />
      {/* Screen */}
      <rect x="6" y="5" width="12" height="8" rx="1.5" />
      {/* Down arrow */}
      <line x1="12" y1="15" x2="12" y2="20" />
      <polyline points="9 17.5 12 20.5 15 17.5" />
    </svg>
  );
}

const shortcuts = [
  { label: "Varlıklarım",        icon: PieChart,      action: "assets",   customIcon: null            },
  { label: "Son İşlemler",       icon: ClipboardList, action: "txns",     customIcon: null            },
  { label: "QR ile Para\nÇekme", icon: null,          action: "qr",       customIcon: <AtmDownIcon /> },
  { label: "Para\nTransferi",    icon: Banknote,      action: "transfer", customIcon: null            },
];

const navItems: { label: string; view: View; icon: React.ElementType }[] = [
  { label: "Ana Sayfa",  view: "home",         icon: Home           },
  { label: "Ürünler",    view: "products",     icon: LayoutGrid     },
  { label: "İşlemler",   view: "actions",      icon: Repeat2        },
  { label: "Başvurular", view: "applications", icon: ClipboardCheck },
  { label: "Tüm Menü",   view: "menu",         icon: AlignJustify   },
];

/* ═══════════════════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════════════════ */
export function ZiratMobile() {
  const [view, setView]               = useState<View>("home");
  const [panel, setPanel]             = useState<Panel>(null);
  const [tab, setTab]                 = useState<"accounts" | "cards">("accounts");
  const [balance, setBalance]         = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  const [talimatlarOpen, setTalimatlarOpen] = useState(false);
  const [ajandaOpen, setAjandaOpen]   = useState(false);
  const [kurTab, setKurTab]           = useState<"ziraat" | "piyasa" | "borsa">("ziraat");

  /* transfer / deposit inputs */
  const [recipient, setRecipient]     = useState("Ayşe Demir");
  const [recipientIban, setRecipientIban] = useState("TR62 0001 0017 4530 0006 0000 58");
  const [depositAmount, setDepositAmount] = useState("1.000,00");
  const [transferAmount, setTransferAmount] = useState("850,00");

  /* panel / confirmation state */
  const [step, setStep] = useState<"form" | "confirm" | "receipt">("form");

  const openPanel = (p: Exclude<Panel, null>) => {
    setPanel(p);
    setStep("form");
  };
  const closePanel = () => { setPanel(null); setStep("form"); };

  const buildDepositReceipt = (): Receipt => ({
    id:       `ZR-${Date.now().toString().slice(-8)}`,
    type:     "Para Yatırma",
    amount:   formatTry(parseTryAmount(depositAmount)),
    iban:     MY_IBAN,
    fromName: MY_NAME,
    toName:   MY_NAME,
    date:     nowLabel(),
    account:  MY_ACCOUNT,
    ref:      `REF${Date.now().toString().slice(-10)}`,
  });

  const buildTransferReceipt = (): Receipt => ({
    id:       `ZR-${Date.now().toString().slice(-8)}`,
    type:     "Para Transferi",
    amount:   formatTry(parseTryAmount(transferAmount)),
    iban:     recipientIban,
    fromName: MY_NAME,
    toName:   recipient,
    date:     nowLabel(),
    account:  MY_ACCOUNT,
    ref:      `REF${Date.now().toString().slice(-10)}`,
  });

  const confirmDeposit = () => {
    const num = parseTryAmount(depositAmount);
    const r   = buildDepositReceipt();
    setBalance(b => b + num);
    setTransactions(t => [{
      id: r.id, title: "Para Yatırma", subtitle: "Ziraat Süper Şube",
      amount: `+${r.amount}`, rawAmount: num,
      date: `Bugün · ${shortTime()}`, kind: "credit", receipt: r,
    }, ...t]);
    setStep("receipt");
    setPanel("deposit"); // stay in panel to show receipt
  };

  const confirmTransfer = () => {
    const num = parseTryAmount(transferAmount);
    const r   = buildTransferReceipt();
    setBalance(b => Math.max(0, b - num));
    setTransactions(t => [{
      id: r.id, title: `${recipient}'e Transfer`, subtitle: recipientIban,
      amount: `-${r.amount}`, rawAmount: -num,
      date: `Bugün · ${shortTime()}`, kind: "debit", receipt: r,
    }, ...t]);
    setStep("receipt");
  };

  return (
    <main className="min-h-[100dvh] bg-[#f4f1f2] text-[#242326] antialiased">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] overflow-hidden bg-[#fbfafa] shadow-[0_0_55px_rgba(93,23,30,.12)]">

        {/* ── HOME ─────────────────────────────────────── */}
        {view === "home" && (
          <div className="overflow-y-auto pb-24">
            {/* Red header */}
            <header className="relative overflow-hidden px-5 pb-6 pt-4 text-white" style={{
              backgroundImage: `url(${headerWaveUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}>

              <div className="relative">
                <div className="mb-4" />
                {/* Nav row */}
                <div className="flex items-center gap-3">
                  {/* Profile: solid white circle */}
                  <button aria-label="Profil" className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full bg-white active:scale-95">
                    <User size={22} className="text-[#aaa]" />
                  </button>
                  {/* Search bar */}
                  <div className="flex h-[44px] flex-1 items-center gap-2 rounded-full border border-white/55 bg-white/10 px-4">
                    <Search size={17} className="shrink-0" />
                    <span className="text-[14px]">Ziraat Mobil&apos;de Ara</span>
                  </div>
                  {/* Message button */}
                  <button aria-label="Mesajlar" className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-2xl bg-white/20 active:scale-95">
                    <MessageSquare size={20} />
                  </button>
                </div>
                <div className="mt-4 text-[15px]">İyi Akşamlar <strong>Muhammed Yılmaz</strong></div>
              </div>
            </header>

            {/* İpuçları banner */}
            <button className="flex w-full items-center justify-between border-b border-[#e8e3e3] bg-white px-5 py-4 text-left text-[16px] font-semibold">
              İpuçlarına hemen göz at! <ChevronDown size={20} className="text-[#db1028]" />
            </button>

            <div className="px-5">
              {/* Account tabs */}
              <div className="mt-5 flex items-end gap-7 border-b border-[#dedada]">
                {(["accounts","cards"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`relative pb-3 text-[18px] font-semibold transition-colors ${tab === t ? "text-[#242326] after:absolute after:bottom-[-1px] after:left-0 after:h-[3px] after:w-full after:bg-[#e30620]" : "text-[#87878c]"}`}>
                    {t === "accounts" ? "Hesaplarım" : "Kredi Kartlarım"}
                  </button>
                ))}
                <button aria-label="Daha fazla" className="ml-auto mb-2 grid h-9 w-9 place-items-center rounded-xl bg-[#efeeee]">
                  <MoreVertical size={18} />
                </button>
              </div>

              {tab === "accounts" ? (
                <section className="pt-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[17px] font-semibold tracking-wide text-[#c9162d]">ZİRAAT SÜPER ŞUBE</h2>
                    <button aria-label="Hesap İşlemleri" className="grid h-9 w-9 place-items-center rounded-xl bg-[#efeeee]">
                      {/* Person + circular arrows — matches Ziraat reference */}
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="3" />
                        <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
                        <path d="M3.5 10.5A9 9 0 0 1 20 7.5" />
                        <path d="M20.5 13.5A9 9 0 0 1 4 16.5" />
                        <polyline points="19 4 20 7.5 16.5 8" />
                        <polyline points="5 20 4 16.5 7.5 16" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="rounded-lg bg-[#b7a66d] px-3 py-1.5 text-[12px] font-bold text-white">Vadesiz TL</span>
                    <span className="text-[14px] text-[#49494d]">4000-104120627-5001</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[14px] text-[#49494d]">
                    <span>{MY_IBAN}</span>
                    <button aria-label="Paylaş" className="text-[#d3132b] active:scale-90">
                      <Share2 size={18} />
                    </button>
                  </div>
                  <div className="mt-4">
                    <p className="text-[12px] text-[#6c6a6c]">Bakiye</p>
                    <p className="text-[24px] font-bold">{formatTry(balance)}</p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button onClick={() => setView("products")} className="rounded-full bg-[#e30620] py-3.5 text-[14px] font-semibold text-white active:scale-[.98]">Tüm Hesaplarım</button>
                    <button onClick={() => setView("transactions")} className="rounded-full bg-[#e30620] py-3.5 text-[14px] font-semibold text-white active:scale-[.98]">Hesap Hareketleri</button>
                  </div>
                </section>
              ) : (
                <section className="mt-5 rounded-2xl bg-[#f1eded] p-5">
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-[#d3132b]" />
                    <div><p className="font-bold">Ziraat Bonus Kart</p><p className="text-sm text-[#777276]">•••• 2468</p></div>
                  </div>
                  <p className="mt-5 text-sm text-[#777276]">Kullanılabilir limit</p>
                  <p className="text-2xl font-bold">28.750,00 TL</p>
                </section>
              )}
            </div>

            {/* Kısayollarım */}
            <section className="mt-6 bg-[#f5f3f3] px-5 py-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-bold">Kısayollarım</h2>
                <button onClick={() => setView("actions")} className="flex items-center gap-1 text-[13px] text-[#242326]">
                  Tüm Kısayollarım <ArrowRight size={16} className="text-[#e30620]" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {shortcuts.map(({ label, icon: Icon, action, customIcon }) => (
                  <button key={label}
                    onClick={() => {
                      if (action === "txns")          setView("transactions");
                      else if (action === "qr")       openPanel("qr");
                      else if (action === "transfer") openPanel("transfer");
                      else if (action === "deposit")  openPanel("deposit");
                      else setView("products");
                    }}
                    className="flex min-h-[100px] flex-col items-center justify-center gap-2 rounded-xl bg-white px-1 text-center text-[12px] font-medium shadow-sm active:scale-95">
                    <span className="text-[#e30620]">
                      {customIcon ?? (Icon && <Icon size={24} strokeWidth={1.4} />)}
                    </span>
                    <span className="whitespace-pre-line leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Yaklaşan Talimatlarım */}
            <button onClick={() => setTalimatlarOpen(o => !o)}
              className="flex w-full items-center justify-between border-b border-[#ece8e8] bg-white px-5 py-4 text-left text-[17px] font-bold">
              Yaklaşan Talimatlarım
              <ChevronDown size={20} className={`text-[#d3132b] transition-transform ${talimatlarOpen ? "rotate-180" : ""}`} />
            </button>
            {talimatlarOpen && (
              <div className="bg-white px-5 pb-4">
                <div className="flex items-center gap-3 rounded-xl border border-[#ece7e7] p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#fff0f1] text-[#d3132b]"><ReceiptText size={19} /></div>
                  <div className="flex-1"><p className="text-sm font-semibold">Kira ödemesi</p><p className="text-xs text-[#858083]">12 Ağustos · 4.500,00 TL</p></div>
                  <ChevronRight size={18} className="text-[#b2abad]" />
                </div>
              </div>
            )}

            {/* Finansal Ajanda */}
            <button onClick={() => setAjandaOpen(o => !o)}
              className="flex w-full items-center justify-between border-b border-[#ece8e8] bg-white px-5 py-4 text-left text-[17px] font-bold">
              Finansal Ajanda
              <ChevronDown size={20} className={`text-[#d3132b] transition-transform ${ajandaOpen ? "rotate-180" : ""}`} />
            </button>
            {ajandaOpen && (
              <div className="bg-white px-5 pb-4 text-sm text-[#777276]">
                <p className="py-3">Yaklaşan finansal etkinlik bulunmamaktadır.</p>
              </div>
            )}

            {/* Hayatın Artısı Ziraat'te */}
            <section className="bg-[#f4f2f2] px-5 pt-5 pb-6">
              <div className="mb-4 flex items-center gap-2">
                {/* Ziraat 4-petal clover — outlined style */}
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="shrink-0">
                  <circle cx="11" cy="5.5" r="4" fill="#e30620"/>
                  <circle cx="11" cy="16.5" r="4" fill="#e30620"/>
                  <circle cx="5.5" cy="11" r="4" fill="#e30620"/>
                  <circle cx="16.5" cy="11" r="4" fill="#e30620"/>
                  <circle cx="11" cy="11" r="3.2" fill="#f4f2f2"/>
                </svg>
                <h2 className="text-[17px] font-bold">Hayatın Artısı Ziraat&apos;te</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["Aracım",        tileAracim  ],
                  ["Evim",          tileEvim    ],
                  ["İşim",          tileIsim    ],
                  ["Ailem",         tileAilem   ],
                  ["Seyahatim",     tileSeyahat ],
                  ["Etkinliklerim", tileEtkinlik],
                ] as [string, string][]).map(([label, src]) => (
                  <button key={label}
                    className="relative h-[108px] overflow-hidden rounded-xl text-left active:scale-[.98]">
                    <img src={src} alt={label} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <span className="absolute bottom-2 left-2.5 text-[13px] font-bold text-white drop-shadow leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Süper Şube dark banner */}
            <section className="relative overflow-hidden bg-[#1e2c34] px-5 py-6 text-white">
              {/* Diagonal chevron watermark */}
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="ssChevron" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
                      <text x="2" y="24" fontSize="22" fill="white" opacity="0.07" fontFamily="sans-serif" fontWeight="bold">&gt;</text>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#ssChevron)"/>
                </svg>
              </div>

              {/* Content */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  {/* Hourglass SVG icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4a93a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 3h14"/>
                    <path d="M5 21h14"/>
                    <path d="M5 3l7 8.5L5 21"/>
                    <path d="M19 3l-7 8.5L19 21"/>
                  </svg>
                  <span className="text-[#d4a93a] text-[13px] font-bold">Süper Şube</span>
                </div>
                <p className="text-[14px] leading-relaxed text-white/85">
                  Bir sonraki ay <strong className="text-white">Süper Şube Platin Müşteri</strong> avantajlarından faydalanabilmek için{" "}
                  <strong className="text-white">5 hedefi</strong> veya yıldızlı kriterlerden birini tamamlayın.
                </p>
                <button className="mt-4 rounded-full bg-[#e30620] px-5 py-2.5 text-[14px] font-bold text-white active:scale-[.98]">
                  Süper Şube İşlemleri
                </button>
              </div>
            </section>

            {/* Kur tablosu */}
            <section className="bg-white px-5 pt-5 pb-6">
              {/* Tabs */}
              <div className="flex border-b border-[#e8e3e3] mb-4">
                {(["ziraat","piyasa","borsa"] as const).map(k => (
                  <button key={k} onClick={() => setKurTab(k)}
                    className={`mr-5 pb-3 text-[14px] font-semibold transition-colors ${kurTab === k ? "border-b-2 border-[#e30620] text-[#242326]" : "text-[#999598]"}`}>
                    {k === "ziraat" ? "Ziraat Verileri" : k === "piyasa" ? "Piyasa Verileri" : "Borsa Verileri"}
                  </button>
                ))}
              </div>

              {kurTab === "ziraat" && (
                <>
                  <div className="flex justify-between text-[12px] text-[#999598] mb-2 px-1">
                    <span className="w-16" />
                    <span>Alış</span>
                    <span>Satış</span>
                  </div>
                  <div className="divide-y divide-[#f0ecec]">
                    {[
                      ["USD", "46,3461",         "49,1676"       ],
                      ["EUR", "53,4926",         "56,7493"       ],
                      ["GBP", "62,6042",         "66,4154"       ],
                      ["A02", "6.519,434925",    "7.462,719400"  ],
                      ["G02", "97,157092",       "111,214565"    ],
                    ].map(([cur, alis, satis]) => (
                      <div key={cur} className="flex items-center justify-between py-3 px-1 text-[14px]">
                        <span className="w-16 font-semibold">{cur}</span>
                        <span className="text-[#242326]">₺{alis}</span>
                        <span className="text-[#242326]">₺{satis}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[12px] text-[#999598]">
                    <span>12/08/2026 17:55</span>
                    <button className="flex items-center gap-1 text-[#242326] font-semibold">
                      Diğer Kurları Göster <ArrowRight size={14} className="text-[#e30620]" />
                    </button>
                  </div>
                </>
              )}
              {kurTab !== "ziraat" && (
                <p className="py-8 text-center text-[14px] text-[#999598]">Veri yükleniyor…</p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button className="rounded-full bg-[#e30620] py-3.5 text-[14px] font-semibold text-white active:scale-[.98]">Döviz İşlemleri</button>
                <button className="rounded-full bg-[#e30620] py-3.5 text-[14px] font-semibold text-white active:scale-[.98]">Altın İşlemleri</button>
              </div>
            </section>

            {/* Size Özel Fırsatlar */}
            <section className="bg-[#e8001c] px-5 pt-5 pb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-white">Size Özel Fırsatlar</h2>
                <button className="flex items-center gap-1 text-[13px] text-white font-semibold">
                  Tüm Kampanyalar <ArrowRight size={15} />
                </button>
              </div>
              {/* Campaign card */}
              <div className="overflow-hidden rounded-2xl bg-white">
                <div className="flex h-[160px]">
                  <div className="relative w-[140px] shrink-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2a4a7a] to-[#1a2a5a]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 rounded-full border-4 border-white/30 flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="white"><path d="M14 2L4 8v12l10 6 10-6V8L14 2z" strokeWidth="1.5" stroke="white" fill="none"/><path d="M10 14l3 3 5-5" strokeWidth="2" stroke="white" strokeLinecap="round"/></svg>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 text-[10px] font-bold text-white/80">BANKKART</div>
                  </div>
                  <div className="flex flex-1 flex-col justify-center px-4">
                    <p className="text-[15px] font-bold text-[#242326]">Bankkart Mobil</p>
                    <p className="mt-1.5 text-[13px] leading-snug text-[#6c6a6c]">Bankkart kampanyalarına katılmak için tıklayınız.</p>
                  </div>
                </div>
              </div>
              {/* Page dots */}
              <div className="mt-3 flex justify-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-white" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              </div>
            </section>

            {/* Son Giriş footer */}
            <section className="flex items-center justify-between border-t border-[#ece8e8] bg-white px-5 py-5">
              <div>
                <p className="text-[11px] text-[#999598]">Son Giriş</p>
                <p className="mt-0.5 text-[13px] font-bold text-[#242326]">12 Ağustos 2026 / 20:56</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#999598]">Son Hatalı Giriş</p>
                <p className="mt-0.5 text-[13px] font-bold text-[#242326]">12 Ağustos 2026 / 20:11</p>
              </div>
              <button className="ml-3 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f5f3f3]">
                <ArrowRight size={17} className="text-[#e30620]" />
              </button>
            </section>
          </div>
        )}

        {/* ── TRANSACTIONS ─────────────────────────────── */}
        {view === "transactions" && (
          <TransactionsView
            transactions={transactions}
            onBack={() => setView("home")}
            onOpenReceipt={setViewingReceipt}
          />
        )}

        {/* ── OTHER VIEWS ──────────────────────────────── */}
        {view !== "home" && view !== "transactions" && (
          <UtilityView view={view} onBack={() => setView("home")} onTransfer={() => openPanel("transfer")} />
        )}

        {/* ── BOTTOM NAV ───────────────────────────────── */}
        <BottomNav view={view} onChange={setView} />

        {/* ── DEPOSIT PANEL ────────────────────────────── */}
        {panel === "deposit" && (
          <DepositPanel
            amount={depositAmount}
            setAmount={setDepositAmount}
            step={step}
            onConfirm={confirmDeposit}
            onClose={closePanel}
          />
        )}

        {/* ── TRANSFER PANEL ───────────────────────────── */}
        {panel === "transfer" && (
          <TransferPanel
            recipient={recipient}  setRecipient={setRecipient}
            iban={recipientIban}   setIban={setRecipientIban}
            amount={transferAmount} setAmount={setTransferAmount}
            step={step}
            onConfirm={confirmTransfer}
            onClose={closePanel}
          />
        )}

        {/* ── QR / BILL PANELS ─────────────────────────── */}
        {(panel === "qr" || panel === "bill") && (
          <SimplePanel panel={panel} step={step} onConfirm={() => setStep("receipt")} onClose={closePanel} />
        )}

        {/* ── RECEIPT MODAL ────────────────────────────── */}
        {viewingReceipt && (
          <ReceiptModal receipt={viewingReceipt} onClose={() => setViewingReceipt(null)} />
        )}
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════
   TRANSACTIONS VIEW
═══════════════════════════════════════════════════════ */
function TransactionsView({ transactions, onBack, onOpenReceipt }: {
  transactions: Transaction[];
  onBack: () => void;
  onOpenReceipt: (r: Receipt) => void;
}) {
  const [activeTab, setActiveTab] = useState<"vadesiz" | "kk" | "diger">("vadesiz");

  return (
    <div className="min-h-[calc(100dvh-76px)] bg-[#fafafa]">
      {/* Red header */}
      <div className="bg-[#e30620] px-4 pb-4 pt-5 text-white">
        <div className="flex items-center justify-between">
          <button aria-label="Geri" onClick={onBack} className="active:scale-90"><ArrowLeft /></button>
          <h1 className="text-[20px] font-bold">Son İşlemler</h1>
          <button aria-label="Ana sayfa" onClick={onBack} className="active:scale-90"><Home /></button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0 overflow-x-auto border-b border-[#e5e0e0] bg-white px-3 pt-4 text-[15px]">
        {([
          ["vadesiz", "Vadesiz Hesap"],
          ["kk",      "Kredi Kartı"],
          ["diger",   "Diğer Banka Hesaplarım"],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`whitespace-nowrap pb-3 pr-5 font-semibold transition-colors ${activeTab === key ? "border-b-2 border-[#e30620] text-[#242326]" : "text-[#999598]"}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "vadesiz" ? (
        transactions.length === 0 ? (
          <div className="flex min-h-[560px] flex-col items-center justify-center px-10 text-center">
            <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border-2 border-[#6e787b] text-[#566164]">
              <FileText size={34} />
            </div>
            <h2 className="text-[16px] font-bold leading-snug">Vadesiz hesaplarınıza ait hareket bulunmamaktadır.</h2>
            <p className="mt-3 text-sm text-[#8b8588]">Gerçekleşen işlemler burada görünecek.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f0ecec] pb-28">
            {transactions.map(tx => (
              <button key={tx.id} onClick={() => onOpenReceipt(tx.receipt)}
                className="flex w-full items-center gap-3 bg-white px-4 py-4 text-left active:bg-[#fdf5f5]">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tx.kind === "credit" ? "bg-[#e6f7ee] text-[#15803d]" : "bg-[#fff0f1] text-[#c9162d]"}`}>
                  {tx.kind === "credit" ? <ArrowDownToLine size={20} /> : <ArrowRight size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px] truncate">{tx.title}</p>
                  <p className="text-xs text-[#8a8588] truncate">{tx.subtitle}</p>
                  <p className="text-xs text-[#aaa5a7] mt-0.5">{tx.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-[15px] ${tx.kind === "credit" ? "text-[#15803d]" : "text-[#c9162d]"}`}>{tx.amount}</p>
                  <p className="text-[11px] text-[#aaa5a7] mt-1">Dekont</p>
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        <div className="flex min-h-[560px] flex-col items-center justify-center px-10 text-center">
          <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border-2 border-[#6e787b] text-[#566164]">
            <FileText size={34} />
          </div>
          <h2 className="text-[16px] font-bold leading-snug">Bu hesaba ait hareket bulunmamaktadır.</h2>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   RECEIPT MODAL (full-screen dekont)
═══════════════════════════════════════════════════════ */
function ReceiptModal({ receipt, onClose }: { receipt: Receipt; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rows: [string, string, boolean?][] = [
    ["İşlem Türü",     receipt.type],
    ["Tarih",          receipt.date],
    ["Gönderen",       receipt.fromName],
    ["Alıcı",          receipt.toName],
    ["IBAN",           receipt.iban, true],
    ["Hesap",          receipt.account],
    ["Tutar",          receipt.amount],
    ["Referans No",    receipt.ref],
    ["Dekont No",      receipt.id],
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#fafafa]">
      {/* Header */}
      <div className="bg-[#e30620] px-4 pb-4 pt-5 text-white">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="active:scale-90"><ArrowLeft /></button>
          <h1 className="text-[20px] font-bold">Dekont</h1>
          <div className="w-6" />
        </div>
      </div>

      {/* Success badge */}
      <div className="flex flex-col items-center bg-white px-6 py-8 shadow-sm">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[#e6f7ee] text-[#15803d]">
          <Check size={32} strokeWidth={2.5} />
        </div>
        <p className="mt-4 text-[22px] font-bold">{receipt.amount}</p>
        <p className="mt-1 text-[15px] font-semibold text-[#242326]">{receipt.type} Tamamlandı</p>
        <p className="mt-1 text-[13px] text-[#8a8588]">{receipt.date}</p>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        <div className="rounded-2xl bg-white shadow-sm divide-y divide-[#f0ecec] overflow-hidden">
          {rows.map(([label, value, canCopy]) => (
            <div key={label} className="flex items-start justify-between gap-3 px-4 py-3.5">
              <span className="text-[13px] text-[#8a8588] shrink-0">{label}</span>
              <div className="flex items-center gap-2 text-right min-w-0">
                <span className="text-[14px] font-semibold text-[#242326] break-all">{value}</span>
                {canCopy && (
                  <button onClick={() => copy(value)} className="shrink-0 text-[#c9162d] active:scale-90">
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 rounded-xl bg-[#fff8e1] px-4 py-3 text-[12px] text-[#8a6a00]">
          Bu bir demo dekontu olup gerçek bir finansal işlemi temsil etmemektedir.
        </p>
      </div>

      {/* Close button */}
      <div className="absolute bottom-0 left-0 right-0 bg-white px-5 pb-8 pt-3 shadow-[0_-4px_16px_rgba(0,0,0,.06)]">
        <button onClick={onClose} className="w-full rounded-full bg-[#e30620] py-4 text-[15px] font-bold text-white active:scale-[.98]">
          Kapat
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DEPOSIT PANEL (bottom sheet)
═══════════════════════════════════════════════════════ */
function DepositPanel({ amount, setAmount, step, onConfirm, onClose }: {
  amount: string; setAmount: (v: string) => void;
  step: "form" | "confirm" | "receipt";
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Sheet onClose={onClose}>
      {step === "form" && (
        <>
          <SheetTitle title="Para Yatır" onClose={onClose} />
          {/* IBAN display */}
          <div className="mt-5 rounded-2xl bg-[#f8f3f3] px-4 py-4">
            <p className="text-[12px] font-semibold text-[#8a8588]">Para yatırılacak IBAN</p>
            <p className="mt-1 text-[15px] font-bold tracking-wide text-[#242326]">{MY_IBAN}</p>
            <p className="mt-0.5 text-[12px] text-[#8a8588]">{MY_ACCOUNT}</p>
          </div>
          <div className="mt-4">
            <label className="block text-[13px] font-semibold text-[#49494d]">
              Yatırılacak Tutar
              <div className="mt-2 flex items-center rounded-xl border border-[#e2dcdd] bg-[#faf8f8] px-4 py-3">
                <input
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 bg-transparent text-[16px] font-bold outline-none"
                  inputMode="decimal"
                />
                <span className="text-[14px] font-bold text-[#8a8588]">TL</span>
              </div>
            </label>
          </div>
          <p className="mt-3 rounded-xl bg-[#fff0f1] px-3 py-2.5 text-[12px] text-[#9a4c54]">
            Demo işlem — gerçek para transferi yapılmaz.
          </p>
          <button onClick={onConfirm}
            className="mt-5 w-full rounded-full bg-[#e30620] py-4 text-[15px] font-bold text-white active:scale-[.98]">
            Parayı Yatır
          </button>
        </>
      )}

      {step === "receipt" && <DepositSuccess amount={amount} iban={MY_IBAN} onClose={onClose} />}
    </Sheet>
  );
}

function DepositSuccess({ amount, iban, onClose }: { amount: string; iban: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(iban).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const formattedAmount = formatTry(parseTryAmount(amount));
  return (
    <>
      <div className="flex flex-col items-center py-6">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[#e6f7ee] text-[#15803d]">
          <Check size={32} strokeWidth={2.5} />
        </div>
        <p className="mt-4 text-[20px] font-bold">{formattedAmount}</p>
        <p className="mt-1 text-[14px] text-[#8a8588]">Para yatırma işlemi tamamlandı</p>
      </div>
      <div className="rounded-2xl bg-[#f4f1f2] divide-y divide-[#e8e3e3]">
        {[
          ["Hesap", MY_ACCOUNT],
          ["IBAN",  iban],
          ["Tarih", nowLabel()],
          ["Tutar", formattedAmount],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-[13px] text-[#8a8588]">{label}</span>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold">{value}</span>
              {label === "IBAN" && (
                <button onClick={copy} className="text-[#c9162d] active:scale-90">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[12px] text-[#aaa5a7]">Detaylı dekont için Hesap Hareketleri&apos;ni inceleyin.</p>
      <button onClick={onClose} className="mt-5 w-full rounded-full bg-[#e30620] py-4 text-[15px] font-bold text-white active:scale-[.98]">
        Ana Sayfaya Dön
      </button>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   TRANSFER PANEL
═══════════════════════════════════════════════════════ */
function TransferPanel({ recipient, setRecipient, iban, setIban, amount, setAmount, step, onConfirm, onClose }: {
  recipient: string; setRecipient: (v: string) => void;
  iban: string;      setIban: (v: string) => void;
  amount: string;    setAmount: (v: string) => void;
  step: "form" | "confirm" | "receipt";
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Sheet onClose={onClose}>
      {step !== "receipt" && <SheetTitle title="Para Transferi" onClose={onClose} />}
      {step === "form" && (
        <div className="mt-5 space-y-4">
          <label className="block text-[13px] font-semibold text-[#49494d]">
            Alıcı Adı
            <input value={recipient} onChange={e => setRecipient(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e2dcdd] bg-[#faf8f8] px-4 py-3 text-[15px] outline-none focus:border-[#e30620]" />
          </label>
          <label className="block text-[13px] font-semibold text-[#49494d]">
            Alıcı IBAN
            <input value={iban} onChange={e => setIban(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e2dcdd] bg-[#faf8f8] px-4 py-3 font-mono text-[13px] outline-none focus:border-[#e30620]" />
          </label>
          <label className="block text-[13px] font-semibold text-[#49494d]">
            Tutar
            <div className="mt-2 flex items-center rounded-xl border border-[#e2dcdd] bg-[#faf8f8] px-4 py-3">
              <input value={amount} onChange={e => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-[16px] font-bold outline-none" inputMode="decimal" />
              <span className="text-[14px] font-bold text-[#8a8588]">TL</span>
            </div>
          </label>
          <p className="rounded-xl bg-[#fff0f1] px-3 py-2.5 text-[12px] text-[#9a4c54]">
            Demo işlem — gerçek para transferi yapılmaz.
          </p>
          <button onClick={onConfirm} className="w-full rounded-full bg-[#e30620] py-4 text-[15px] font-bold text-white active:scale-[.98]">
            Transferi Onayla
          </button>
        </div>
      )}
      {step === "receipt" && (
        <>
          <div className="flex flex-col items-center py-6">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#e6f7ee] text-[#15803d]">
              <Check size={32} strokeWidth={2.5} />
            </div>
            <p className="mt-4 text-[20px] font-bold">{formatTry(parseTryAmount(amount))}</p>
            <p className="mt-1 text-[14px] text-[#8a8588]">{recipient}&apos;e transfer tamamlandı</p>
          </div>
          <div className="rounded-2xl bg-[#f4f1f2] divide-y divide-[#e8e3e3]">
            {[["Alıcı", recipient], ["IBAN", iban], ["Tarih", nowLabel()], ["Tutar", formatTry(parseTryAmount(amount))]].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-4 py-3">
                <span className="text-[13px] text-[#8a8588]">{label}</span>
                <span className="text-[13px] font-semibold">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[12px] text-[#aaa5a7]">Dekont için Hesap Hareketleri&apos;ni inceleyin.</p>
          <button onClick={onClose} className="mt-5 w-full rounded-full bg-[#e30620] py-4 text-[15px] font-bold text-white active:scale-[.98]">
            Ana Sayfaya Dön
          </button>
        </>
      )}
    </Sheet>
  );
}

/* ═══════════════════════════════════════════════════════
   SIMPLE PANEL (QR / Bill)
═══════════════════════════════════════════════════════ */
function SimplePanel({ panel, step, onConfirm, onClose }: { panel: Panel; step: "form"|"confirm"|"receipt"; onConfirm: () => void; onClose: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <SheetTitle title={panel === "qr" ? "QR ile Para Çekme" : "Fatura Ödeme"} onClose={onClose} />
      {step !== "receipt" ? (
        <div className="py-8 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-2xl border-2 border-dashed border-[#e30620] text-[#e30620]">
            {panel === "qr" ? <QrCode size={54} /> : <ReceiptText size={54} />}
          </div>
          <p className="mt-5 text-[14px] text-[#706a6d]">{panel === "qr" ? "ATM ekranındaki QR kodu tarayın." : "Ödemek istediğiniz faturayı seçin."}</p>
          <button onClick={onConfirm} className="mt-6 w-full rounded-full bg-[#e30620] py-4 text-[15px] font-bold text-white active:scale-[.98]">
            {panel === "qr" ? "Demo QR Okut" : "Fatura Seç"}
          </button>
        </div>
      ) : (
        <div className="py-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e6f7ee] text-[#15803d]"><Check size={32} /></div>
          <p className="mt-4 text-[18px] font-bold">Demo işlem tamamlandı</p>
          <button onClick={onClose} className="mt-7 w-full rounded-full bg-[#e30620] py-4 text-[15px] font-bold text-white">Kapat</button>
        </div>
      )}
    </Sheet>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED UI PRIMITIVES
═══════════════════════════════════════════════════════ */
function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-[#2b2021]/40" onClick={onClose}>
      <div className="w-full max-w-[430px] rounded-t-[28px] bg-[#fffdfd] px-5 pb-10 pt-4 max-h-[92dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d8d2d3]" />
        {children}
      </div>
    </div>
  );
}

function SheetTitle({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[20px] font-bold">{title}</h2>
      <button aria-label="Kapat" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f2eeee] active:scale-90">
        <X size={18} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   UTILITY / BOTTOM NAV
═══════════════════════════════════════════════════════ */
function UtilityView({ view, onBack, onTransfer }: { view: View; onBack: () => void; onTransfer: () => void }) {
  const titles: Record<string, string> = { products: "Ürünler", actions: "İşlemler", applications: "Başvurular", menu: "Tüm Menü" };
  const items: [string, React.ElementType][] =
    view === "actions"      ? [["Para transferi", Send],    ["QR ile para çekme", QrCode], ["Fatura ödeme", ReceiptText]] :
    view === "products"     ? [["Yeni hesap aç", Landmark], ["Kartlarım", CreditCard],     ["Birikim hedefi", TrendingUp]] :
                              [["Kredi başvurusu", FileText],["Limit artırımı", ArrowRight],["Güvenlik merkezi", ShieldCheck]];
  return (
    <div className="min-h-[calc(100dvh-76px)] bg-[#f8f7f7] px-5 pb-28 pt-6">
      <div className="flex items-center gap-3">
        <button aria-label="Geri" onClick={onBack} className="grid h-10 w-10 place-items-center rounded-xl bg-white active:scale-95"><ArrowLeft size={19} /></button>
        <h1 className="text-2xl font-bold">{titles[view]}</h1>
      </div>
      <div className="mt-8 rounded-2xl bg-[#e30620] p-5 text-white">
        <Sparkles size={22} />
        <p className="mt-4 text-xl font-bold">Günlük bankacılık, tek dokunuşla.</p>
        <p className="mt-2 text-sm text-white/75">Demo alanı · Gerçek hesap bilgisi istemez.</p>
      </div>
      <div className="mt-5 grid gap-3">
        {items.map(([label, Icon]) => (
          <button key={label} onClick={label === "Para transferi" ? onTransfer : undefined}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm active:scale-[.98]">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff0f1] text-[#d3132b]"><Icon size={21} /></span>
            <span className="flex-1 font-semibold">{label}</span>
            <ChevronRight size={18} className="text-[#aaa3a6]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function BottomNav({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-20 flex h-[76px] w-full max-w-[430px] -translate-x-1/2 items-start justify-around border-t border-[#eee9e9] bg-white px-1 pt-3 shadow-[0_-3px_14px_rgba(60,35,37,.05)]">
      {navItems.map(({ label, view: target, icon: Icon }) => (
        <button key={label} onClick={() => onChange(target)}
          className={`flex w-1/5 flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${view === target ? "text-[#df0b25]" : "text-[#777477]"}`}>
          <Icon size={20} />
          <span>{label}</span>
          {view === target && <span className="h-1.5 w-1.5 rounded-full bg-[#df0b25]" />}
        </button>
      ))}
    </nav>
  );
}
