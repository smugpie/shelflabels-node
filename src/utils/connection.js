import noble from "@abandonware/noble";

import { hexToBytes, bytesToHex } from "./conversion.js";
import { handleImageRequest } from "./commands.js";
import { sendImage } from "./commands.js";
import { getDeviceInfo } from "./deviceInfo.js";

var bleDevice;
export var commandCharacteristic = null;
export var imageCharacteristic = null;

export function handleNotify(data) {
  console.log("Received bytes: " + bytesToHex(data.buffer));
  setTimeout(function () {
    handleImageRequest(bytesToHex(data.buffer));
  }, 50);
}

async function setupCharacteristics(peripheral) {
  const mfrData = hexToBytes(
    peripheral.advertisement.manufacturerData.toString("hex")
  );

  const deviceInfo = getDeviceInfo(mfrData);

  // at the moment this information is only retrieved to
  // display the device info - we could use it to
  // set the config object and alter the canvas size
  // and rotation settings

  console.log(`Voltage: ${deviceInfo.voltage}V`);
  console.log(
    `Screen size: ${deviceInfo.screenSize.width}x${deviceInfo.screenSize.height}`
  );
  console.log(`Colors: ${deviceInfo.colors.join(", ")}`);

  const { characteristics } =
    await peripheral.discoverSomeServicesAndCharacteristicsAsync(
      ["fef0"],
      ["fef2", "fef1"]
    );
  commandCharacteristic = characteristics.find((c) => c.uuid === "fef1");
  imageCharacteristic = characteristics.find((c) => c.uuid === "fef2");
  console.log("Services and characteristics found...");

  await commandCharacteristic.subscribe();
  commandCharacteristic.on("data", handleNotify);
  commandCharacteristic.on("error", (e) => {
    console.log("Error in command characteristic: " + e);
  });
}

export async function disconnect() {
  await commandCharacteristic.unsubscribe();
  await bleDevice.disconnectAsync();
  process.exit(0);
}

export const connectAndSendImage = function (ctx) {
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
        console.log("Found tag...");
        await noble.stopScanningAsync();
        bleDevice = peripheral;
        await peripheral.connectAsync();
        await setupCharacteristics(peripheral);

        // TODO wait for an event to send the image
        // instead of an arbitrary timeout
        setTimeout(() => {
          sendImage(ctx);
        }, 3000);
      }
    } catch (err) {
      console.log("Error:", err);
      await disconnect();
    }
  });
};
