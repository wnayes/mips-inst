/*global describe, it */

const assert = require("assert");

const parse = require("../dist/umd/mipsinst.umd.js").parse;

const testCases = require("./testdata.js").testCases;

describe("parse", () => {
  describe("test cases", () => {
    testCases.forEach((arr) => {
      let [str, num] = arr;

      const caseName = `parse(${str})`;
      it(caseName, () => {
        assert.equal(parse(str), num);
      });
    });
  });

  describe("value object test cases", () => {
    testCases.forEach((arr) => {
      let [, num, vals] = arr;

      if (!vals || !vals.op)
        return;

      const caseName = `parse(${JSON.stringify(vals)})`;
      it(caseName, () => {
        assert.equal(parse(vals), num);
      });
    });
  });

  describe("opts.intermediate test cases", () => {
    testCases.forEach(arr => {
      let [str, , vals] = arr;

      if (!vals || !vals.op) {
        return;
      }

      let caseName = `parse(${str}), { intermediate: true })`;
      it(caseName, () => {
        assert.deepEqual(parse(str, { intermediate: true }), vals);
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

  describe("BREAK", () => {
    it("preserves error codes with { intermediate: true }", () => {
      assert.equal(parse({ op: "break", uint20: 0x01C00 }), 0x0007000D);
    });
  });

  describe("SYSCALL", () => {
    it("preserves codes with { intermediate: true }", () => {
      assert.equal(parse({ op: "syscall", uint20: 0x17333 }), 0x005CCCCC);
    });
  });

  describe("error cases", () => {
    it("catches bad formats", () => {
      assert.throws(() => {
        parse("ADD.T F26 F26 F0");
      });
    });

    it("ignores valid formats", () => {
      assert.doesNotThrow(() => {
        parse("ADD.s F26 F26 F0");
        parse("ADD.S F26 F26 F0");
      });
    });

    it("restricts the sa to be an immediate", () => {
      assert.throws(() => {
        parse("SLL S0 V0 A0");
      });
    });
  });
});
