const assert = require("assert");

const print = require("../dist/bundle.js").print;

const testCases = require("./testdata.js").testCases;

describe("print", () => {
  describe("test cases", () => {
    testCases.forEach((arr) => {
      let caseName = "print(0x" + padZero(arr[1].toString(16), 8);
      if (arr[2])
        caseName += `, ${JSON.stringify(arr[2])})`;
      else
        caseName += ")";
      it(caseName, () => {
        assert.equal(print(arr[1], arr[2]), arr[0]);
      });
    });
  });
});

function padZero(value, minLen) {
  while (value.length < minLen) {
    value = "0" + value;
  }
  return value;
}
