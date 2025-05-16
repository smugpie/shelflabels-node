import { buf2hex } from "./conversion";

export function getPixelDataFromCanvas(canvas, options) {
  const { isRotated, hasCompression, hasSecondColor, isMirrored } = options;

  var ctx = canvas.getContext("2d");
  var imageData;

  if (isRotated) {
    var tempCanvas = document.createElement("canvas");
    var tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;

    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate(-Math.PI / 2);
    if (isMirrored) {
      tempCtx.scale(-1, 1);
    }
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  } else {
    if (isMirrored) {
      var tempCanvas = document.createElement("canvas");
      var tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;

      tempCtx.translate(canvas.width, 0);
      tempCtx.scale(-1, 1);
      tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
      imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    } else {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  }

  var pixels = imageData.data;
  var byteData = [];
  var byteDataRed = [];
  var currentByte = 0;
  var currentByteRed = 0;
  var bitPosition = 7;

  for (var i = 0; i < canvas.width; i++) {
    for (var x = 0; x < canvas.height; x++) {
      var curr = (i * canvas.height + x) * 4;
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
        byteData.push(currentByte);
        byteDataRed.push(currentByteRed);
        currentByte = 0;
        currentByteRed = 0;
        bitPosition = 7;
      }
    }
  }

  if (bitPosition !== 7) {
    byteData.push(currentByte);
    byteDataRed.push(currentByteRed);
  }

  var byteDataCompressed = [];

  if (hasCompression) {
    var currentPosi = 0;
    var byte_per_line = canvas.height / 8;
    byteDataCompressed.push(0x00);
    byteDataCompressed.push(0x00);
    byteDataCompressed.push(0x00);
    byteDataCompressed.push(0x00);
    for (var i = 0; i < canvas.width; i += 1) {
      byteDataCompressed.push(0x75);
      byteDataCompressed.push(byte_per_line + 7);
      byteDataCompressed.push(byte_per_line);
      byteDataCompressed.push(0x00);
      byteDataCompressed.push(0x00);
      byteDataCompressed.push(0x00);
      byteDataCompressed.push(0x00);
      for (var b = 0; b < byte_per_line; b++) {
        byteDataCompressed.push(byteData[currentPosi++]);
      }
    }
    if (hasSecondColor) {
      for (var i = 0; i < canvas.width; i += 1) {
        byteDataCompressed.push(0x75);
        byteDataCompressed.push(byte_per_line + 7);
        byteDataCompressed.push(byte_per_line);
        byteDataCompressed.push(0x00);
        byteDataCompressed.push(0x00);
        byteDataCompressed.push(0x00);
        byteDataCompressed.push(0x00);
        for (var b = 0; b < byte_per_line; b++) {
          byteDataCompressed.push(byteData[currentPosi++]);
        }
      }
    }
    byteDataCompressed[0] = byteDataCompressed.length & 0xff;
    byteDataCompressed[1] = (byteDataCompressed.length >> 8) & 0xff;
    byteDataCompressed[2] = (byteDataCompressed.length >> 16) & 0xff;
    byteDataCompressed[3] = (byteDataCompressed.length >> 24) & 0xff;
  } else {
    for (var b = 0; b < byteData.length; b++) {
      byteDataCompressed.push(byteData[b]);
    }
    if (hasSecondColor) {
      byteDataCompressed = [...byteDataCompressed, ...byteDataRed];
    }
  }

  return buf2hex(byteDataCompressed);
}
