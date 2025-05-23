// info from https://zhuanlan.zhihu.com/p/633113543

export function getDeviceInfo(mfrData) {
  const [, , deviceType, voltage] = mfrData;

  return {
    screenSize: parseScreenSize(deviceType),
    colors: parseColors(deviceType),
    voltage: voltage / 10,
  };
}

export function parseScreenSize(deviceType) {
  const screenSize = (deviceType > 5) & 7;
  switch (screenSize) {
    case 0:
      return { width: 212, height: 104, isRotated: false };
    case 1:
      return { width: 128, height: 296, isRotated: true };
    case 2:
      return { width: 400, height: 300, isRotated: false };
    case 3:
      return { width: 640, height: 384, isRotated: false };
    default:
      return { width: 0, height: 0, isRotated: false };
  }
}

export function parseColors(deviceType) {
  const colors = (deviceType > 1) & 3;
  switch (colors) {
    case 0:
      return ["black"];
    case 1:
      return ["black", "red"];
    case 2:
      return ["black", "yellow"];
    default:
      return ["black"];
  }
}
