import { loadImage } from "canvas";
import { connectAndSendImage } from "./utils/connection.js";
import { createNewCanvas, addImage } from "./utils/drawing.js";
import { applyDitheringToCanvas } from "./utils/dithering.js";

async function prepareAndSendImage() {
  const ctx = createNewCanvas();
  const image = await loadImage("./images/img.jpg");
  addImage(ctx, image);
  applyDitheringToCanvas(ctx);
  return ctx;
}

(async function () {
  console.log("Initialising...");
  const ctx = await prepareAndSendImage();
  await connectAndSendImage(ctx);
})();
