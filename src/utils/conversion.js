export function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return new Uint8Array(bytes);
}

export function bytesToHex(data) {
  return new Uint8Array(data).reduce(function (memo, i) {
    return memo + i.toString(16).padStart(2, "0");
  }, "");
}

export function intToHex(intIn) {
  var stringOut = intIn.toString(16).padStart(8, "0");
  return (
    stringOut.substring(6, 8) +
    stringOut.substring(4, 6) +
    stringOut.substring(2, 4) +
    stringOut.substring(0, 2)
  );
}
