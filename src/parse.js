import { getOpcodeDetails } from "./opcodes";
import { formatImmediate, parseImmediate } from "./immediates";
import { getRegBits } from "./regs";
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
        rs = getRegBits(parsedVal);
        if (rs === undefined)
          throw new Error(`Unrecognized rs register ${rs}`);
        break;

      case "rt":
        rt = getRegBits(parsedVal);
        if (rt === undefined)
          throw new Error(`Unrecognized rt register ${rt}`);
        break;

      case "rd":
      case "rd?": {
        const tryRd = getRegBits(parsedVal);
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
  asm |= formatImmediate(imm, 16);
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
