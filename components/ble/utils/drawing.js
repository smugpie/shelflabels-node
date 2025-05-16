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
  if (!text) {
    return;
  }
  const { body, color, size, x, y } = text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.font = `${size}px LlawenVF`;
  ctx.fillText(body, x, y);
};
