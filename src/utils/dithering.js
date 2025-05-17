function findNearestColor(r, g, b) {
  if (r > 128 && g < 128 && b < 128) {
    return [255, 0, 0];
  }
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (luminance < 85) {
    return [0, 0, 0];
  }
  return [255, 255, 255];
}

export function applyDitheringToCanvas(ctx) {
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  function clamp(value) {
    return Math.max(0, Math.min(255, value));
  }

  for (let i = 0; i < data.length; i += 4) {
    const oldR = data[i];
    const oldG = data[i + 1];
    const oldB = data[i + 2];
    const [newR, newG, newB] = findNearestColor(oldR, oldG, oldB);
    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;

    const errR = oldR - newR;
    const errG = oldG - newG;
    const errB = oldB - newB;

    function distributeError(index, factor) {
      if (index < 0 || index >= data.length) return;
      data[index] = clamp(data[index] + errR * factor);
      data[index + 1] = clamp(data[index + 1] + errG * factor);
      data[index + 2] = clamp(data[index + 2] + errB * factor);
    }

    if (i + 4 < data.length) {
      distributeError(i + 4, 7 / 16);
    }
    let nextLine = i + 4 * width;
    if (nextLine < data.length) {
      distributeError(nextLine - 4, 3 / 16);
      distributeError(nextLine, 5 / 16);
      if (nextLine + 4 < data.length) {
        distributeError(nextLine + 4, 1 / 16);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
