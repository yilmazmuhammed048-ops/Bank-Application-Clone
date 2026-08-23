export {};

const originalFillText = CanvasRenderingContext2D.prototype.fillText;

const OLD_FIRST =
  "Bu belge uygulama içi demo verilerinden üretilmiş örnek çıktıdır; resmî banka ekstresi değildir.";
const OLD_SECOND =
  "Hesap hareketleri uygulamadaki mevcut hareket listesini baz alır.";

const NEW_FIRST =
  "Taraflar arasında tüm uyuşmazlıklarda, Banka'nın defter kayıtları ve belgeleri,müstenitli olsun olmasın, kesin ve aksi ileri sürülemez delil niteliğindedir.";
const NEW_SECOND =
  "Merkez: Finanskent Mahallesi Finans Caddesi No:44A Ümraniye/İstanbul Ticaret Sicil No:475225-5 www.ziraatbank.com.tr";

const firstLineSeen = new WeakSet<CanvasRenderingContext2D>();

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number,
) {
  if (maxWidth === undefined) {
    return originalFillText.call(context, text, x, y);
  }
  return originalFillText.call(context, text, x, y, maxWidth);
}

CanvasRenderingContext2D.prototype.fillText = function (
  text: string,
  x: number,
  y: number,
  maxWidth?: number,
) {
  if (text === OLD_FIRST) {
    firstLineSeen.add(this);
    return drawText(this, NEW_FIRST, x, y, maxWidth);
  }

  if (text === OLD_SECOND) {
    if (firstLineSeen.has(this)) {
      return drawText(this, NEW_SECOND, x, y, maxWidth);
    }

    drawText(this, NEW_FIRST, x, y - 16, maxWidth);
    return drawText(this, NEW_SECOND, x, y, maxWidth);
  }

  return drawText(this, text, x, y, maxWidth);
} as typeof CanvasRenderingContext2D.prototype.fillText;
