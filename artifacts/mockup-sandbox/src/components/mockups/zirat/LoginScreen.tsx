import { useEffect, useState } from "react";
import headerWaveUrl from "@/assets/header-wave.jpg";
import { Bell, ChevronDown, MessageSquare, Search, User, X } from "lucide-react";

/* ── Ziraat wheat emblem — traced from the original logo ── */
export function WheatLogo({ height = 30, color = "white" }: { height?: number; color?: string }) {
  return (
    <svg height={height} viewBox="0 0 76 96" fill={color} style={{ display: "block" }}>
      {/* Top: small stem + hooks */}
      <rect x="35.2" y="0" width="5.6" height="21" />
      <polygon points="32.8,3 32.8,10.5 25.5,14 25.5,6.5" />
      <polygon points="43.2,3 43.2,10.5 50.5,14 50.5,6.5" />
      <polygon points="25.5,16 32.8,13 32.8,17.5 25.5,20.5" />
      <polygon points="50.5,16 43.2,13 43.2,17.5 50.5,20.5" />
      {/* Rows of grains: inner + outer segments (left / right mirrored) */}
      {[21, 41, 61].map(y => (
        <g key={y}>
          {/* left inner */}
          <polygon points={`36.6,${y} 36.6,${y + 12} 29,${y + 17.5} 29,${y + 5.5}`} />
          {/* left outer — vertical outer edge */}
          <polygon points={`26.8,${y + 7} 26.8,${y + 19} 10,${y + 31} 10,${y + 19}`} />
          {/* right inner */}
          <polygon points={`39.4,${y} 39.4,${y + 12} 47,${y + 17.5} 47,${y + 5.5}`} />
          {/* right outer */}
          <polygon points={`49.2,${y + 7} 49.2,${y + 19} 66,${y + 31} 66,${y + 19}`} />
        </g>
      ))}
      {/* Bottom V — arms meet in a downward point */}
      <polygon points="36.6,80 36.6,96 10,76 10,64" />
      <polygon points="39.4,80 39.4,96 66,76 66,64" />
    </svg>
  );
}

/* ── Splash: red silk + wheat logo + 162.yıl ── */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#df0712]">
      <img
        src="/ziraat-splash-reference.jpg"
        alt="Ziraat Bankası 162. yıl"
        className="h-full w-full object-cover object-center"
      />
    </div>
  );
}

/* ── Post-login loading skeleton (mirrors real app) ── */
export function LoadingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white text-[#242326]">
      {/* Header */}
      <header className="bg-[#e30620] px-5 pb-5 pt-4 text-white"
        style={{ backgroundImage: `url(${headerWaveUrl})`, backgroundSize: "cover", backgroundPosition: "center top" }}>
        <div className="flex items-center gap-3">
          <span className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full bg-white">
            <User size={22} className="text-[#aaa]" />
          </span>
          <div className="flex h-[44px] flex-1 items-center gap-2 rounded-full border border-white/55 bg-white/10 px-4">
            <Search size={17} className="shrink-0" />
            <span className="text-[14px]">Ziraat Mobil&apos;de Ara</span>
          </div>
          <span className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-2xl bg-white/20">
            <MessageSquare size={20} />
          </span>
        </div>
        <div className="mt-4 text-[15px]">İyi Günler <strong>Muhammed Yılmaz</strong></div>
      </header>
      {/* İpuçları band */}
      <div className="flex items-center justify-between border-b border-[#e8e3e3] bg-white px-5 py-4 text-[16px] font-semibold">
        İpuçlarına hemen göz at! <ChevronDown size={20} className="text-[#db1028]" />
      </div>
      {/* Tabs */}
      <div className="mt-5 flex items-end gap-7 border-b border-[#dedada] px-5">
        <span className="relative pb-3 text-[18px] font-semibold after:absolute after:bottom-[-1px] after:left-0 after:h-[3px] after:w-full after:bg-[#e30620]">Hesaplarım</span>
        <span className="pb-3 text-[18px] font-semibold text-[#87878c]">Kredi Kartlarım</span>
      </div>
      {/* Skeleton + spinner */}
      <div className="relative flex-1 px-5 pt-6">
        <div className="space-y-5">
          {[["w-3/5","w-2/5"],["w-4/5","w-1/2"],["w-2/3","w-3/4"],["w-1/2","w-2/5"]].map(([a, b], i) => (
            <div key={i} className="space-y-3">
              <div className={`h-4 animate-pulse rounded-full bg-[#efeceb] ${a}`} />
              <div className={`h-4 animate-pulse rounded-full bg-[#f4f1f0] ${b}`} />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <span className="h-14 w-14 animate-spin rounded-full border-4 border-[#e8e3e3] border-t-[#e30620]" />
        </div>
      </div>
    </div>
  );
}

const PASSWORD = "834283";

/* Promo cards from the reference carousel */
const promos = [
  { title: "Ziraat Portföy", lines: ["Havacılık ve", "Savunma", "Teknolojileri", "Değişken Fonu"] },
  { title: "Koyu Tema Seçeneği", lines: ["Ziraat", "Mobil'de"] },
  { title: "Bankkart Seyahat", lines: ["Ziraat'te"] },
  { title: "Açık İhracat", lines: ["Hesabı", "Takibi"] },
  { title: "Tüm Kartlarınıza", lines: ["Açık", "Bankacılık"] },
];

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState(false);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(false), 1800);
    return () => clearTimeout(t);
  }, [error]);

  const tryLogin = () => {
    if (password === PASSWORD) {
      onLogin();
    } else {
      setError(true);
    }
  };

  const referenceLogin = (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#df0712] text-white">
      <img
        src="/ziraat-login-reference.jpg"
        alt="Ziraat Mobil giriş ekranı"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
      />

      <button
        onClick={() => setSheetOpen(true)}
        aria-label="Giriş Yap"
        type="button"
        className="absolute left-[13%] top-[62.8%] z-50 flex h-[6.2%] w-[74%] touch-manipulation items-center justify-center rounded-full bg-white text-[clamp(18px,4.2vw,24px)] font-semibold text-[#161616] shadow-none active:bg-[#f4f4f4]"
      >
        Giriş Yap
      </button>

      {sheetOpen && (
        <div className="absolute inset-0 z-40 overflow-hidden bg-white">
          <img
            src="/ziraat-password-reference.jpg"
            alt="Ziraat Mobil şifre ekranı"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {password.length > 0 && (
            <div className="absolute left-[7.4%] top-[41.3%] flex h-[4.1%] w-[42%] items-center bg-white px-3 text-[20px] font-bold tracking-[0.22em] text-[#444]">
              {"•".repeat(password.length)}
            </div>
          )}

          <input
            autoFocus
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={password}
            aria-label="Şifreniz"
            onChange={(event) => {
              setPassword(event.target.value.replace(/\D/g, ""));
              setError(false);
            }}
            onKeyDown={(event) => event.key === "Enter" && tryLogin()}
            className="absolute left-[7.4%] top-[40.5%] h-[5.9%] w-[48%] cursor-text bg-transparent text-transparent caret-[#333] outline-none"
          />

          {error && (
            <p className="absolute left-[9%] top-[46.2%] z-10 rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-[#e30620]">
              Hatalı şifre
            </p>
          )}

          <button
            onClick={tryLogin}
            aria-label="Giriş"
            className="absolute left-[3.8%] top-[48%] h-[6.1%] w-[92.4%] rounded-full bg-transparent"
          />

          <button
            onClick={() => setSheetOpen(false)}
            aria-label="Kapat"
            className="absolute left-[38%] top-[90%] h-[6%] w-[24%] bg-transparent"
          />
        </div>
      )}
    </div>
  );

  return referenceLogin;

  /* Legacy code retained only as a component reference. */
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[#e30620] text-white">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="text-[15px] font-semibold">TR</span>
        {/* Logo */}
        <div className="flex items-center gap-1.5">
          {/* Wheat symbol */}
          <WheatLogo height={30} />
          <span className="text-[22px] font-bold tracking-tight">Ziraat</span>
          <span className="text-[22px] font-light tracking-tight">Bankası</span>
        </div>
        <div className="flex items-center gap-3">
          <button aria-label="Mesajlar" className="active:scale-90"><MessageSquare size={21} /></button>
          <button aria-label="Bildirimler" className="active:scale-90"><Bell size={21} /></button>
        </div>
      </div>

      {/* ── Promo carousel — white cards with double-border frame ── */}
      <div className="mt-5 flex gap-3 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {promos.map(p => (
          <div key={p.title} className="shrink-0 rounded-[22px] border-[3px] border-white p-[3px]">
            <div className="flex h-[86px] w-[204px] items-center gap-3 rounded-[16px] bg-white px-3 text-left">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e30620]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 18l5-5 4 3 7-8" />
                  <path d="M15 8h5v5" />
                </svg>
              </div>
              <div className="min-w-0 leading-[1.15]">
                <p className="text-[12px] font-bold text-[#242326]">{p.title}</p>
                {p.lines.map(l => <p key={l} className="text-[11.5px] font-bold text-[#e30620]">{l}</p>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Center: avatar + welcome ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-8"
        style={{ backgroundImage: `url(${headerWaveUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="relative">
          <div className="grid h-[108px] w-[108px] place-items-center rounded-full bg-[#f0eded]">
            <User size={54} className="text-[#8a8a8a]" strokeWidth={1.6} fill="#8a8a8a" />
          </div>
          {/* Switch-user badge */}
          <span className="absolute bottom-1 right-0 grid h-7 w-7 place-items-center rounded-full bg-[#242326] text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
          </span>
        </div>
        <p className="mt-5 text-[14px] text-white/95">Ziraat Mobil&apos;e Hoş Geldiniz</p>
        <p className="mt-1 text-[13px] font-semibold tracking-wide">SÜPER ŞUBE</p>
        <p className="mt-1 text-[26px] font-bold">Muhammed Yılmaz</p>

        <button onClick={() => setSheetOpen(true)}
          className="mt-7 w-full max-w-[340px] rounded-full bg-white py-4 text-[16px] font-semibold text-[#242326] active:scale-[.98]">
          Giriş Yap
        </button>
        <button className="mt-5 text-[14px] font-semibold underline underline-offset-4">Şifremi Unuttum</button>

        {/* Quick links */}
        <div className="mt-9 flex w-full items-start justify-center gap-4">
          {[
            { label: "Finansal\nVeriler",     icon: <path d="M4 17l5-5 3 3 7-8M16 7h4v4" /> },
            { label: "Hesaplama\nAraçları",   icon: <><path d="M7.5 7.5h5M10 5v5M7 16.5l5.5-9M14.5 15h5M14.5 18h5"/></> },
            { label: "Uygulama\nMarketi",     icon: <><rect x="6" y="2" width="12" height="20" rx="2.5"/><circle cx="10" cy="8" r="0.9" fill="white" stroke="none"/><circle cx="14" cy="8" r="0.9" fill="white" stroke="none"/><circle cx="10" cy="12" r="0.9" fill="white" stroke="none"/><circle cx="14" cy="12" r="0.9" fill="white" stroke="none"/><circle cx="10" cy="16" r="0.9" fill="white" stroke="none"/><circle cx="14" cy="16" r="0.9" fill="white" stroke="none"/></> },
          ].map(({ label, icon }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
              </span>
              <span className="whitespace-pre-line text-left text-[12px] font-semibold leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <nav className="flex h-[86px] items-start justify-around border-t border-[#eee9e9] bg-white px-1 pt-3 text-[#3a373a]">
        {[
          { label: "FAST\nİşlemleri", icon: <span className="text-[15px] font-black italic text-[#e30620]">fas<span className="not-italic">₺</span></span> },
          { label: "QR Kod\nİşlemleri", icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e30620" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM19 19h2v2h-2z"/>
            </svg>
          )},
          { label: "Şubesiz\nYap", icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e30620" strokeWidth="1.8">
              <rect x="7" y="2" width="10" height="20" rx="2.5"/>
            </svg>
          )},
          { label: "Ziraat\nOnay", icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e30620" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 12l2.2 2.2L15.5 9.5"/>
            </svg>
          )},
          { label: "Diğer\nİşlemler", icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e30620" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>
            </svg>
          )},
        ].map(({ label, icon }) => (
          <button key={label} className="flex w-1/5 flex-col items-center gap-1.5">
            <span className="grid h-6 place-items-center">{icon}</span>
            <span className="whitespace-pre-line text-center text-[11px] font-semibold leading-tight">{label}</span>
          </button>
        ))}
      </nav>

      {/* ── Password sheet ── */}
      {sheetOpen && (
        <div className="absolute inset-0 z-40 flex flex-col">
          <button aria-label="Kapat" onClick={() => setSheetOpen(false)} className="h-[120px] bg-black/30" />
          <div className="relative flex flex-1 flex-col rounded-t-3xl bg-white px-6 text-[#242326]">
            {/* Avatar overlapping */}
            <div className="absolute -top-[54px] left-1/2 -translate-x-1/2">
              <div className="grid h-[108px] w-[108px] place-items-center rounded-full bg-[#f0eded] ring-4 ring-white">
                <User size={54} className="text-[#8a8a8a]" strokeWidth={1.6} fill="#8a8a8a" />
              </div>
            </div>
            <div className="mt-[68px] text-center">
              <p className="text-[14px] text-[#6c6a6c]">Ziraat Mobil&apos;e Hoş Geldiniz</p>
              <p className="mt-1 text-[24px] font-bold">Muhammed Yılmaz</p>
              <p className="mt-0.5 text-[12px] font-semibold tracking-wider text-[#6c6a6c]">BİREYSEL</p>
              <button className="mt-5 text-[15px] font-semibold underline underline-offset-4">Kullanıcı Değiştir</button>
            </div>

            {/* Password input */}
            <div className={`mt-7 flex h-[58px] items-center rounded-full border px-5 ${error ? "border-[#e30620]" : "border-[#d8d3d3]"}`}>
              <input
                type="password"
                inputMode="numeric"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && tryLogin()}
                placeholder="Şifreniz"
                className="h-full flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#8a8588]"
              />
              <button className="shrink-0 text-[15px] font-semibold underline underline-offset-4">Şifremi Unuttum</button>
            </div>
            {error && <p className="mt-2 px-2 text-[13px] font-semibold text-[#e30620]">Hatalı şifre. Tekrar deneyin.</p>}

            <button onClick={tryLogin}
              className="mt-5 w-full rounded-full bg-[#e30620] py-4 text-[16px] font-bold text-white active:scale-[.98]">
              GİRİŞ
            </button>

            {/* Kapat */}
            <div className="mt-auto pb-8 pt-6 text-center">
              <button onClick={() => setSheetOpen(false)} className="inline-flex flex-col items-center gap-1 text-[14px] text-[#49494d]">
                <X size={22} />
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
