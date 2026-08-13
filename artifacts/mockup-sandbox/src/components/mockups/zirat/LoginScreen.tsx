import { useState } from "react";
import headerWaveUrl from "@/assets/header-wave.jpg";
import { Bell, MessageSquare, User, X } from "lucide-react";

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

  const tryLogin = () => {
    if (password === PASSWORD) {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1800);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[#e30620] text-white">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="text-[15px] font-semibold">TR</span>
        {/* Logo */}
        <div className="flex items-center gap-1.5">
          {/* Wheat symbol */}
          <svg width="24" height="30" viewBox="0 0 24 30" fill="white">
            {/* Center stem */}
            <rect x="11.2" y="6" width="1.6" height="23" rx="0.8"/>
            {/* Top grain */}
            <ellipse cx="12" cy="4" rx="1.8" ry="3.4"/>
            {/* Left grains */}
            <ellipse cx="8.2" cy="9"  rx="1.7" ry="3.2" transform="rotate(-35 8.2 9)"/>
            <ellipse cx="7.4" cy="14" rx="1.7" ry="3.2" transform="rotate(-35 7.4 14)"/>
            <ellipse cx="6.6" cy="19" rx="1.7" ry="3.2" transform="rotate(-35 6.6 19)"/>
            {/* Right grains */}
            <ellipse cx="15.8" cy="9"  rx="1.7" ry="3.2" transform="rotate(35 15.8 9)"/>
            <ellipse cx="16.6" cy="14" rx="1.7" ry="3.2" transform="rotate(35 16.6 14)"/>
            <ellipse cx="17.4" cy="19" rx="1.7" ry="3.2" transform="rotate(35 17.4 19)"/>
          </svg>
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
