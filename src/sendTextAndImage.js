import { loadImage } from "canvas";
import { connectAndSendImage } from "./utils/connection.js";
import { createNewCanvas, addImage, addText } from "./utils/drawing.js";
import { applyDitheringToCanvas } from "./utils/dithering.js";

async function prepareAndSendImage() {
  const ctx = createNewCanvas();
  const text = {
    body: "hello",
    size: 20,
    color: "black",
    x: 40,
    y: 110,
  };
  const image = await loadImage("./images/img.jpg");
  addImage(ctx, image);
  addText(ctx, text);
  applyDitheringToCanvas(ctx);
  return ctx;
}

(async function () {
  console.log("Initialising...");
  const ctx = await prepareAndSendImage();
  await connectAndSendImage(ctx);
})();
