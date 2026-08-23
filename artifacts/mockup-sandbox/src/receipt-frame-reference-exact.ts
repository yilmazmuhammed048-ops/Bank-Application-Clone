export {};

type FrameKind = "outer" | "left" | "right";

const activeFrame = new WeakMap<CanvasRenderingContext2D, FrameKind>();

function isReceiptCanvas(context: CanvasRenderingContext2D) {
  return context.canvas?.width === 1240 && context.canvas?.height === 1754;
}

const previousMoveTo = CanvasRenderingContext2D.prototype.moveTo;
CanvasRenderingContext2D.prototype.moveTo = function receiptReferenceMoveTo(
  x: number,
  y: number,
) {
  if (isReceiptCanvas(this)) {
    if (x === 72 && y === 122) {
      activeFrame.set(this, "outer");
      x = 55; // outer frame x=45, radius=10
    } else if (x === 87 && y === 145) {
      activeFrame.set(this, "left");
      x = 73; // left frame x=64, radius=9
    } else if (x === 655 && y === 145) {
      activeFrame.set(this, "right");
      x = 679; // right frame x=670, radius=9
    }
  }

  return previousMoveTo.call(this, x, y);
};

const previousArcTo = CanvasRenderingContext2D.prototype.arcTo;
CanvasRenderingContext2D.prototype.arcTo = function receiptReferenceArcTo(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
) {
  if (isReceiptCanvas(this)) {
    const frame = activeFrame.get(this);

    if (frame === "outer") {
      if (x1 === 62) x1 = 45;
      if (x2 === 62) x2 = 45;
      if (x1 === 1124) x1 = 1181;
      if (x2 === 1124) x2 = 1181;
    } else if (frame === "left") {
      if (x1 === 78) x1 = 64;
      if (x2 === 78) x2 = 64;
      if (x1 === 624) x1 = 649;
      if (x2 === 624) x2 = 649;
      if (y1 === 390) y1 = 379;
      if (y2 === 390) y2 = 379;
    } else if (frame === "right") {
      if (x1 === 646) x1 = 670;
      if (x2 === 646) x2 = 670;
      if (x1 === 1108) x1 = 1166;
      if (x2 === 1108) x2 = 1166;
      if (y1 === 390) y1 = 379;
      if (y2 === 390) y2 = 379;
    }
  }

  return previousArcTo.call(this, x1, y1, x2, y2, radius);
};

const previousClosePath = CanvasRenderingContext2D.prototype.closePath;
CanvasRenderingContext2D.prototype.closePath = function receiptReferenceClosePath() {
  const result = previousClosePath.call(this);
  activeFrame.delete(this);
  return result;
};

const previousFillText = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function receiptReferenceFillText(
  text: string,
  x: number,
  y: number,
  maxWidth?: number,
) {
  if (isReceiptCanvas(this)) {
    if (y >= 160 && y <= 350) {
      if (x === 95) {
        x = 81;
        this.font = '700 14px Arial, Helvetica, sans-serif';
      } else if (x === 275) {
        x = 279;
        this.font = '500 13.6px Arial, Helvetica, sans-serif';
      } else if (x === 292) {
        x = 296;
        this.font = '500 13.4px Arial, Helvetica, sans-serif';
      } else if (x === 665) {
        x = 685;
        if (y === 170) this.font = '700 14px Arial, Helvetica, sans-serif';
        else if (y === 195) this.font = '700 14.4px Arial, Helvetica, sans-serif';
        else this.font = '700 13.9px Arial, Helvetica, sans-serif';
        if (y === 252 && typeof maxWidth === "number") maxWidth = 455;
      }
    }

    if (x === 106 && y >= 414 && y <= 558) {
      x = 91;
      this.font = '500 15.6px Arial, Helvetica, sans-serif';
      y = 414 + Math.round((y - 414) / 24) * 20;
    } else if (x === 106 && y === 588) {
      x = 91;
      y = 566;
      this.font = '500 14.8px Arial, Helvetica, sans-serif';
    }
  }

  if (typeof maxWidth === "number") {
    return previousFillText.call(this, text, x, y, maxWidth);
  }
  return previousFillText.call(this, text, x, y);
};
