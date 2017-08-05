import { findMatch, getOpcodeDetails } from "./opcodes";
import { isReg } from "./regex";
import { getRegName } from "./regs";
import { makeInt16 } from "./immediates";

// opts:
//   commas: true to separate values by commas
//   include$: true to prefix registers with dollar sign
//   casing: "toUpperCase" (default), "toLowerCase"
//   numBase: 16 (hex, default), 10 (decimal)
export function print(inst, opts) {
  opts = Object.assign({
    commas: false,
    include$: false,
    casing: "toUpperCase",
    numBase: 16
  }, opts);

  if (Array.isArray(inst))
    return inst.map((i) => _print(i, opts));

  if (typeof inst === "number")
    return _print(inst, opts);

  throw new Error("Unexpected input to parse. Pass a number or array of numbers.");
};

function _print(inst, opts) {
  if (typeof inst !== "number")
    throw new Error("Unexpected array entry. Pass all numbers.");

  const specialStr = _printSpecialInst(inst, opts);
  if (specialStr)
    return specialStr;

  const opName = findMatch(inst);
  if (!opName)
    throw new Error("Unrecognized instruction");

  const opcodeObj = getOpcodeDetails(opName);

  let rs, rt, rd, sa, imm;
  const opcodeFormat = opcodeObj.format;
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

  let result = "";

  result += _formatOpcode(opName, opts);

  function _getRegName(displayEntry) {
    switch (displayEntry) {
      case "rs":
        return getRegName(rs);
      case "rt":
        return getRegName(rt);
      case "rd":
      case "rd?":
        return getRegName(rd);
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
        if (isReg(display[i + 1])) {
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
    makeInt16(inst & 0xFFFF) // imm
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
    value += "0x"
  else if (opts.numBase === 8)
    value += "0o"
  else if (opts.numBase === 2)
    value += "0b"

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
