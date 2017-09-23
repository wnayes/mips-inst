(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["MIPSInst"] = factory();
	else
		root["MIPSInst"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = getOpcodeDetails;
/* harmony export (immutable) */ __webpack_exports__["a"] = findMatch;
const op = "op";
/* unused harmony export op */

const rs = "rs";
/* harmony export (immutable) */ __webpack_exports__["e"] = rs;

const rt = "rt";
/* harmony export (immutable) */ __webpack_exports__["f"] = rt;

const rd = "rd";
/* harmony export (immutable) */ __webpack_exports__["d"] = rd;

const sa = "sa";
/* harmony export (immutable) */ __webpack_exports__["g"] = sa;

const imm = "imm";
/* harmony export (immutable) */ __webpack_exports__["c"] = imm;

const f = "f";
/* unused harmony export f */


function getOpcodeDetails(opcode) {
  return opcodeDetails[opcode.toLowerCase()];
}

// returns name
function findMatch(inst) {
  const op = (inst >>> 26) & 0x2F;

  for (let opName in opcodeDetails) {
    const opDetails = opcodeDetails[opName];
    if ((opDetails.known["op"] || 0) === op) {
      // For R, we must also match the function
      if (opDetails.format === "R") {
        const rs = (inst >>> 21) & 0x1F;
        const rt = (inst >>> 16) & 0x1F;
        const f = inst & 0x2F;

        if ((opDetails.known["f"] || 0) !== f)
          continue;

        const knownRs = opDetails.known["rs"];
        if (knownRs !== undefined && knownRs !== rs)
          continue;

        const knownRt = opDetails.known["rt"];
        if (knownRt !== undefined && knownRt !== rt)
          continue;
      }
      else if (opDetails.format === "I") {
        const rs = (inst >>> 21) & 0x1F;
        const rt = (inst >>> 16) & 0x1F;

        const knownRs = opDetails.known["rs"];
        if (knownRs !== undefined && knownRs !== rs)
          continue;

        const knownRt = opDetails.known["rt"];
        if (knownRt !== undefined && knownRt !== rt)
          continue;
      }

      return opName;
    }
  }
}

const opcodeDetails = {
  add: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100000
    }
  },
  addi: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001000
    }
  },
  addiu: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001001
    },
  },
  addu: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100001
    },
  },
  and: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100100
    },
  },
  andi: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001100
    },
  },
  beq: {
    format: "I",
    display: [rs, rt, imm], // off
    known: {
      [op]: 0b000100
    },
  },
  beql: {
    format: "I",
    display: [rs, rt, imm], // off
    known: {
      [op]: 0b010100
    },
  },
  bgez: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b00001,
    },
  },
  bgezal: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b10001,
    },
  },
  bgezall: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b10011,
    },
  },
  bgezl: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b00011,
    },
  },
  bgtz: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000111,
      [rt]: 0,
    },
  },
  bgtzl: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b010111,
      [rt]: 0,
    },
  },
  blez: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000110,
      [rt]: 0,
    },
  },
  blezl: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b010110,
      [rt]: 0,
    },
  },
  bltz: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0,
    },
  },
  bltzal: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b10000,
    },
  },
  bltzall: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b10010,
    },
  },
  bltzl: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b00010,
    },
  },
  bne: {
    format: "I",
    display: [rs, rt, imm], // off
    known: {
      [op]: 0b000101
    },
  },
  bnel: {
    format: "I",
    display: [rs, rt, imm], // off
    known: {
      [op]: 0b010101
    },
  },
  // break: {
  //   format: "BREAK",
  //   display: [],
  //   known: {
  //     break: 0b001101
  //   },
  // },
  // cop0: {
  //   format: "COP",
  //   display: ["cop"],
  //   known: {
  //     // [op]: 0b0100zz TODO
  //   },
  // },
  dadd: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b101100
    },
  },
  daddi: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b011000
    },
  },
  daddiu: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b011001
    },
  },
  daddu: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b101101
    },
  },
  ddiv: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011110,
      [rd]: 0,
    },
  },
  ddivu: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011111,
      [rd]: 0,
    },
  },
  div: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011010,
      [rd]: 0,
    },
  },
  divu: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011011,
      [rd]: 0,
    },
  },
  dmult: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011100,
      [rd]: 0,
    },
  },
  dmultu: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011101,
      [rd]: 0,
    },
  },
  dsll: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b111000,
      [rs]: 0,
    },
  },
  dsll32: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b111100,
      [rs]: 0,
    },
  },
  dsllv: {
    format: "R",
    display: [rd, rt, rs],
    known: {
      [f]: 0b010100,
    },
  },
  dsra: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b111011,
      [rs]: 0,
    },
  },
  dsra32: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b111111,
      [rs]: 0,
    },
  },
  dsrav: {
    format: "R",
    display: [rd, rt, rs],
    known: {
      [f]: 0b010111,
    },
  },
  dsrl: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b111010,
      [rs]: 0,
    },
  },
  dsrl32: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b111110,
      [rs]: 0,
    },
  },
  dsrlv: {
    format: "R",
    display: [rd, rt, rs],
    known: {
      [f]: 0b010110,
    },
  },
  dsub: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b101110,
    },
  },
  dsubu: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b101111,
    },
  },
  j: {
    format: "J",
    display: [imm],
    known: {
      [op]: 0b000010
    },
  },
  jal: {
    format: "J",
    display: [imm],
    known: {
      [op]: 0b000011
    },
  },
  jalr: {
    format: "R",
    display: ["rd?", rs],
    known: {
      [f]: 0b001001,
      rt: 0,
      rd: 31 // Implied unless specified
    },
  },
  jr: {
    format: "R",
    display: [rs],
    known: {
      [f]: 0b001000,
      rt: 0,
      rd: 0
    },
  },
  lb: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100000
    },
  },
  lbu: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100100
    },
  },
  ld: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b110111
    },
  },
  // ldc1: {
  //   format: "I",
  //   display: [rt, imm, rs], // off
  //   known: {
  //     //[op]: 0b1101zz  TODO
  //   },
  // },
  ldl: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b011010
    },
  },
  ldr: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b011011
    },
  },
  lh: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100001
    },
  },
  lhu: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100101
    },
  },
  ll: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b110000
    },
  },
  lld: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b110100
    },
  },
  lui: {
    format: "I",
    display: [rt, imm],
    known: {
      [op]: 0b001111,
      [rs]: 0,
    },
  },
  lw: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100011
    },
  },
  // lwc1: {
  //   format: "I",
  //   display: [rt, imm, rs], // off
  //   known: {
  //     // [op]: 0b1100zz TODO
  //   },
  // },
  lwl: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100010
    },
  },
  lwr: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100110
    },
  },
  lwu: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100111
    },
  },
  mfhi: {
    format: "R",
    display: [rd],
    known: {
      [f]: 0b010000,
      [rs]: 0,
      [rd]: 0,
    },
  },
  mflo: {
    format: "R",
    display: [rd],
    known: {
      [f]: 0b010010,
      [rs]: 0,
      [rd]: 0,
    },
  },
  movn: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b001011,
    },
  },
  movz: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b001010,
    },
  },
  mthi: {
    format: "R",
    display: [rs],
    known: {
      [f]: 0b010001,
      [rt]: 0,
      [rd]: 0,
    },
  },
  mtlo: {
    format: "R",
    display: [rs],
    known: {
      [f]: 0b010011
    },
  },
  mult: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011000,
      [rd]: 0,
    },
  },
  multu: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011001,
      [rd]: 0,
    },
  },
  // nop: {
  //   format: "R",
  //   display: [],
  //   known: {
  //   },
  // },
  nor: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100111
    },
  },
  or: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100101
    },
  },
  ori: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001101
    },
  },
  pref: {
    format: "I",
    display: [rt, imm, rs], // hint, offset, base
    known: {
      [op]: 0b110011
    },
  },
  sb: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b101000
    },
  },
  sc: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b111000
    },
  },
  scd: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b111100
    },
  },
  sd: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b111111
    },
  },
  // sdc1: {
  //   format: "I",
  //   display: [rt, imm, rs], // off
  //   known: {
  //     //[op]: 0b1111zz TODO
  //   },
  // },
  sdl: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b101100
    },
  },
  sdr: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b101101
    },
  },
  sh: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b101001
    },
  },
  sll: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0
    },
  },
  sllv: {
    format: "R",
    display: [rd, rt, rs],
    known: {
      [f]: 0b000100
    },
  },
  slt: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b101010
    },
  },
  slti: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001010
    },
  },
  sltiu: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001011
    },
  },
  sltu: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b101011
    },
  },
  sra: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b000011
    },
  },
  srav: {
    format: "R",
    display: [rd, rt, rs],
    known: {
      [f]: 0b000111
    },
  },
  srl: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b000010
    },
  },
  srlv: {
    format: "R",
    display: [rd, rt, rs],
    known: {
      [f]: 0b000110
    },
  },
  sub: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100010
    },
  },
  subu: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100011
    },
  },
  sw: {
    format: "I",
    display: [rt, imm, rs],
    known: {
      [op]: 0b101011
    },
  },
  // swc1: {
  //   format: "I",
  //   display: [rt, imm, rs],
  //   known: {
  //     // [op]: 0b1110zz  TODO
  //   },
  // },
  swl: {
    format: "I",
    display: [rt, imm, rs],
    known: {
      [op]: 0b101010
    },
  },
  swr: {
    format: "I",
    display: [rt, imm, rs],
    known: {
      [op]: 0b101110
    },
  },
  sync: {
    format: "R",
    display: [],
    known: {
      [f]: 0b001111,
      [sa]: 0,
      [rs]: 0,
      [rt]: 0,
      [rd]: 0,
    },
  },
  // syscall: {
  //   format: "SYSCALL",
  //   display: [],
  //   known: {
  //     [f]: 0b001100,
  //   },
  // },
  teq: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b110100
    },
  },
  teqi: {
    format: "I",
    display: [rs, imm],
    known: {
      [op]: 0b000001,
      [rt]: 0b01100,
    },
  },
  tge: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b110000,
    },
  },
  tgei: {
    format: "I",
    display: [rs, imm],
    known: {
      [op]: 0b000001,
      [rt]: 0b01000,
    },
  },
  tgeiu: {
    format: "I",
    display: [rs, imm],
    known: {
      [op]: 0b000001,
      [rt]: 0b01001,
    },
  },
  tgeu: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b110001,
    },
  },
  tlt: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b110010,
    },
  },
  tlti: {
    format: "I",
    display: [rs, imm],
    known: {
      [op]: 0b000001,
      [rt]: 0b01010,
    },
  },
  tltiu: {
    format: "I",
    display: [rs, imm],
    known: {
      [op]: 0b000001,
      [rt]: 0b01011,
    },
  },
  tltu: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b110011,
    },
  },
  tne: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b110110,
    },
  },
  tnei: {
    format: "I",
    display: [rs, imm],
    known: {
      [op]: 0b000001,
      [rt]: 0b01110,
    },
  },
  xor: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100110
    },
  },
  xori: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001110
    },
  }
};


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["c"] = parseImmediate;
/* harmony export (immutable) */ __webpack_exports__["a"] = formatImmediate;
/* harmony export (immutable) */ __webpack_exports__["b"] = makeInt16;
function parseImmediate(immArr, maxBits, signed) {
  let [neg, base, num] = immArr;
  base = base.toLowerCase();

  let value;
  if (base === "b")
    value = parseInt(num, 2);
  else if (base === "o")
    value = parseInt(num, 8);
  else if (base === "x")
    value = parseInt(num, 16);
  else
    value = parseInt(num, 10);

  if (maxBits === 16) {
    if (signed) {
      value = makeInt16(value);
    }
  }

  if (neg)
    value = -value;

  return value;
}

function formatImmediate(value, maxBits) {
  if (maxBits === 16) {
    value = (new Uint16Array([value]))[0];
  }

  return value;
}

function makeInt16(value) {
  return (new Int16Array([value]))[0];
}

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = getRegBits;
/* harmony export (immutable) */ __webpack_exports__["b"] = getRegName;
const regs = {
  r0: 0,
  zero: 0,
  at: 1,
  v0: 2,
  v1: 3,
  a0: 4,
  a1: 5,
  a2: 6,
  a3: 7,
  t0: 8,
  t1: 9,
  t2: 10,
  t3: 11,
  t4: 12,
  t5: 13,
  t6: 14,
  t7: 15,
  s0: 16,
  s1: 17,
  s2: 18,
  s3: 19,
  s4: 20,
  s5: 21,
  s6: 22,
  s7: 23,
  t8: 24,
  t9: 25,
  k0: 26,
  k1: 27,
  gp: 28,
  sp: 29,
  fp: 30,
  ra: 31
};

function getRegBits(reg) {
  if (!reg)
    return undefined;
  return regs[reg.toLowerCase()];
}

function getRegName(bits) {
  for (let name in regs) {
    if (regs[name] === bits)
      return name;
  }
  return "";
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = getOpcode;
/* harmony export (immutable) */ __webpack_exports__["c"] = makeRegexForOpcode;
/* harmony export (immutable) */ __webpack_exports__["b"] = isReg;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__opcodes_js__ = __webpack_require__(0);
const opRegex = "([A-Za-z]+)";
const immRegex = "(-)?0?([xbo]?)([A-Fa-f0-9]+)";
const regRegex = "\\$?(\\w+)";
const regIndRegex = immRegex + "\\s*" + "\\(?" + regRegex + "\\)?";

const opcodeRegex = new RegExp("^\\s*" + opRegex);

function getOpcode(str) {
  const match = opcodeRegex.exec(str);
  if (match) {
    return match[1];
  }
  return null;
}



function makeRegexForOpcode(opcodeObj) {
  const display = opcodeObj.display;

  const parts = [opRegex];

  for (let i = 0; i < display.length; i++) {
    const part = display[i];
    const optional = part.endsWith("?");

    let regexPart = "";
    if (optional)
      regexPart += "(?:";

    if (isReg(part)) {
      regexPart += regRegex;
    }
    else if (part === __WEBPACK_IMPORTED_MODULE_0__opcodes_js__["g" /* sa */]) {
      regexPart += immRegex;
    }
    else if (part === __WEBPACK_IMPORTED_MODULE_0__opcodes_js__["c" /* imm */]) {
      if (isReg(display[i + 1])) {
        regexPart += regIndRegex;
        i++;
      }
      else {
        regexPart += immRegex;
      }
    }
    else {
      throw new Error(`Unrecognized display entry ${part}`);
    }

    if (optional)
      regexPart += "[,\\s]+)?";

    parts.push(regexPart);
  }

  let regexStr =
    "^\\s*" +
    parts.reduce((str, next, index) => {
      if (index === parts.length - 1)
        return str + next;

      // If it is an optional group, we already included the whitespace trailing.
      if (!next.startsWith("(?:"))
        return str + next + "[,\\s]+";

      return str + next;
    }, "") +
    "\\s*$";

  return new RegExp(regexStr);
}

function isReg(entry) {
  if (!entry)
    return false;

  switch (entry.substr(0, 2)) {
    case __WEBPACK_IMPORTED_MODULE_0__opcodes_js__["e" /* rs */]:
    case __WEBPACK_IMPORTED_MODULE_0__opcodes_js__["f" /* rt */]:
    case __WEBPACK_IMPORTED_MODULE_0__opcodes_js__["d" /* rd */]:
      return true;
  }
  return false;
}


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__parse__ = __webpack_require__(5);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "parse", function() { return __WEBPACK_IMPORTED_MODULE_0__parse__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__print__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "print", function() { return __WEBPACK_IMPORTED_MODULE_1__print__["a"]; });





/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = parse;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__opcodes__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__immediates__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__regs__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__regex__ = __webpack_require__(3);





function parse(value) {
  if (Array.isArray(value)) {
    return value.map(_parse);
  }
  if (typeof value === "string") {
    const values = value.split(/\r?\n/).filter(v => !!(v.trim()));
    if (values.length === 1)
      return _parse(values[0]);
    else
      return values.map(_parse);
  }

  throw new Error("Unexpected input to parse. Pass a string or array of strings.");
}

function _parse(value) {
  let opcode = __WEBPACK_IMPORTED_MODULE_3__regex__["a" /* getOpcode */](value);
  if (!opcode)
    throw `Could not parse opcode from ${value}`;

  // TODO: Generalize
  const specialCode = parseSpecialOp(opcode);
  if (specialCode !== undefined)
    return specialCode;

  let opcodeObj = __WEBPACK_IMPORTED_MODULE_0__opcodes__["b" /* getOpcodeDetails */](opcode);
  if (!opcodeObj) {
    throw `Opcode ${opcode} was not recognized`;
  }

  let regex = __WEBPACK_IMPORTED_MODULE_3__regex__["c" /* makeRegexForOpcode */](opcodeObj);
  let match = regex.exec(value);
  if (!match)
    throw `Could not parse instruction: ${value}`;

  const opcodeFormat = opcodeObj.format;

  let op, rs, rt, rd, sa, imm, f;
  op = opcodeObj.known["op"] || 0;
  rs = opcodeObj.known["rs"] || 0;
  rt = opcodeObj.known["rt"] || 0;
  rd = opcodeObj.known["rd"] || 0;
  sa = opcodeObj.known["sa"] || 0;
  imm = opcodeObj.known["imm"] || 0;
  f = opcodeObj.known["f"] || 0;

  const display = opcodeObj.display;
  let matchIndex = 2; // Start after opcode
  for (let i = 0; i < display.length; i++, matchIndex++) {
    const parsedVal = match[matchIndex];
    const displayEntry = display[i];
    switch (displayEntry) {
      case "rs":
        rs = __WEBPACK_IMPORTED_MODULE_2__regs__["a" /* getRegBits */](parsedVal);
        if (rs === undefined)
          throw new Error(`Unrecognized rs register ${rs}`);
        break;

      case "rt":
        rt = __WEBPACK_IMPORTED_MODULE_2__regs__["a" /* getRegBits */](parsedVal);
        if (rt === undefined)
          throw new Error(`Unrecognized rt register ${rt}`);
        break;

      case "rd":
      case "rd?": {
        const tryRd = __WEBPACK_IMPORTED_MODULE_2__regs__["a" /* getRegBits */](parsedVal);
        if (tryRd === undefined) {
          if (displayEntry === "rd?")
            break;

          throw new Error(`Unrecognized rd register ${tryRd}`);
        }
        rd = tryRd;
        break;
      }
      case "sa":
      case "imm": {
        let value;
        const immPieces = [match[i + 2], match[i + 3], match[i + 4]];
        if (opcodeFormat === "I" || opcodeFormat === "R") {
          value = __WEBPACK_IMPORTED_MODULE_1__immediates__["c" /* parseImmediate */](immPieces, 16, true);
        }
        else if (opcodeFormat === "J") {
          value = __WEBPACK_IMPORTED_MODULE_1__immediates__["c" /* parseImmediate */](immPieces, 32);
        }
        else {
          throw `Immediate in invalid opcode format ${opcodeFormat}`;
        }

        if (displayEntry === "imm")
          imm = value;
        else if (displayEntry === "sa")
          sa = value;

        matchIndex += 2;
        break;
      }
      default:
        throw `Unrecognized opcode display entry ${displayEntry}`;
    }
  }

  switch (opcodeFormat) {
    case "R":
      return _buildRFormat(op, rs, rt, rd, sa, f);
    case "I":
      return _buildIFormat(op, rs, rt, imm);
    case "J":
      return _buildJFormat(op, imm);
    default:
      throw `Unrecognized opcode format ${opcodeFormat}`;
  }
}

function _buildRFormat(op, rs, rt, rd, sa, f) {
  let asm = (op << 26);
  asm |= (rs << 21);
  asm |= (rt << 16);
  asm |= (rd << 11);
  asm |= (sa << 6);
  asm |= f;
  return asm >>> 0;
}

function _buildIFormat(op, rs, rt, imm) {
  let asm = (op << 26);
  asm |= (rs << 21);
  asm |= (rt << 16);
  asm |= __WEBPACK_IMPORTED_MODULE_1__immediates__["a" /* formatImmediate */](imm, 16);
  return asm >>> 0;
}

function _buildJFormat(op, imm) {
  let asm = (op << 26);
  asm |= makePseudoAddr(imm);
  return asm >>> 0;
}

function makePseudoAddr(addr) {
  return (addr >>> 2) & 0x0FFFFFFF;
}

function parseSpecialOp(opcode) {
  if (opcode.toLowerCase() === "nop")
    return 0;
  if (opcode.toLowerCase() === "break")
    return 0x0000000D;
  if (opcode.toLowerCase() === "syscall")
    return 0x0000000C;
}


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = print;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__opcodes__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__regex__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__regs__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__immediates__ = __webpack_require__(1);





// opts:
//   commas: true to separate values by commas
//   include$: true to prefix registers with dollar sign
//   casing: "toUpperCase" (default), "toLowerCase"
//   numBase: 16 (hex, default), 10 (decimal)
function print(inst, opts) {
  opts = _getFinalOpts(opts);

  if (Array.isArray(inst))
    return inst.map((i) => _print(i, opts));

  if (typeof inst === "number")
    return _print(inst, opts);

  throw new Error("Unexpected input to parse. Pass a number or array of numbers.");
}

function _getFinalOpts(givenOpts) {
  return Object.assign({
    commas: false,
    include$: false,
    casing: "toUpperCase",
    numBase: 16
  }, givenOpts);
}

function _print(inst, opts) {
  if (typeof inst !== "number")
    throw new Error("Unexpected array entry. Pass all numbers.");

  const specialStr = _printSpecialInst(inst, opts);
  if (specialStr)
    return specialStr;

  const opName = __WEBPACK_IMPORTED_MODULE_0__opcodes__["a" /* findMatch */](inst);
  if (!opName)
    throw new Error("Unrecognized instruction");

  const opcodeObj = __WEBPACK_IMPORTED_MODULE_0__opcodes__["b" /* getOpcodeDetails */](opName);
  const opcodeFormat = opcodeObj.format;

  let [rs, rt, rd, sa, imm] = _extractValues(inst, opcodeFormat);

  let result = _formatOpcode(opName, opts);

  function _getRegName(displayEntry) {
    switch (displayEntry) {
      case "rs":
        return __WEBPACK_IMPORTED_MODULE_2__regs__["b" /* getRegName */](rs);
      case "rt":
        return __WEBPACK_IMPORTED_MODULE_2__regs__["b" /* getRegName */](rt);
      case "rd":
      case "rd?":
        return __WEBPACK_IMPORTED_MODULE_2__regs__["b" /* getRegName */](rd);
    }
  }

  const display = opcodeObj.display;
  for (let i = 0; i < display.length; i++) {
    switch (display[i]) {
      case "rs":
      case "rt":
      case "rd":
        result += " " + _formatReg(_getRegName(display[i]), opts);
        break;

      case "rd?":
        if (rd !== opcodeObj.known["rd"])
          result += " " + _formatReg(_getRegName(display[i]), opts);
        break;

      case "sa":
        result += " " + _formatNumber(sa, opts);
        break;

      case "imm":
        if (__WEBPACK_IMPORTED_MODULE_1__regex__["b" /* isReg */](display[i + 1])) {
          result += " " + _formatNumber(imm, opts)
            + "("
            + _formatReg(_getRegName(display[i + 1]), opts)
            + ")";
          i++; // Handled next reg
        }
        else {
          result += " " + _formatNumber(imm, opts);
        }

        break;
    }

    if (opts.commas && (i !== display.length - 1)) {
      result += ",";
    }
  }

  return result.trim();
}

function _extractValues(inst, opcodeFormat) {
  let rs, rt, rd, sa, imm;
  switch (opcodeFormat) {
    case "R":
      [rs, rt, rd, sa] = _extractRFormat(inst);
      break;

    case "I":
      [rs, rt, imm] = _extractIFormat(inst);
      break;

    case "J":
      [imm] = _extractJFormat(inst);
      break;

    default:
      throw `Unrecognized opcode format ${opcodeFormat}`;
  }

  return [rs, rt, rd, sa, imm];
}

function _extractRFormat(inst) {
  return [
    (inst >>> 21) & 0x1F, // rs
    (inst >>> 16) & 0x1F, // rt
    (inst >>> 11) & 0x1F, // rd
    (inst >>> 6) & 0x1F, // sa
  ];
}

function _extractIFormat(inst) {
  return [
    (inst >>> 21) & 0x1F, // rs
    (inst >>> 16) & 0x1F, // rt
    __WEBPACK_IMPORTED_MODULE_3__immediates__["b" /* makeInt16 */](inst & 0xFFFF) // imm
  ];
}

function _extractJFormat(inst) {
  return [
    (inst & 0xFFFF) << 2
  ];
}

function _formatNumber(num, opts) {
  if (!num)
    return num.toString(opts.numBase);

  let value = "";
  if (num < 0)
    value += "-";

  if (opts.numBase === 16)
    value += "0x";
  else if (opts.numBase === 8)
    value += "0o";
  else if (opts.numBase === 2)
    value += "0b";

  value += _applyCasing(Math.abs(num).toString(opts.numBase), opts.casing);
  return value;
}

function _formatReg(regStr, opts) {
  let value = "";
  if (opts.include$)
    value += "$";
  value += _applyCasing(regStr, opts.casing);
  return value;
}

function _formatOpcode(opcodeName, opts) {
  return _applyCasing(opcodeName, opts.casing);
}

function _applyCasing(value, casing) {
  switch (casing) {
    case "toLowerCase":
      return value.toLowerCase();

    case "toUpperCase":
    default:
      return value.toUpperCase();
  }
}

function _printSpecialInst(inst, opts) {
  if (inst === 0)
    return _formatOpcode("NOP", opts);
  if (inst === 0x0000000D)
    return _formatOpcode("BREAK", opts);
  if (inst === 0x0000000C)
    return _formatOpcode("SYSCALL", opts);
}


/***/ })
/******/ ]);
});