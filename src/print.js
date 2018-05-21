import { findMatch, getOpcodeDetails, getValueBitLength } from "./opcodes";
import { getRegName, getFloatRegName, getFmtName, getFmt3Name, getCondName } from "./regs";
import { makeInt16, getImmFormatDetails } from "./immediates";
import { isBinaryLiteral, makeBitMask, padBitString } from "./bitstrings";

/**
 * Prints a string representation of a MIPS instruction.
 *
 * With the `intermediate` option, this can also be used as a convenient base
 * for a disassembler. The object output with `intermediate` can be manipulated
 * prior to calling `print` with it again.
 * @param {Number|Array|ArrayBuffer|DataView|Object} inst MIPS instruction, or intermediate object format.
 * @param {Object} opts Behavior options
 * @param {String} opts.casing "toUpperCase" (default), "toLowerCase"
 * @param {Boolean} opts.commas True to separate values by commas
 * @param {Boolean} opts.include$ True to prefix registers with dollar sign
 * @param {Boolean} opts.intermediate: Output an object intermediate format instead of a string
 * @param {Number} opts.numBase Number format. 16 (hex, default), 10 (decimal)
 * @returns {String|Array|Object} Returns a string representation of the given
 * MIPS instruction code(s).
 * If multiple values are given (array) then multiple values are returned.
 * When the `intermediate` option is passed, the return type is an object.
 */
export function print(inst, opts) {
  opts = _getFinalOpts(opts);

  if (Array.isArray(inst))
    return inst.map(i => _print(i, opts));

  const isArrayBuffer = inst instanceof ArrayBuffer;
  if (isArrayBuffer || inst instanceof DataView) {
    const dataView = isArrayBuffer ? new DataView(inst) : inst;
    const result = [];
    for (let i = 0; i < dataView.byteLength; i += 4) {
      result.push(_print(dataView.getUint32(i), opts));
    }
    return result;
  }

  const inputType = typeof inst;
  if (inputType === "number" || inputType === "object")
    return _print(inst, opts);

  throw new Error("Unexpected input to print.");
}

function _getFinalOpts(givenOpts) {
  return Object.assign({
    casing: "toUpperCase",
    commas: false,
    include$: false,
    intermediate: false,
    numBase: 16
  }, givenOpts);
}

function _print(inst, opts) {
  let opcodeObj, opName, values;
  if (typeof inst === "number") {
    opName = findMatch(inst);
    if (!opName)
      throw new Error("Unrecognized instruction");

    opcodeObj = getOpcodeDetails(opName);

    values = _extractValues(inst, opcodeObj.format);
    values.op = opName;
  }
  else if (typeof inst === "object") {
    if (!inst.op)
      throw new Error("Instruction object did not contain op");

    opcodeObj = getOpcodeDetails(inst.op);

    values = inst;
  }
  else
    throw new Error(`Unexpected value ${inst}`);

  if (!opcodeObj)
    throw new Error("Invalid opcode");

  if (opts.intermediate)
    return values;

  return _printValues(values, opcodeObj, opts);
}

function _printValues(values, opcodeObj, opts) {
  let result = _formatOpcode(values, opts);

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
    if (value === undefined && displayEntry !== "(" && displayEntry !== ")") {
      throw new Error(`Expected ${displayEntry} value, got undefined`);
    }

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

      if (immDetails.signed && immDetails.bits === 16) {
        value = makeInt16(value);
      }
      if (immDetails.shift) {
        value = value << immDetails.shift;
      }

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

function _formatOpcode(values, opts) {
  const pieces = values.op.split(".");
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
