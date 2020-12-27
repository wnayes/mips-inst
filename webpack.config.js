const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    libraryTarget: "umd",
    library: "MIPSInst",
    filename: "mipsinst.umd.js",
    path: path.resolve(__dirname, "dist", "umd"),
    globalObject: "typeof self !== 'undefined' ? self : this"
  }
};
