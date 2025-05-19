import { createCanvas } from "canvas";
import { config } from "../config.js";

function orientContext(ctx) {
  const { isMirrored, isRotated } = config;

  if (!isRotated && !isMirrored) {
    return ctx;
  }

  const { canvas } = ctx;

  var tempCanvas = createCanvas(
    isRotated ? canvas.height : canvas.width,
    isRotated ? canvas.width : canvas.height
  );
  var tempCtx = tempCanvas.getContext("2d");

  if (isRotated) {
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate(-Math.PI / 2);
    if (isMirrored) {
      tempCtx.scale(-1, 1);
    }
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    return tempCtx;
  }

  if (isMirrored) {
    tempCtx.translate(canvas.width, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    return tempCtx;
  }

  return ctx;
}

export function getColorData(ctx, width, height) {
  const { canvas } = ctx;
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  var byteDataBlack = [];
  var byteDataRed = [];
  var currentByte = 0;
  var currentByteRed = 0;
  var bitPosition = 7;

  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var curr = (x * height + y) * 4;
      var r = pixels[curr];
      var g = pixels[curr + 1];
      var b = pixels[curr + 2];
      var luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (luminance > 128) {
        currentByte |= 1 << bitPosition;
      }
      if (r > 170 && g < 170) {
        currentByteRed |= 1 << bitPosition;
      }
      bitPosition--;
      if (bitPosition < 0) {
        byteDataBlack.push(currentByte);
        byteDataRed.push(currentByteRed);
        currentByte = 0;
        currentByteRed = 0;
        bitPosition = 7;
      }
    }
  }

  if (bitPosition !== 7) {
    byteDataBlack.push(currentByte);
    byteDataRed.push(currentByteRed);
  }

  return {
    byteDataBlack,
    byteDataRed,
  };
}

export function getPixelDataFromCanvas(ctx) {
  const { canvas } = ctx;
  const { hasCompression, hasSecondColor } = config;

  var x;
  var byte;

  const orientedCtx = orientContext(ctx);
  const { byteDataBlack, byteDataRed } = getColorData(
    orientedCtx,
    canvas.width,
    canvas.height
  );

  if (!hasCompression) {
    return hasSecondColor
      ? Buffer.from([...byteDataBlack, ...byteDataRed]).toString("hex")
      : Buffer.from(byteDataBlack).toString("hex");
  }

  var byteDataCompressed = [];

  var currentPos = 0;
  const bytesPerLine = canvas.height / 8;
  byteDataCompressed.push(0x00);
  byteDataCompressed.push(0x00);
  byteDataCompressed.push(0x00);
  byteDataCompressed.push(0x00);
  for (x = 0; x < canvas.width; x += 1) {
    byteDataCompressed.push(0x75);
    byteDataCompressed.push(bytesPerLine + 7);
    byteDataCompressed.push(bytesPerLine);
    byteDataCompressed.push(0x00);
    byteDataCompressed.push(0x00);
    byteDataCompressed.push(0x00);
    byteDataCompressed.push(0x00);
    for (byte = 0; byte < bytesPerLine; byte++) {
      byteDataCompressed.push(byteDataBlack[currentPos++]);
    }
  }

  if (hasSecondColor) {
    for (x = 0; x < canvas.width; x += 1) {
      byteDataCompressed.push(0x75);
      byteDataCompressed.push(bytesPerLine + 7);
      byteDataCompressed.push(bytesPerLine);
      byteDataCompressed.push(0x00);
      byteDataCompressed.push(0x00);
      byteDataCompressed.push(0x00);
      byteDataCompressed.push(0x00);
      for (byte = 0; byte < bytesPerLine; byte++) {
        byteDataCompressed.push(byteDataBlack[currentPos++]);
      }
    }
  }
  byteDataCompressed[0] = byteDataCompressed.length & 0xff;
  byteDataCompressed[1] = (byteDataCompressed.length >> 8) & 0xff;
  byteDataCompressed[2] = (byteDataCompressed.length >> 16) & 0xff;
  byteDataCompressed[3] = (byteDataCompressed.length >> 24) & 0xff;

  return Buffer.from(byteDataCompressed).toString("hex");
}
