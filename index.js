import fs from 'fs';
import { connect } from './utils/connection.js';
import { createCanvas, loadImage } from 'canvas';
import { addImage, addText } from './utils/drawing.js';
import { applyDitheringToCanvas } from './utils/dithering.js';


  async function decorateCanvas(ctx) {
   const text = {
    body: "hello",
    size: 20,
    color: "black",
    x: 100,
    y: 100
   };
   const image = await loadImage('./images/img.jpg')
    addImage(ctx, image);
    addText(ctx, text);
      applyDitheringToCanvas(ctx);
  };

  function createNewCanvas() {
    const width = 296;
    const height = 128;
    const canvas = createCanvas(width, height);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width,  height);
    return ctx;
  }


(async function () {
console.log("Preparing image...");
  const ctx = createNewCanvas();
  await decorateCanvas(ctx)
console.log("Initialising...");
  await connect();

  const buffer = ctx.canvas.toBuffer("image/png");
  fs.writeFileSync("./image.png", buffer);
})()

