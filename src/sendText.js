import { connectAndSendImage } from "./utils/connection.js";
import { createNewCanvas, addText } from "./utils/drawing.js";
import { applyDitheringToCanvas } from "./utils/dithering.js";

function prepareImage() {
  const ctx = createNewCanvas();
  addText(ctx, {
    body: "The quick brown fox",
    size: 20,
    color: "black",
    x: 140,
    y: 20,
  });
  addText(ctx, {
    body: "jumps over",
    size: 36,
    color: "red",
    x: 180,
    y: 56,
  });
  addText(ctx, {
    body: "the lazy dog",
    size: 24,
    color: "black",
    x: 90,
    y: 100,
  });

  applyDitheringToCanvas(ctx);
  return ctx;
}

(async function () {
  console.log("Initialising...");
  const ctx = prepareImage();
  await connectAndSendImage(ctx);
})();
