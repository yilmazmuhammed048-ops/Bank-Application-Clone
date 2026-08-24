export {};

const BASE_WIDTH = 2550;
const BASE_HEIGHT = 3300;
const SCALE = 4 / 3;
const HIRES_WIDTH = Math.round(BASE_WIDTH * SCALE);
const HIRES_HEIGHT = Math.round(BASE_HEIGHT * SCALE);
const CANVAS_MARK = "__receiptPdfHiResCanvas";
const CONTEXT_MARK = "__receiptPdfHiResContext";

type MarkedCanvas = HTMLCanvasElement & Record<string, unknown>;
type MarkedContext = CanvasRenderingContext2D & Record<string, unknown>;

const widthDescriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, "width");
const heightDescriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, "height");
const nativeGetContext = HTMLCanvasElement.prototype.getContext;
const nativeCreateElement = Document.prototype.createElement;

if (
  widthDescriptor?.get && widthDescriptor?.set &&
  heightDescriptor?.get && heightDescriptor?.set
) {
  (Document.prototype.createElement as unknown as (...args: any[]) => any) = function (
    tagName: string,
    options?: ElementCreationOptions,
  ) {
    const element = nativeCreateElement.call(this, tagName, options);
    if (String(tagName).toLowerCase() !== "canvas" || !(element instanceof HTMLCanvasElement)) {
      return element;
    }

    const canvas = element as MarkedCanvas;

    Object.defineProperty(canvas, "width", {
      configurable: true,
      enumerable: true,
      get() {
        return widthDescriptor.get!.call(canvas);
      },
      set(value: number) {
        const numeric = Number(value);
        if (numeric === BASE_WIDTH) {
          canvas[CANVAS_MARK] = true;
          widthDescriptor.set!.call(canvas, HIRES_WIDTH);
          return;
        }
        widthDescriptor.set!.call(canvas, numeric);
      },
    });

    Object.defineProperty(canvas, "height", {
      configurable: true,
      enumerable: true,
      get() {
        return heightDescriptor.get!.call(canvas);
      },
      set(value: number) {
        const numeric = Number(value);
        if (canvas[CANVAS_MARK] && numeric === BASE_HEIGHT) {
          heightDescriptor.set!.call(canvas, HIRES_HEIGHT);
          return;
        }
        heightDescriptor.set!.call(canvas, numeric);
      },
    });

    return canvas;
  } as typeof Document.prototype.createElement;

  (HTMLCanvasElement.prototype.getContext as unknown as (...args: any[]) => any) = function (
    contextId: string,
    options?: any,
  ) {
    const context = (nativeGetContext as any).call(this, contextId, options);
    const canvas = this as MarkedCanvas;

    if (
      contextId === "2d" &&
      context &&
      canvas[CANVAS_MARK] &&
      canvas.width === HIRES_WIDTH &&
      canvas.height === HIRES_HEIGHT
    ) {
      const marked = context as MarkedContext;
      if (!marked[CONTEXT_MARK]) {
        marked[CONTEXT_MARK] = true;
        context.scale(SCALE, SCALE);
      }
    }

    return context;
  } as typeof HTMLCanvasElement.prototype.getContext;
}
