var path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    libraryTarget: "umd",
    library: "MIPSInst",
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
