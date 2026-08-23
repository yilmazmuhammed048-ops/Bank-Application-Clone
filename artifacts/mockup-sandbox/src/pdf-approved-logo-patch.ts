const CUSTOM_PDF_LOGO = "data:image/webp;base64,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";

const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
const customLogo = new Image();
customLogo.src = CUSTOM_PDF_LOGO;
void customLogo.decode?.().catch(() => undefined);

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
    this.fillRect(44, 36, 390, 94);

    if (customLogo.complete && customLogo.naturalWidth > 0) {
      const logoHeight = 74;
      const logoWidth = logoHeight * (customLogo.naturalWidth / customLogo.naturalHeight);
      originalDrawImage.call(this, customLogo, 52, 41, logoWidth, logoHeight);
    } else {
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

export {};
