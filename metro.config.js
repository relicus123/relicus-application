const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /relicus-admin\/.*/,
  /graphify-out\/.*/,
  /dist\/.*/,
];

module.exports = withNativeWind(config, {
  input: "./global.css",
});
