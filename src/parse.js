import { getOpcodeDetails } from "./opcodes";
import { formatImmediate, parseImmediate } from "./immediates";
import { getRegBits, getFmtBits } from "./regs";
import * as formats from "./regex";

export function parse(value) {
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
  let opcode = formats.getOpcode(value);
  if (!opcode)
    throw `Could not parse opcode from ${value}`;

  // TODO: Generalize
  const specialCode = parseSpecialOp(opcode);
  if (specialCode !== undefined)
    return specialCode;

  let opcodeObj = getOpcodeDetails(opcode);
  if (!opcodeObj) {
    throw `Opcode ${opcode} was not recognized`;
  }

  let regex = formats.makeRegexForOpcode(opcodeObj);
  let match = regex.exec(value);
  if (!match)
    throw `Could not parse instruction: ${value}`;

  const opcodeFormat = opcodeObj.format;

  let op, rs, rt, rd, fs, ft, fd, sa, fmt, imm, f;
  op = opcodeObj.known["op"] || 0;
  rs = opcodeObj.known["rs"] || 0;
  rt = opcodeObj.known["rt"] || 0;
  rd = opcodeObj.known["rd"] || 0;
  fs = opcodeObj.known["fs"] || 0;
  ft = opcodeObj.known["ft"] || 0;
  fd = opcodeObj.known["fd"] || 0;
  sa = opcodeObj.known["sa"] || 0;
  imm = opcodeObj.known["imm"] || 0;
  f = opcodeObj.known["f"] || 0;

  if (opcodeFormat === "FR") {
    if (opcodeObj.known.hasOwnProperty("fmt"))
      fmt = opcodeObj.known["fmt"];
    else
      fmt = determineFmt(match[1], opcodeObj.formats);
  }

  const display = opcodeObj.display;
  let matchIndex = 2; // 0 is whole match, 1 is opcode - skip both
  for (let i = 0; i < display.length; i++, matchIndex++) {
    const parsedVal = match[matchIndex];
    const displayEntry = display[i];
    switch (displayEntry) {
      case "rs":
        rs = getRegBits(parsedVal);
        if (rs === undefined)
          throw new Error(`Unrecognized rs register ${parsedVal}`);
        break;

      case "rt":
        rt = getRegBits(parsedVal);
        if (rt === undefined)
          throw new Error(`Unrecognized rt register ${parsedVal}`);
        break;

      case "rd":
      case "rd?": {
        const tryRd = getRegBits(parsedVal);
        if (tryRd === undefined) {
          if (displayEntry === "rd?")
            break;

          throw new Error(`Unrecognized rd register ${parsedVal}`);
        }
        rd = tryRd;
        break;
      }

      case "fs":
        fs = parseInt(parsedVal);
        if (isNaN(fs))
          throw new Error(`Unrecognized fs register ${parsedVal}`);
        break;

      case "ft":
        ft = parseInt(parsedVal);
        if (isNaN(ft))
          throw new Error(`Unrecognized ft register ${parsedVal}`);
        break;

      case "fd":
        fd = parseInt(parsedVal);
        if (isNaN(fd))
          throw new Error(`Unrecognized fd register ${parsedVal}`);
        break;

      case "sa":
      case "imm": {
        let value;
        const immPieces = [match[i + 2], match[i + 3], match[i + 4]];
        if (opcodeFormat === "I" || opcodeFormat === "R") {
          value = parseImmediate(immPieces, 16, true);
        }
        else if (opcodeFormat === "J") {
          value = parseImmediate(immPieces, 32);
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
      return _buildRFormat(op, rs || fs, rt || ft, rd || fd, sa, f);
    case "I":
      return _buildIFormat(op, rs || fs, rt || ft, imm);
    case "J":
      return _buildJFormat(op, imm, opcodeObj.shift);
    case "FR":
      return _buildFRFormat(op, fmt, fs, ft, fd, f);
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
  asm |= formatImmediate(imm, 16);
  return asm >>> 0;
}

function _buildJFormat(op, imm, shift) {
  let asm = (op << 26);
  asm |= (shift ? imm >>> 2 : imm) & 0x03FFFFFF;
  return asm >>> 0;
}

function _buildFRFormat(op, fmt, fs, ft, fd, f) {
  let asm = (op << 26);
  asm |= (fmt << 21);
  asm |= (ft << 16);
  asm |= (fs << 11);
  asm |= (fd << 6);
  asm |= f;
  return asm >>> 0;
}

function parseSpecialOp(opcode) {
  if (opcode.toLowerCase() === "nop")
    return 0;
  if (opcode.toLowerCase() === "break")
    return 0x0000000D;
  if (opcode.toLowerCase() === "syscall")
    return 0x0000000C;
}

function determineFmt(opcode, allowedFormats) {
  const pieces = opcode.split(".");
  if (!pieces.length)
    throw `No format specified for opcode ${opcode}`;

  const fmtStr = pieces[pieces.length - 1];
  if (allowedFormats.indexOf(fmtStr) === -1)
    throw `Format ${fmtStr} is not allowed for ${pieces[0]}. Allowed values are ${allowedFormats}`;

  return getFmtBits(fmtStr);
}