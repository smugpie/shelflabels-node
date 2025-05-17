import { connectAndSendImage } from "./utils/connection.js";
import { createNewCanvas, addText } from "./utils/drawing.js";
import { applyDitheringToCanvas } from "./utils/dithering.js";
import { weatherConfig } from "./config.js";

async function prepareImage() {
  const { lat, lon } = weatherConfig;
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  );
  const weather = await response.json();
  const ctx = createNewCanvas();
  addText(ctx, {
    body: `Weather for ${lat}, ${lon}`,
    size: 20,
    color: "black",
    x: 10,
    y: 20,
    textAlign: "left",
  });
  addText(ctx, {
    body: `${weather.current_weather.temperature}${weather.current_weather_units.temperature}`,
    size: 80,
    color: "red",
    x: 10,
    y: 82,
    textAlign: "left",
  });
  applyDitheringToCanvas(ctx);
  return ctx;
}

(async function () {
  console.log("Initialising...");
  const ctx = await prepareImage();
  await connectAndSendImage(ctx);
})();
