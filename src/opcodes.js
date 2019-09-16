import { getFmtBits, getFmt3Bits } from "./regs";
import { isBinaryLiteral, compareBits, padBitString } from "./bitstrings";
import { getImmFormatDetails } from "./immediates";

const rs = "rs";
const rt = "rt";
const rd = "rd";
const fs = "fs";
const ft = "ft";
const fd = "fd";
const fr = "fr";
const sa = "uint5";
const uint5 = "uint5";
const uint10 = "uint10";
const int16 = "int16";
const uint16 = "uint16";
const uint20 = "uint20";
const uint26 = "uint26";
const uint26shift2 = "uint26shift2";
const cc = "cc";
const cond = "cond";
const fmt = "fmt";
const fmt3 = "fmt3";

export function getOpcodeDetails(opcode) {
  return opcodeDetails[opcode.toLowerCase()];
}

const _valueBitLengths = new Map();

export function getValueBitLength(str) {
  if (_valueBitLengths.has(str)) {
    return _valueBitLengths.get(str);
  }

  const calculated = computeValueBitLength(str);
  _valueBitLengths.set(str, calculated);
  return calculated;
}

function computeValueBitLength(str) {
  if (isBinaryLiteral(str))
    return str.length;

  str = str.replace("?", "");
  switch (str) {
    case "cc":
    case "fmt3":
      return 3;

    case "cond":
      return 4;

    case "rs":
    case "rt":
    case "rd":
    case "fs":
    case "ft":
    case "fd":
    case "fr":
    case "sa":
    case "fmt":
      return 5;
  }

  const immDetails = getImmFormatDetails(str);
  if (immDetails) {
    return immDetails.bits;
  }

  throw new Error(`Unrecongized format value: ${str}`);
}

// returns name
export function findMatch(inst) {
  let bestMatch = "";
  let bestMatchScore = 0;
  for (let opName in opcodeDetails) {
    const format = opcodeDetails[opName].format;
    const fmts = opcodeDetails[opName].fmts;
    const score = formatMatches(inst, format, fmts);
    if (score > bestMatchScore) {
      bestMatch = opName;
      bestMatchScore = score;
    }
  }

  return bestMatch;
}

// Returns number of literal bits matched, if the overall format matches.
function formatMatches(number, format, fmts) {
  let score = 0;
  let tempScore;
  let bitOffset = 0;
  for (let i = format.length - 1; i >= 0; i--) {
    let bitLength;
    let piece = format[i];
    if (Array.isArray(piece)) {
      let matchedOne = false;
      for (let j = 0; j < piece.length; j++) {
        tempScore = checkPiece(piece[j], number, bitOffset, fmts);
        if (tempScore >= 0) {
          matchedOne = true;
          score += tempScore;
          bitLength = getValueBitLength(piece[j]);
          break; // j
        }
      }
      if (!matchedOne)
        return 0;
    }
    else {
      tempScore = checkPiece(piece, number, bitOffset, fmts);
      if (tempScore >= 0) {
        score += tempScore;
        bitLength = getValueBitLength(piece);
      }
      else {
        return 0;
      }
    }

    bitOffset += bitLength;
  }

  return score;
}

function checkPiece(piece, number, bitOffset, fmts) {
  if (!isBinaryLiteral(piece)) {
    if (piece === fmt) {
      for (let i = 0; i < fmts.length; i++) {
        let fmtBitString = padBitString(getFmtBits(fmts[i]).toString(2), 5);
        if (compareBits(number, fmtBitString, bitOffset))
          return fmtBitString.length;
      }
      return -1;
    }

    if (piece === fmt3) {
      for (let i = 0; i < fmts.length; i++) {
        let fmtBitString = padBitString(getFmt3Bits(fmts[i]).toString(2), 3);
        if (compareBits(number, fmtBitString, bitOffset))
          return fmtBitString.length;
      }
      return -1;
    }

    return 0; // non-literal contributes nothing
  }

  if (compareBits(number, piece, bitOffset))
    return piece.length;

  return -1;
}

const opcodeDetails = {
  "abs.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "000101"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  add: {
    format: ["000000", rs, rt, rd, "00000100000"],
    display: [rd, rs, rt],
  },
  "add.fmt": {
    format: ["010001", fmt, ft, fs, fd, "000000"],
    fmts: ["S", "D"],
    display: [fd, fs, ft],
  },
  addi: {
    format: ["001000", rs, rt, int16],
    display: [rt, rs, int16],
  },
  addiu: {
    format: ["001001", rs, rt, uint16],
    display: [rt, rs, uint16],
  },
  addu: {
    format: ["000000", rs, rt, rd, "00000100001"],
    display: [rd, rs, rt],
  },
  and: {
    format: ["000000", rs, rt, rd, "00000100100"],
    display: [rd, rs, rt],
  },
  andi: {
    format: ["001100", rs, rt, uint16],
    display: [rt, rs, uint16],
  },
  bc1f: {
    format: ["010001", "01000", [cc, "000"], "00", int16], // TODO shifting?
    display: ["cc?", int16], // offset
  },
  bc1fl: {
    format: ["010001", "01000", [cc, "000"], "10", int16],
    display: ["cc?", int16], // offset
  },
  bc1t: {
    format: ["010001", "01000", [cc, "000"], "01", int16],
    display: ["cc?", int16], // offset
  },
  bc1tl: {
    format: ["010001", "01000", [cc, "000"], "11", int16],
    display: ["cc?", int16], // offset
  },
  beq: {
    format: ["000100", rs, rt, uint16],
    display: [rs, rt, uint16], // offset
  },
  beql: {
    format: ["010100", rs, rt, uint16],
    display: [rs, rt, uint16], // offset
  },
  bgez: {
    format: ["000001", rs, "00001", uint16],
    display: [rs, uint16], // offset
  },
  bgezal: {
    format: ["000001", rs, "10001", uint16],
    display: [rs, uint16], // offset
  },
  bgezall: {
    format: ["000001", rs, "10011", uint16],
    display: [rs, uint16], // offset
  },
  bgezl: {
    format: ["000001", rs, "00011", uint16],
    display: [rs, uint16], // offset
  },
  bgtz: {
    format: ["000111", rs, "00000", uint16],
    display: [rs, uint16], // offset
  },
  bgtzl: {
    format: ["010111", rs, "00000", uint16],
    display: [rs, uint16], // offset
  },
  blez: {
    format: ["000110", rs, "00000", uint16],
    display: [rs, uint16], // offset
  },
  blezl: {
    format: ["010110", rs, "00000", uint16],
    display: [rs, uint16], // offset
  },
  bltz: {
    format: ["000001", rs, "00000", uint16],
    display: [rs, uint16], // offset
  },
  bltzal: {
    format: ["000001", rs, "10000", uint16],
    display: [rs, uint16], // offset
  },
  bltzall: {
    format: ["000001", rs, "10010", uint16],
    display: [rs, uint16], // offset
  },
  bltzl: {
    format: ["000001", rs, "00010", uint16],
    display: [rs, uint16], // offset
  },
  bne: {
    format: ["000101", rs, rt, uint16],
    display: [rs, rt, uint16], // offset
  },
  bnel: {
    format: ["010101", rs, rt, uint16],
    display: [rs, rt, uint16], // offset
  },
  break: {
    format: ["000000", [uint20, "00000000000000000000"], "001101"],
    display: ["uint20?"],
  },
  "c.cond.fmt": {
    format: ["010001", fmt, ft, fs, [cc, "000"], "00", "11", cond],
    fmts: ["S", "D"],
    display: ["cc?", fs, ft],
  },
  "ceil.l.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001010"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "ceil.w.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001110"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  cfc1: {
    format: ["010001", "00010", rt, fs, "00000000000"],
    display: [rt, fs],
  },
  ctc1: {
    format: ["010001", "00110", rt, fs, "00000000000"],
    display: [rt, fs],
  },
  cop0: {
    format: ["010000", uint26],
    display: [uint26], // cop_fun
  },
  cop1: {
    format: ["010001", uint26],
    display: [uint26], // cop_fun
  },
  cop2: {
    format: ["010010", uint26],
    display: [uint26], // cop_fun
  },
  cop3: {
    format: ["010011", uint26],
    display: [uint26], // cop_fun
  },
  "cvt.d.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "100001"],
    fmts: ["S", "W", "L"],
    display: [fd, fs],
  },
  "cvt.l.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "100101"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "cvt.s.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "100000"],
    fmts: ["D", "W", "L"],
    display: [fd, fs],
  },
  "cvt.w.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "100100"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  dadd: {
    format: ["000000", rs, rt, rd, "00000101100"],
    display: [rd, rs, rt],
  },
  daddi: {
    format: ["011000", rs, rt, int16],
    display: [rt, rs, int16],
  },
  daddiu: {
    format: ["011001", rs, rt, uint16],
    display: [rt, rs, uint16],
  },
  daddu: {
    format: ["000000", rs, rt, rd, "00000101101"],
    display: [rd, rs, rt],
  },
  ddiv: {
    format: ["000000", rs, rt, "0000000000011110"],
    display: [rs, rt],
  },
  ddivu: {
    format: ["000000", rs, rt, "0000000000011111"],
    display: [rs, rt],
  },
  div: {
    format: ["000000", rs, rt, "0000000000011010"],
    display: [rs, rt],
  },
  "div.fmt": {
    format: ["010001", fmt, ft, fs, fd, "000011"],
    fmts: ["S", "D"],
    display: [fd, fs, ft],
  },
  divu: {
    format: ["000000", rs, rt, "0000000000011011"],
    display: [rs, rt],
  },
  dmfc1: {
    format: ["010001", "00001", rt, fs, "00000000000"],
    display: [rt, fs],
  },
  dmult: {
    format: ["000000", rs, rt, "0000000000011100"],
    display: [rs, rt],
  },
  dmultu: {
    format: ["000000", rs, rt, "0000000000011101"],
    display: [rs, rt],
  },
  dmtc1: {
    format: ["010001", "00101", rt, fs, "00000000000"],
    display: [rt, fs],
  },
  dsll: {
    format: ["00000000000", rt, rd, sa, "111000"],
    display: [rd, rt, sa],
  },
  dsll32: {
    format: ["00000000000", rt, rd, sa, "111100"],
    display: [rd, rt, sa],
  },
  dsllv: {
    format: ["000000", rs, rt, rd, "00000010100"],
    display: [rd, rt, rs],
  },
  dsra: {
    format: ["00000000000", rt, rd, sa, "111011"],
    display: [rd, rt, sa],
  },
  dsra32: {
    format: ["00000000000", rt, rd, sa, "111111"],
    display: [rd, rt, sa],
  },
  dsrav: {
    format: ["000000", rs, rt, rd, "00000010111"],
    display: [rd, rt, rs],
  },
  dsrl: {
    format: ["00000000000", rt, rd, sa, "111010"],
    display: [rd, rt, sa],
  },
  dsrl32: {
    format: ["00000000000", rt, rd, sa, "111110"],
    display: [rd, rt, sa],
  },
  dsrlv: {
    format: ["000000", rs, rt, rd, "00000010110"],
    display: [rd, rt, rs],
  },
  dsub: {
    format: ["000000", rs, rt, rd, "00000101110"],
    display: [rd, rs, rt],
  },
  dsubu: {
    format: ["000000", rs, rt, rd, "00000101111"],
    display: [rd, rs, rt],
  },
  "floor.l.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001011"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "floor.w.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001111"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  j: {
    format: ["000010", uint26shift2],
    display: [uint26shift2],
  },
  jal: {
    format: ["000011", uint26shift2],
    display: [uint26shift2],
  },
  jalr: {
    format: ["000000", rs, "00000", [rd, "11111"], "00000", "001001"],
    display: ["rd?", rs],
  },
  jr: {
    format: ["000000", rs, "000000000000000", "001000"],
    display: [rs],
  },
  lb: {
    format: ["100000", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lbu: {
    format: ["100100", rs, rt, uint16],
    display: [rt, uint16, "(", rs, ")"], // offset
  },
  ld: {
    format: ["110111", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  ldc1: {
    format: ["110101", rs, ft, int16],
    display: [ft, int16, "(", rs, ")"], // offset
  },
  ldc2: {
    format: ["110110", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  ldl: {
    format: ["011010", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  ldr: {
    format: ["011011", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  ldxc1: {
    format: ["010011", rs, rt, "00000", fd, "000001"],
    display: [fd, rt, "(", rs, ")"], // offset
  },
  lh: {
    format: ["100001", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lhu: {
    format: ["100101", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  ll: {
    format: ["110000", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lld: {
    format: ["110100", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lui: {
    format: ["001111", "00000", rt, uint16],
    display: [rt, uint16],
  },
  lw: {
    format: ["100011", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lwc1: {
    format: ["110001", rs, ft, int16],
    display: [ft, int16, "(", rs, ")"], // offset
  },
  lwc2: {
    format: ["110010", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lwc3: {
    format: ["110011" ,rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lwl: {
    format: ["100010", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lwr: {
    format: ["100110", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lwu: {
    format: ["100111", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lwxc1: {
    format: ["010011", rs, rt, "00000", fd, "000000"],
    display: [fd, rt, "(", rs, ")"],
  },
  "madd.fmt": {
    format: ["010011", fr, ft, fs, fd, "100", fmt3],
    fmts: ["S", "D"],
    display: [fd, fr, fs, ft],
  },
  mfc1: {
    format: ["010001", "00000", rt, fs, "00000000000"],
    display: [rt, fs],
  },
  mfhi: {
    format: ["000000", "0000000000", rd, "00000", "010000"],
    display: [rd],
  },
  mflo: {
    format: ["000000", "0000000000", rd, "00000", "010010"],
    display: [rd],
  },
  "mov.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "000110"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  movf: {
    format: ["000000", rs, cc, "00", rd, "00000", "000001"],
    display: [rd, rs, cc],
  },
  "movf.fmt": {
    format: ["010001", fmt, cc, "00", fs, fd, "010001"],
    fmts: ["S", "D"],
    display: [fd, fs, cc],
  },
  movn: {
    format: ["000000", rs, rt, rd, "00000", "001011"],
    display: [rd, rs, rt],
  },
  "movn.fmt": {
    format: ["010001", fmt, rt, fs, fd, "010011"],
    fmts: ["S", "D"],
    display: [fd, fs, rt],
  },
  movt: {
    format: ["000000", rs, cc, "01", rd, "00000", "000001"],
    display: [rd, rs, cc],
  },
  "movt.fmt": {
    format: ["010001", fmt, cc, "01", fs, fd, "010001"],
    fmts: ["S", "D"],
    display: [fd, fs, cc],
  },
  movz: {
    format: ["000000", rs, rt, rd, "00000", "001010"],
    display: [rd, rs, rt],
  },
  "movz.fmt": {
    format: ["010001", fmt, rt, fs, fd, "010010"],
    fmts: ["S", "D"],
    display: [fd, fs, rt],
  },
  "msub.fmt": {
    format: ["010011", fr, ft, fs, fd, "101", fmt3],
    fmts: ["S", "D"],
    display: [fd, fr, fs, ft],
  },
  mtc1: {
    format: ["010001", "00100", rt, fs, "00000000000"],
    display: [rt, fs],
  },
  mthi: {
    format: ["000000", rs, "000000000000000", "010001"],
    display: [rs],
  },
  mtlo: {
    format: ["000000", rs, "000000000000000", "010011"],
    display: [rs],
  },
  "mul.fmt": {
    format: ["010001", fmt, ft, fs, fd, "000010"],
    fmts: ["S", "D"],
    display: [fd, fs, ft],
  },
  mult: {
    format: ["000000", rs, rt, "0000000000", "011000"],
    display: [rs, rt],
  },
  multu: {
    format: ["000000", rs, rt, "0000000000", "011001"],
    display: [rs, rt],
  },
  "neg.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "000111"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "nmadd.fmt": {
    format: ["010011", fr, ft, fs, fd, "110", fmt3],
    fmts: ["S", "D"],
    display: [fd, fr, fs, ft],
  },
  "nmsub.fmt": {
    format: ["010011", fr, ft, fs, fd, "111", fmt3],
    fmts: ["S", "D"],
    display: [fd, fr, fs, ft],
  },
  nop: {
    format: ["00000000000000000000000000000000"],
    display: [],
  },
  nor: {
    format: ["000000", rs, rt, rd, "00000", "100111"],
    display: [rd, rs, rt],
  },
  or: {
    format: ["000000", rs, rt, rd, "00000", "100101"],
    display: [rd, rs, rt],
  },
  ori: {
    format: ["001101", rs, rt, uint16],
    display: [rt, rs, uint16],
  },
  pref: {
    format: ["110011", rs, uint5, int16],
    display: [uint5, int16, "(", rs, ")"], // hint, offset, base
  },
  prefx: {
    format: ["010011", rs, rt, uint5, "00000", "001111"],
    display: [uint5, rt, "(", rs, ")"], // hint, index, base
  },
  "recip.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "010101"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "round.l.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001000"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "round.w.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001100"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "rsqrt.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "010110"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  sb: {
    format: ["101000", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sc: {
    format: ["111000", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  scd: {
    format: ["111100", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sd: {
    format: ["111111", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sdc1: {
    format: ["111101", rs, ft, int16],
    display: [ft, int16, "(", rs, ")"], // offset
  },
  sdc2: {
    format: ["111110", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sdl: {
    format: ["101100", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sdr: {
    format: ["101101", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sdxc1: {
    format: ["010011", rs, uint5, fs, "00000", "001001"],
    display: [fs, uint5, "(", rs, ")"],
  },
  sh: {
    format: ["101001", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sll: {
    format: ["000000", "00000", rt, rd, sa, "000000"],
    display: [rd, rt, sa],
  },
  sllv: {
    format: ["000000", rs, rt, rd, "00000", "000100"],
    display: [rd, rt, rs],
  },
  slt: {
    format: ["000000", rs, rt, rd, "00000", "101010"],
    display: [rd, rs, rt],
  },
  slti: {
    format: ["001010", rs, rt, int16],
    display: [rt, rs, int16],
  },
  sltiu: {
    format: ["001011", rs, rt, uint16],
    display: [rt, rs, uint16],
  },
  sltu: {
    format: ["000000", rs, rt, rd, "00000", "101011"],
    display: [rd, rs, rt],
  },
  "sqrt.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "000100"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  sra: {
    format: ["000000", "00000", rt, rd, sa, "000011"],
    display: [rd, rt, sa],
  },
  srav: {
    format: ["000000", rs, rt, rd, "00000", "000111"],
    display: [rd, rt, rs],
  },
  srl: {
    format: ["000000", "00000", rt, rd, sa, "000010"],
    display: [rd, rt, sa],
  },
  srlv: {
    format: ["000000", rs, rt, rd, "00000", "000110"],
    display: [rd, rt, rs],
  },
  sub: {
    format: ["000000", rs, rt, rd, "00000", "100010"],
    display: [rd, rs, rt],
  },
  "sub.fmt": {
    format: ["010001", fmt, ft, fs, fd, "000001"],
    fmts: ["S", "D"],
    display: [fd, fs, ft],
  },
  subu: {
    format: ["000000", rs, rt, rd, "00000", "100011"],
    display: [rd, rs, rt],
  },
  sw: {
    format: ["101011", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"],
  },
  swc1: {
    format: ["111001", rs, ft, int16],
    display: [ft, int16, "(", rs, ")"],
  },
  swc2: {
    format: ["111010", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"],
  },
  swc3: {
    format: ["111011", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"],
  },
  swl: {
    format: ["101010", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"],
  },
  swr: {
    format: ["101110", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"],
  },
  swxc1: {
    format: ["010011", rs, uint5, fs, "00000", "001000"],
    display: [fs, uint5, "(", rs, ")"],
  },
  sync: {
    format: ["000000", "000000000000000", "00000", "001111"],
    display: [],
  },
  syscall: {
    format: ["000000", [uint20, "00000000000000000000"], "001100"],
    display: [],
  },
  teq: {
    format: ["000000", rs, rt, uint10, "110100"],
    display: [rs, rt],
  },
  teqi: {
    format: ["000001", rs, "01100", int16],
    display: [rs, int16],
  },
  tge: {
    format: ["000000", rs, rt, uint10, "110000"],
    display: [rs, rt],
  },
  tgei: {
    format: ["000001", rs, "01000", int16],
    display: [rs, int16],
  },
  tgeiu: {
    format: ["000001", rs, "01001", uint16],
    display: [rs, uint16],
  },
  tgeu: {
    format: ["000000", rs, rt, uint10, "110001"],
    display: [rs, rt],
  },
  tlt: {
    format: ["000000", rs, rt, uint10, "110010"],
    display: [rs, rt],
  },
  tlti: {
    format: ["000001", rs, "01010", int16],
    display: [rs, int16],
  },
  tltiu: {
    format: ["000001", rs, "01011", uint16],
    display: [rs, uint16],
  },
  tltu: {
    format: ["000000", rs, rt, uint10, "110011"],
    display: [rs, rt],
  },
  tne: {
    format: ["000000", rs, rt, uint10, "110110"],
    display: [rs, rt],
  },
  tnei: {
    format: ["000001", rs, "01110", int16],
    display: [rs, int16],
  },
  "trunc.l.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001001"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "trunc.w.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001101"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  xor: {
    format: ["000000", rs, rt, rd, "00000", "100110"],
    display: [rd, rs, rt],
  },
  xori: {
    format: ["001110", rs, rt, uint16],
    display: [rt, rs, uint16],
  },
};
