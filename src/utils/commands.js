import {
  commandCharacteristic,
  disconnect,
  imageCharacteristic,
} from "./connection.js";
import delayPromise from "./delayPromise.js";
import { hexToBytes, intToHex } from "./conversion.js";
import { getPixelDataFromCanvas } from "./pixels.js";

let imgArray = "";
let uploadPart = 0;
let oldPart = "";
let imagePartSize;

export async function sendImage(ctx) {
  const pixelData = await getPixelDataFromCanvas(ctx);
  imgArray = pixelData.replace(/(?:\r\n|\r|\n|,|0x| )/g, "");
  uploadPart = 0;
  console.log("Sending image...");
  await sendCommand("01");
}

export async function sendCommand(
  command,
  characteristic = commandCharacteristic
) {
  const commandAsBytes = hexToBytes(command);
  console.log("Sending command: " + commandAsBytes);
  if (characteristic) {
    try {
      await characteristic.write(commandAsBytes, false);
    } catch (e) {
      console.log("Error sending command: " + e);
      return Promise.resolve()
        .then(() => delayPromise(500))
        .then(async () => {
          await characteristic.write(commandAsBytes, false);
        });
    }
  }
}

export function handleImageRequest(data) {
  const imagePartMessageSize = new DataView(hexToBytes(data).buffer).getUint16(
    1,
    true
  );

  switch (data.substring(0, 2)) {
    case "01":
      // Read image part message size from response bytes 2 & 3 as uint16le
      // Typically, this will be 0xf400 = 244d
      console.log(
        `Display requested image part message size ${imagePartMessageSize}`
      );

      // Image part size will be four bytes less than the message size
      // to account for the 4 byte uint32le part number starting each message
      imagePartSize = imagePartMessageSize - 4;

      sendCommand("02" + intToHex(imgArray.length / 2) + "000000");
      break;

    case "02":
      console.log("Sending now stage 3");
      sendCommand("03");
      break;

    case "05":
      if (data.substring(2, 4) === "08") {
        console.log("Image upload done, disconnecting now");
        disconnect();
      } else if (data.substring(2, 4) !== "00") {
        console.log("Something wrong in the upload flow, aborting!!!");
      } else {
        console.log("Image portion requested: " + data.substring(4, 12));
        sendImagePortion(data.substring(4, 12));
      }
      break;
  }
}

function sendImagePortion(partAcked) {
  if (imgArray.length > 0) {
    let currentpart = oldPart;
    if (partAcked == intToHex(uploadPart)) {
      currentpart =
        intToHex(uploadPart) + imgArray.substring(0, imagePartSize * 2);
      oldPart = currentpart;
      imgArray = imgArray.substring(imagePartSize * 2);
      console.log("Current part: " + uploadPart);
      uploadPart++;
    } else {
      console.log("Resending last part because of error");
    }
    sendCommand(currentpart, imageCharacteristic);
  } else {
    console.log("Image upload done");
  }
}
