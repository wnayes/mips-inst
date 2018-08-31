const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    libraryTarget: "umd",
    library: "MIPSInst",
    filename: "mipsinst.js",
    path: path.resolve(__dirname, "dist")
  }
};
