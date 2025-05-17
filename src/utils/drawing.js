import { createCanvas, loadImage } from "canvas";
import { applyDitheringToCanvas } from "./dithering.js";
import { config } from "../config.js";

export async function decorateCanvas(ctx) {
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
}

export function createNewCanvas() {
  const { width, height } = config;
  const canvas = createCanvas(width, height);
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);
  return ctx;
}

export const addImage = function (ctx, image) {
  if (image) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const imgWidth = image.width;
    const imgHeight = image.height;
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const newWidth = imgWidth * scale;
    const newHeight = imgHeight * scale;
    const offsetX = (canvasWidth - newWidth) / 2;
    const offsetY = (canvasHeight - newHeight) / 2;
    ctx.drawImage(image, offsetX, offsetY, newWidth, newHeight);
  }
};

export const addText = function (ctx, text) {
  if (!text.body) {
    return;
  }
  const { body, color, size, x, y, textAlign, textBaseline } = text;
  ctx.textAlign = textAlign || "center";
  ctx.textBaseline = textBaseline || "middle";
  ctx.fillStyle = color || "black";
  ctx.font = `${size}px Arial`;
  ctx.fillText(body, x, y);
};
