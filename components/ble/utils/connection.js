import { logs } from "../state/logs.svelte.js";
import { bytesToHex } from "./conversion.js";
import { handleImageRequest } from "./commands.js";

let reconnectAttempts = 0;
let gattServer;
let bleDevice;
let bleService;
export let commandCharacteristic = null;
export let imageCharacteristic = null;

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
  logs.addLog("Disconnected.");
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
    logs.addLog("Was not able to connect, aborting");
    reconnectAttempts = 0;
  }
};

export const reconnect = async function (delay = 1000) {
  disconnectDevice();
  resetVariables();
  logs.addLog("Reconnecting...");
  setTimeout(async function () {
    await connect();
  }, delay);
};

export const connect = async function () {
  if (!commandCharacteristic) {
    logs.addLog("Connecting to: " + bleDevice.name);
    try {
      gattServer = await bleDevice.gatt.connect();
      logs.addLog("Found GATT server");
      bleService = await gattServer.getPrimaryService(0xfef0);
      logs.addLog("Found service");
      imageCharacteristic = await bleService.getCharacteristic(0xfef2);
      logs.addLog("Found image characteristic");
      commandCharacteristic = await bleService.getCharacteristic(0xfef1);
      logs.addLog("Found command characteristic");
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
};

export function handleNotify(event) {
  const data = event.target.value;
  logs.addLog("Got bytes: " + bytesToHex(data.buffer));
  setTimeout(function () {
    handleImageRequest(bytesToHex(data.buffer));
  }, 50);
}
