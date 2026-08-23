const CUSTOM_PDF_LOGO_URL = "/ziraat-amblem.jpg?v=custom-logo-20260823-3";

const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
const originalFillRect = CanvasRenderingContext2D.prototype.fillRect;
const originalFillText = CanvasRenderingContext2D.prototype.fillText;

const LOGO_X = 50;
const LOGO_Y = 49;
const LOGO_HEIGHT = 56;
const LOGO_TEXT_GAP = 5;
const LOGO_TEXT_Y = 86;

const customLogo = new Image();
customLogo.decoding = "sync";
customLogo.src = CUSTOM_PDF_LOGO_URL;
void customLogo.decode?.().catch(() => undefined);

function customLogoWidth() {
  if (!customLogo.complete || customLogo.naturalWidth <= 0 || customLogo.naturalHeight <= 0) {
    return 0;
  }

  return LOGO_HEIGHT * (customLogo.naturalWidth / customLogo.naturalHeight);
}

function drawCustomLogo(ctx: CanvasRenderingContext2D) {
  const logoWidth = customLogoWidth();
  if (logoWidth <= 0) return false;

  originalDrawImage.call(ctx, customLogo, LOGO_X, LOGO_Y, logoWidth, LOGO_HEIGHT);
  return true;
}

function customLogoTextX() {
  const logoWidth = customLogoWidth();
  return logoWidth > 0 ? LOGO_X + logoWidth + LOGO_TEXT_GAP : 72;
}

CanvasRenderingContext2D.prototype.drawImage = function (...args: any[]) {
  const canvas = this.canvas;
  const x = Number(args[1]);
  const y = Number(args[2]);
  const w = Number(args[3]);
  const h = Number(args[4]);

  if (
    canvas?.width === 1240 &&
    canvas?.height === 1754 &&
    x === 48 &&
    y === 42 &&
    w === 290 &&
    h === 76
  ) {
    this.save();

    this.fillStyle = "#fff";
    originalFillRect.call(this, 44, 36, 390, 94);

    if (!drawCustomLogo(this)) {
      originalDrawImage.apply(this, args as any);
    }

    this.fillStyle = "#111";
    this.textAlign = "left";
    this.textBaseline = "alphabetic";
    this.font = '700 31px "Times New Roman", Times, serif';
    originalFillText.call(this, "Ziraat Bankası", customLogoTextX(), LOGO_TEXT_Y);

    this.fillStyle = "#c6001d";
    this.textAlign = "right";
    this.font = "700 20px Arial, sans-serif";
  

    this.restore();
    return;
  }

  return originalDrawImage.apply(this, args as any);
};

CanvasRenderingContext2D.prototype.fillRect = function (...args: any[]) {
  const canvas = this.canvas;
  const x = Number(args[0]);
  const y = Number(args[1]);
  const w = Number(args[2]);
  const h = Number(args[3]);

  // transactions-pdf-runtime-fix fallback: eski logo yüklenemezse kırmızı çizgi çiziyordu.
  // Bu durumda da özel logoyu zorla yerleştiriyoruz.
  if (
    canvas?.width === 1240 &&
    canvas?.height === 1754 &&
    x === 50 &&
    y === 55 &&
    w === 12 &&
    h === 48
  ) {
    if (drawCustomLogo(this)) {
      return;
    }
  }

  return originalFillRect.apply(this, args as any);
};

CanvasRenderingContext2D.prototype.fillText = function (...args: any[]) {
  const canvas = this.canvas;
  const text = String(args[0] ?? "");

  // Runtime fallback kendi "Ziraat Bankası" yazısını x=72'ye basıyordu ve özel logonun
  // üstüne geliyordu. Logo yüklüyse yazıyı logonun hemen sağına taşıyoruz.
  if (
    canvas?.width === 1240 &&
    canvas?.height === 1754 &&
    text === "Ziraat Bankası" &&
    customLogoWidth() > 0
  ) {
    return originalFillText.call(this, text, customLogoTextX(), LOGO_TEXT_Y, args[3] as any);
  }

  return originalFillText.apply(this, args as any);
};

export {};
