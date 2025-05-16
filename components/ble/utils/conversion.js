export function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return new Uint8Array(bytes);
}

export function bytesToHex(data) {
  return new Uint8Array(data).reduce(function (memo, i) {
    return memo + ("0" + i.toString(16)).slice(-2);
  }, "");
}

export function intToHex(intIn) {
  var stringOut = "";
  stringOut = ("00000000" + intIn.toString(16)).substr(-8);
  return (
    stringOut.substring(6, 8) +
    stringOut.substring(4, 6) +
    stringOut.substring(2, 4) +
    stringOut.substring(0, 2)
  );
}

export function buf2hex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
