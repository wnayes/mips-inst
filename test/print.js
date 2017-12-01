/*global describe, it */

const assert = require("assert");

const print = require("../dist/bundle.js").print;

const testCases = require("./testdata.js").testCases;

describe("print", () => {
  describe("test cases", () => {
    testCases.forEach((arr) => {
      let [str, num, optsOrVals] = arr;

      let opts;
      if (optsOrVals) {
        if (!optsOrVals.op)
          opts = optsOrVals;
      }

      let caseName = "print(0x" + padZero(num.toString(16), 8);

      if (opts)
        caseName = `${caseName}, ${JSON.stringify(opts)})`;
      else
        caseName += ")";
      it(caseName, () => {
        assert.equal(print(num, opts), str);
      });
    });
  });

  describe("values object test cases", () => {
    testCases.forEach((arr) => {
      let [str, , vals] = arr;

      if (!vals || !vals.op) {
        return;
      }

      let caseName = `print(${JSON.stringify(vals)})`;
      it(caseName, () => {
        assert.equal(print(vals), str);
      });
    });
  });

  describe("input types", () => {
    it("array yields array", () => {
      assert.deepEqual(print([
        0x8FBF008C,
        0x8FBE0088,
        0x8FB70084,
      ]), [
        "LW RA 0x8C(SP)",
        "LW FP 0x88(SP)",
        "LW S7 0x84(SP)",
      ]);
    });
  });

  describe("BREAK", () => {
    it("handles error codes", () => {
      assert.equal(print(0x0007000D), "BREAK");
    });
  });

  describe("SYSCALL", () => {
    it("handles codes", () => {
      assert.equal(print(0x005CCCCC), "SYSCALL");
    });
  });

  describe("extra codes", () => {
    it("TLTU", () => {
      assert.equal(print(0x01110333), "TLTU T0 S1");
    });

    it("TGE", () => {
      assert.equal(print(0x00F00030), "TGE A3 S0");
    });
  });
});

function padZero(value, minLen) {
  while (value.length < minLen) {
    value = "0" + value;
  }
  return value;
}
