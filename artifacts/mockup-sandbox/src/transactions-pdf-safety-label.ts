export {};

const PTW = 595.28;
const PTH = 841.89;
const DPI = 300;
const PX = DPI / 72;
const CW = Math.round(PTW * PX);
const CH = Math.round(PTH * PX);
const DEMO_LABEL = "DEMO / ÖRNEK - GERÇEK BANKA BELGESİ DEĞİLDİR";
const FONT = 'Arial, "Helvetica Neue", Helvetica, sans-serif';

const nativeToDataURL = HTMLCanvasElement.prototype.toDataURL;

HTMLCanvasElement.prototype.toDataURL = function (
  type?: string,
  quality?: any,
) {
  if (this.width === CW && this.height === CH) {
    const ctx = this.getContext("2d");
    if (ctx) {
      ctx.save();
      ctx.fillStyle = "#b00020";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.font = `700 8.5px ${FONT}`;
      ctx.fillText(DEMO_LABEL, PTW / 2, 811.5);
      ctx.restore();
    }
  }

  return nativeToDataURL.call(this, type, quality);
};
