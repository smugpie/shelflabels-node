import { bytesToHex } from "./conversion.js";
import { handleImageRequest } from "./commands.js";

import noble from "@abandonware/noble";

var reconnectAttempts = 0;
var gattServer;
var bleDevice;
var bleService;
export var commandCharacteristic = null;
export var imageCharacteristic = null;

const resetVariables = function () {
  if (bleDevice) {
    bleDevice.removeEventListener("gattserverdisconnected", disconnect);
  }
  gattServer = null;
  bleService = null;
  commandCharacteristic = null;
  imageCharacteristic = null;
};

export function disconnect() {
  resetVariables();
  console.log("Disconnected.");
  dispatchEvent(new CustomEvent("bleDisconnected"));
}

const requestDevice = async function () {
  if (!bleDevice) {
    bleDevice = await navigator.bluetooth.requestDevice({
      optionalServices: [0xfef0],
      acceptAllDevices: true,
    });
    bleDevice.addEventListener("gattserverdisconnected", disconnect);
  }
};

const disconnectDevice = async function () {
  if (gattServer && gattServer.connected) {
    if (bleDevice && bleDevice.gatt.connected) bleDevice.gatt.disconnect();
  }
};

export const requestDeviceAndConnect = async function () {
  disconnectDevice();
  resetVariables();
  try {
    await requestDevice();
    await connect();
  } catch (err) {
    handleError(err);
  }
};

const handleError = function (error) {
  console.log(error);
  resetVariables();
  if (!bleDevice) {
    return;
  }
  if (reconnectAttempts <= 5) {
    reconnectAttempts++;
    connect();
  } else {
    console.log("Was not able to connect, aborting");
    reconnectAttempts = 0;
  }
};

export const reconnect = async function (delay = 1000) {
  disconnectDevice();
  resetVariables();
  console.log("Reconnecting...");
  setTimeout(async function () {
    await connect();
  }, delay);
};

/*
export const connect = async function () {
  if (!commandCharacteristic) {
    console.log("Connecting to: " + bleDevice.name);
    try {
      gattServer = await bleDevice.gatt.connect();
      console.log("Found GATT server");
      bleService = await gattServer.getPrimaryService(0xfef0);
      console.log("Found service");
      imageCharacteristic = await bleService.getCharacteristic(0xfef2);
      console.log("Found image characteristic");
      commandCharacteristic = await bleService.getCharacteristic(0xfef1);
      console.log("Found command characteristic");
      dispatchEvent(new CustomEvent("bleConnected"));
      await commandCharacteristic.startNotifications();
      commandCharacteristic.addEventListener(
        "characteristicvaluechanged",
        handleNotify,
      );
    } catch (err) {
      handleError(err);
    }
  }
}; */

export function handleNotify(event) {
  const data = event.target.value;
  console.log("Got bytes: " + bytesToHex(data.buffer));
  setTimeout(function () {
    handleImageRequest(bytesToHex(data.buffer));
  }, 50);
}

export const connect = function() {
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

      if (["PICKSMART"].includes(peripheral.advertisement.localName)) {
        console.log("Found tag, stopping scan...");
        await noble.stopScanningAsync();
        await peripheral.connectAsync();
        const {services, characteristics} = await peripheral.discoverSomeServicesAndCharacteristicsAsync(['fef0'],['fef2','fef1'])
        console.log("Service found", services, characteristics)
        bleService = services[0]
        commandCharacteristic = characteristics[0]
        imageCharacteristic = characteristics[1]
      }
    } catch (err) {
      console.log("Error:", err);
      await peripheral.disconnectAsync();
      process.exit(0);
    }
  });
}


