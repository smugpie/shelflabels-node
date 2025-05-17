import { bytesToHex } from "./conversion.js";
import { handleImageRequest } from "./commands.js";
import { createNewCanvas, decorateCanvas } from "./drawing.js";
import { getPixelDataFromCanvas } from "./pixels.js";
import { sendImage } from "./commands.js";

import noble from "@abandonware/noble";

var bleDevice;
export var commandCharacteristic = null;
export var imageCharacteristic = null;

export function handleNotify(data) {
  console.log("Got bytes: " + bytesToHex(data.buffer));
  setTimeout(function () {
    handleImageRequest(bytesToHex(data.buffer));
  }, 50);
}

export async function disconnect() {
  await commandCharacteristic.unsubscribe();
  await bleDevice.disconnectAsync();
  process.exit(0);
}

export const connect = function () {
  noble.on("stateChange", async (state) => {
    if (state === "poweredOn") {
      console.log("BLE powered on, starting scan...");
      await noble.startScanningAsync(["fef0"], false);
    }
  });

  noble.on("discover", async (peripheral) => {
    try {
      console.log(
        `Discovered peripheral: ${peripheral.address} (${peripheral.advertisement.localName})`
      );

      if (
        process.env.DEVICE_NAME &&
        process.env.DEVICE_NAME === peripheral.advertisement.localName
      ) {
        console.log("Found tag, stopping scan...");
        await noble.stopScanningAsync();
        bleDevice = peripheral;
        await peripheral.connectAsync();
        const { characteristics } =
          await peripheral.discoverSomeServicesAndCharacteristicsAsync(
            ["fef0"],
            ["fef2", "fef1"]
          );
        console.log("Servicea and characteristics found");
        commandCharacteristic = characteristics[0];
        commandCharacteristic.subscribe();
        commandCharacteristic.on("data", handleNotify);
        commandCharacteristic.on("error", (err) => {
          console.log("Error in command characteristic:", err);
        });
        imageCharacteristic = characteristics[1];

        const ctx = createNewCanvas();
        await decorateCanvas(ctx);
        const pixelData = getPixelDataFromCanvas(ctx);
        await sendImage(pixelData);
      }
    } catch (err) {
      console.log("Error:", err);
      await peripheral.disconnectAsync();
      process.exit(0);
    }
  });
};
