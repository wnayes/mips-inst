mips-inst
=========

[![npm version](https://badge.fury.io/js/mips-inst.svg)](https://www.npmjs.com/package/mips-inst)

Convert between text and hex representation of MIPS instructions. Used as the basis for the [mips-assembler](https://github.com/wnayes/mips-assembler) package.

Supports the MIPS IV instruction set.

Usage
=====

```javascript
import { parse } from "mips-inst";

parse("jr ra");
// 0x03E00008

parse(`
  ADDIU SP SP 0xFFE0
  SW RA 0x18(SP)
  LW RA 0x18(SP)
  JR RA
`);
// [0x27BDFFE0, 0xAFBF0018, 0x8FBF0018, 0x03E00008]
```

```javascript
import { print } from "mips-inst";

print(0x03E00008);
// "JR RA"

print([0x27BDFFE0,
  0xAFBF0018,
  0x8FBF0018,
  0x03E00008
]);
// ["ADDIU SP SP -0x20", "SW RA 0x18(SP)", "LW RA 0x18(SP)", "JR RA"]

print(0x27BDFFE0, {
  commas: true,
  include$: true,
  casing: "toLowerCase",
  numBase: 10
});
// "addiu $sp, $sp, -32"

// print also accepts an ArrayBuffer or DataView.
```

The distributed `dist/umd/mipsinst.umd.js` exports a `MIPSInst` global.

Development
===========

To build:
```
npm install
npm run build
```

To run tests:
```
npm test
```

License
=======

MIT
