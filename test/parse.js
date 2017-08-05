const assert = require("assert");

const parse = require("../dist/bundle.js").parse;

const testCases = require("./testdata.js").testCases;

describe("parse", () => {
  describe("test cases", () => {
    testCases.forEach((arr) => {
      it(arr[0], () => {
        assert.equal(parse(arr[0]), arr[1]);
      });
    });
  });

  describe("edge cases", () => {
    it("removes extra precision on jumps", () => {
      assert.equal(parse("JAL 0x0001F121"), 0x0C007C48);
      assert.equal(parse("JAL 0x0001F122"), 0x0C007C48);
      assert.equal(parse("JAL 0x0001F123"), 0x0C007C48);
      assert.equal(parse("J 0x0001F121"), 0x08007C48);
      assert.equal(parse("J 0x0001F122"), 0x08007C48);
      assert.equal(parse("J 0x0001F123"), 0x08007C48);
    });

    it("handles default registers being present", () => {
      assert.equal(parse("JALR RA V0"), 0x0040F809);
    });
  });

  describe("input types", () => {
    it("array yields array", () => {
      assert.deepEqual(parse([
        "LW RA 0x8C(SP)",
        "LW FP 0x88(SP)",
        "LW S7 0x84(SP)",
      ]), [
        0x8FBF008C,
        0x8FBE0088,
        0x8FB70084,
      ]);
    });

    it("multiline string yields array", () => {
      assert.deepEqual(parse(`
        ADDIU SP SP 0xFFE0
        SW RA 0x18(SP)
        LW RA 0x18(SP)
        JR RA
      `), [0x27BDFFE0,
        0xAFBF0018,
        0x8FBF0018,
        0x03E00008
      ]);
    });
  });
});
