const CUSTOM_PDF_LOGO_URL = "/ziraat-amblem.jpg?v=custom-logo-20260823-2";

const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
const originalFillRect = CanvasRenderingContext2D.prototype.fillRect;

const customLogo = new Image();
customLogo.decoding = "sync";
customLogo.src = CUSTOM_PDF_LOGO_URL;
void customLogo.decode?.().catch(() => undefined);

function drawCustomLogo(ctx: CanvasRenderingContext2D) {
  if (!customLogo.complete || customLogo.naturalWidth <= 0 || customLogo.naturalHeight <= 0) {
    return false;
  }

  const logoHeight = 74;
  const logoWidth = logoHeight * (customLogo.naturalWidth / customLogo.naturalHeight);
  originalDrawImage.call(ctx, customLogo, 52, 41, logoWidth, logoHeight);
  return true;
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
    this.fillText("Ziraat Bankası", 105, 89);

    this.fillStyle = "#c6001d";
    this.textAlign = "right";
    this.font = "700 20px Arial, sans-serif";
    this.fillText("DEMO / ÖRNEK BELGE", 1188, 72);

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

export {};
