const noble = require("@abandonware/noble");

console.log("Initialising...");

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
      console.log(
        peripheral,
        peripheral.advertisement.manufacturerData.toString("utf-8")
      );
      console.log("Found tag, stopping scan...");
      await noble.stopScanningAsync();
      await peripheral.connectAsync();
      const { services, characteristics } =
        await peripheral.discoverAllServicesAndCharacteristicsAsync();
      //const characteristics = await peripheral.discoverCharacteristicsAsync();
      console.log(services, characteristics);
      const characteristic0 = await characteristics[0].readAsync();
      const characteristic1 = await characteristics[1].readAsync();
      const characteristic2 = await characteristics[2].readAsync();
      const characteristic3 = await characteristics[3].readAsync();

      console.log("Characteristic 0:", characteristic0);
      console.log("Characteristic 1:", characteristic1);
      console.log("Characteristic 2:", characteristic2.toString("utf8"));
      console.log("Characteristic 3:", characteristic3);

      console.log(
        `${peripheral.address} (${peripheral.advertisement.localName})`
      );

      await peripheral.disconnectAsync();
      process.exit(0);
    }
  } catch (err) {
    console.log("Error:", err);
    await peripheral.disconnectAsync();
    process.exit(0);
  }
});
