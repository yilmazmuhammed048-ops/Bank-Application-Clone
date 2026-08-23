const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
const statementLogo = new Image();
statementLogo.src = "/ziraat-amblem.jpg";
void statementLogo.decode?.().catch(() => undefined);

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

    // Clear the old embedded statement logo area.
    this.fillStyle = "#fff";
    this.fillRect(44, 36, 390, 94);

    if (statementLogo.complete && statementLogo.naturalWidth > 0) {
      // The uploaded JPG contains a small white margin. Crop only that margin,
      // while keeping the actual logo's aspect ratio intact.
      const sx = statementLogo.naturalWidth * (2 / 68);
      const sy = statementLogo.naturalHeight * (13 / 147);
      const sw = statementLogo.naturalWidth * (61 / 68);
      const sh = statementLogo.naturalHeight * (117 / 147);
      const logoHeight = 76;
      const logoWidth = logoHeight * (sw / sh);

      originalDrawImage.call(
        this,
        statementLogo,
        sx,
        sy,
        sw,
        sh,
        50,
        40,
        logoWidth,
        logoHeight,
      );
    } else {
      originalDrawImage.apply(this, args as any);
    }

    this.fillStyle = "#111";
    this.textAlign = "left";
    this.textBaseline = "alphabetic";
    this.font = '700 31px "Times New Roman", Times, serif';
    this.fillText("Ziraat Bankası", 101, 89);

    this.restore();
    return;
  }

  return originalDrawImage.apply(this, args as any);
};

export {};
