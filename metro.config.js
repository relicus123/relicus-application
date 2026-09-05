const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const path = require("path");

const config = getDefaultConfig(__dirname);

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const createBlockRegex = (folder) => {
  const resolved = path.resolve(__dirname, folder);
  const pattern = "^" + escapeRegExp(resolved).replace(/\\\\/g, "[/\\\\]") + "([/\\\\].*)?$";
  return new RegExp(pattern);
};

config.resolver.blockList = [
  createBlockRegex("relicus-admin"),
  createBlockRegex("graphify-out"),
  createBlockRegex("dist"),
];

module.exports = withNativeWind(config, {
  input: "./global.css",
});
