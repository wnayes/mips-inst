import { findMatch, getOpcodeDetails, getValueBitLength } from "./opcodes";
import { getRegName, getFloatRegName, getFmtName, getFmt3Name, getCondName } from "./regs";
import { makeInt16, getImmFormatDetails } from "./immediates";
import { isBinaryLiteral, makeBitMask, padBitString } from "./bitstrings";

// opts:
//   commas: true to separate values by commas
//   include$: true to prefix registers with dollar sign
//   casing: "toUpperCase" (default), "toLowerCase"
//   numBase: 16 (hex, default), 10 (decimal)
export function print(inst, opts) {
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

  const opName = findMatch(inst);
  if (!opName)
    throw new Error("Unrecognized instruction");

  const opcodeObj = getOpcodeDetails(opName);

  let values = _extractValues(inst, opcodeObj.format);

  let result = _formatOpcode(opName, values, opts);

  function _getRegName(displayEntry) {
    switch (displayEntry) {
      case "rs":
      case "rt":
      case "rd":
        return getRegName(values[displayEntry]);

      case "fs":
      case "ft":
      case "fd":
        return getFloatRegName(values[displayEntry]);
    }
  }

  const display = opcodeObj.display;
  for (let i = 0; i < display.length; i++) {
    let displayEntry = display[i];

    if (displayEntry.endsWith("?")) {
      displayEntry = displayEntry.replace("?", "");
      if (values[displayEntry] === undefined)
        continue; // Optional value, not set.
    }

    let value = values[displayEntry];

    let addComma = opts.commas;

    switch (displayEntry) {
      case "rs":
      case "rt":
      case "rd":
      case "fs":
      case "ft":
      case "fd":
        if (!result.endsWith("("))
          result += " ";
        result += _formatReg(_getRegName(displayEntry), opts);
        break;

      case "(":
      case ")":
        addComma = false;
        if (result.endsWith(","))
          result = result.slice(0, -1); // Lop off comma, since we are involved in a parenthesis open/close

        result += displayEntry;
        break;
    }

    const immDetails = getImmFormatDetails(displayEntry);
    if (immDetails) {
      if (!result.endsWith("("))
        result += " ";

      result += _formatNumber(value, opts);
    }

    if (addComma && (i !== display.length - 1) && !result.endsWith(",")) {
      result += ",";
    }
  }

  return result.trim();
}

function _extractValues(inst, format) {
  let values = {};
  for (let i = format.length - 1; i >= 0; i--) {
    let value, bitLength;
    let piece = format[i];
    if (Array.isArray(piece)) {
      for (let j = piece.length - 1; j >= 0; j--) {
        bitLength = getValueBitLength(piece[j]);
        value = inst & makeBitMask(bitLength);

        if (isBinaryLiteral(piece[j])) {
          if (piece[j] === padBitString(value.toString(2), bitLength)) {
            piece = piece[j];
            break;
          }
        }
        else {
          piece = piece[j];
          break;
        }
      }
    }
    else {
      bitLength = getValueBitLength(piece);
      value = inst & makeBitMask(bitLength);
    }

    if (isBinaryLiteral(piece)) {
      inst >>>= bitLength;
      continue;
    }

    values[piece] = value;

    const immDetails = getImmFormatDetails(piece);
    if (immDetails) {
      if (immDetails.signed && immDetails.bits === 16) {
        values[piece] = makeInt16(values[piece]);
      }

      if (immDetails.shift) {
        values[piece] = values[piece] << immDetails.shift;
      }
    }

    inst >>>= bitLength;
  }

  return values;
}

function _formatNumber(num, opts) {
  if (num === 0)
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

function _formatOpcode(opcodeName, values, opts) {
  const pieces = opcodeName.split(".");
  for (let i = 0; i < pieces.length; i++) {
    if (pieces[i] === "fmt") {
      if (values.hasOwnProperty("fmt3"))
        pieces[i] = getFmt3Name(values["fmt3"]);
      else if (values.hasOwnProperty("fmt"))
        pieces[i] = getFmtName(values["fmt"]);
      else
        throw new Error("Format value not available");
    }
    else if (pieces[i] === "cond") {
      if (values.hasOwnProperty("cond"))
        pieces[i] = getCondName(values["cond"]);
      else
        throw new Error("Condition value not available");
    }
  }
  let opcode = pieces.join(".");

  return _applyCasing(opcode, opts.casing);
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
