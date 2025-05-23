// Update these values to match your ESL specifications

export const config = {
  width: 296,
  height: 128,
  isRotated: true,
  hasCompression: false,
  hasSecondColor: true,
  isMirrored: false,
};

export const weatherConfig = {
  lat: 54.5234,
  lon: -6.0353,
};

export function updateConfig(deviceInfo) {
  const { screenSize, colors } = deviceInfo;
  config.width = screenSize.width;
  config.height = screenSize.height;
  config.isRotated = screenSize.isRotated;
  config.hasSecondColor = colors.length > 1;
}
