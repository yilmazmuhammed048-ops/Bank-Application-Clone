export {};

const PTW = 595.28;
const PTH = 841.89;
const DPI = 300;
const PX = DPI / 72;
const CW = Math.round(PTW * PX);
const CH = Math.round(PTH * PX);

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
      
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      
      ctx.restore();
    }
  }

  return nativeToDataURL.call(this, type, quality);
};
