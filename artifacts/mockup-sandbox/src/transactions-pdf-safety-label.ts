export {};

const DPI = 300;
const PX = DPI / 72;
const A4_W = 595.28;
const A4_H = 841.89;
const LETTER_W = 612;
const LETTER_H = 792;
const A4_CW = Math.round(A4_W * PX);
const A4_CH = Math.round(A4_H * PX);
const LETTER_CW = Math.round(LETTER_W * PX);
const LETTER_CH = Math.round(LETTER_H * PX);
const DEMO_LABEL = "DEMO — GERÇEK BANKA BELGESİ DEĞİLDİR";
const FONT = 'Arial, "Helvetica Neue", Helvetica, sans-serif';

const nativeToDataURL = HTMLCanvasElement.prototype.toDataURL;

function stampDemoCorner(
  ctx: CanvasRenderingContext2D,
  pageWidth: number,
) {
  ctx.save();

  const fontSize = 7.2;
  ctx.font = `800 ${fontSize}px ${FONT}`;
  const padX = 7;
  const boxH = 18;
  const textW = ctx.measureText(DEMO_LABEL).width;
  const boxW = Math.min(pageWidth - 24, textW + padX * 2);
  const x = pageWidth - boxW - 10;
  const y = 10;

  ctx.fillStyle = "rgba(255,255,255,.96)";
  ctx.strokeStyle = "#b00020";
  ctx.lineWidth = 0.9;
  ctx.fillRect(x, y, boxW, boxH);
  ctx.strokeRect(x, y, boxW, boxH);

  ctx.fillStyle = "#b00020";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${fontSize}px ${FONT}`;
  ctx.fillText(DEMO_LABEL, x + boxW / 2, y + boxH / 2 + 0.3, boxW - padX * 2);

  ctx.restore();
}

HTMLCanvasElement.prototype.toDataURL = function (
  type?: string,
  quality?: any,
) {
  const ctx = this.getContext("2d");

  if (ctx) {
    if (this.width === A4_CW && this.height === A4_CH) {
      stampDemoCorner(ctx, A4_W);
    } else if (this.width === LETTER_CW && this.height === LETTER_CH) {
      stampDemoCorner(ctx, LETTER_W);
    }
  }

  return nativeToDataURL.call(this, type, quality);
};
