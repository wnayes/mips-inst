import { getOpcodeDetails, getValueBitLength } from "./opcodes";
import { parseImmediate, getImmFormatDetails } from "./immediates";
import { getRegBits, getFmtBits, getFmt3Bits, getCondBits } from "./regs";
import * as formats from "./regex";
import { isBinaryLiteral, makeBitMaskFromString, makeBitMask } from "./bitstrings";

/**
 * Parses a string MIPS instruction, returning numeric machine code.
 *
 * With the `intermediate` option, this can also be used as a convenient base
 * for an assembler. The object output with `intermediate` can be manipulated
 * prior to calling `parse` with it again.
 * @param {String|Array|Object} value MIPS instruction, or intermediate object format.
 * @param {Object} opts Behavior options
 * @param {Boolean} opts.intermediate: Output an object intermediate format instead of a number
 * @returns {Number|Array|Object} Returns a numeric representation of the given
 * MIPS instruction string.
 * If multiple values are given (array) then multiple values are returned.
 * When the `intermediate` option is passed, the return type is an object.
 */
export function parse(value, opts) {
  opts = _getFinalOpts(opts);

  if (Array.isArray(value)) {
    return value.map(s => _parse(s, opts));
  }
  if (typeof value === "object") {
    return _parse(value, opts);
  }
  if (typeof value === "string") {
    const values = value.split(/\r?\n/).filter(v => !!(v.trim()));
    if (values.length === 1)
      return _parse(values[0], opts);
    else
      return values.map(s => _parse(s, opts));
  }

  throw new Error("Unexpected input to parse. Pass a string or array of strings.");
}

function _getFinalOpts(givenOpts) {
  return Object.assign({
    intermediate: false,
  }, givenOpts);
}

function _parse(value, opts) {
  let opcode, opcodeObj, values;
  if (typeof value === "string") {
    opcode = formats.getOpcode(value);
    if (!opcode)
      throw new Error(`Could not parse opcode from ${value}`);

    opcodeObj = getOpcodeDetails(opcode);
    if (!opcodeObj)
      throw new Error(`Opcode ${opcode} was not recognized`);

    values = _parseValues(opcode, opcodeObj, value);
  }
  else if (typeof value === "object") {
    opcode = formats.getOpcode(value.op);
    if (!opcode)
      throw new Error("Object input to parse did not contain 'op'");

    opcodeObj = getOpcodeDetails(opcode);
    if (!opcodeObj)
      throw new Error(`Opcode ${opcode} was not recognized`);

    values = value;
  }

  if (opts.intermediate)
    return values;

  return bitsFromFormat(opcodeObj.format, values);
}

function _parseValues(opcode, opcodeObj, value) {
  let regex = formats.makeRegexForOpcode(opcode, opcodeObj);
  let match = regex.exec(value);
  if (!match)
    throw new Error(`Could not parse instruction: ${value}`);

  let values = {
    op: opcode
  };

  if (opcode.indexOf(".fmt") !== -1 || opcode.indexOf(".cond") !== -1) {
    determineOpcodeValues(match[1], opcode, opcodeObj.fmts, opcodeObj.format, values);
  }

  const display = opcodeObj.display;
  let matchIndex = 2; // 0 is whole match, 1 is opcode - skip both
  for (let i = 0; i < display.length; i++, matchIndex++) {
    const parsedVal = match[matchIndex];
    let displayEntry = display[i];

    const optional = displayEntry.endsWith("?");
    if (optional) {
      displayEntry = displayEntry.replace("?", "");
    }

    switch (displayEntry) {
      case "(":
      case ")":
        matchIndex--; // Eh
        continue;

      case "rs":
      case "rd":
      case "rt": {
        const tryReg = getRegBits(parsedVal);
        if (tryReg === undefined) {
          if (optional)
            continue;

          throw new Error(`Unrecognized ${displayEntry} register ${parsedVal}`);
        }
        values[displayEntry] = tryReg;
        continue;
      }

      case "fs":
      case "ft":
      case "fd":
      case "fr":
        values[displayEntry] = parseInt(parsedVal);
        if (isNaN(values[displayEntry]))
          throw new Error(`Unrecognized ${displayEntry} register ${parsedVal}`);
        continue;
    }

    const immDetails = getImmFormatDetails(displayEntry);
    if (immDetails) {
      let value;
      const immPieces = [match[matchIndex], match[matchIndex + 1], match[matchIndex + 2]];

      if (!optional || immPieces[2]) {
        value = parseImmediate(immPieces, immDetails.bits, immDetails.signed, immDetails.shift);
        if (isNaN(value)) {
          throw new Error(`Could not parse immediate ${immPieces.join("")}`);
        }
        values[displayEntry] = value;
      }

      matchIndex += 2;

      continue;
    }

    throw new Error(`Unrecognized opcode display entry ${displayEntry}`);
  }

  return values;
}

function bitsFromFormat(format, values) {
  let output = 0;
  let bitOffset = 0;
  for (let i = 0; i < format.length; i++) {
    let writeResult;
    let piece = format[i];
    let bitLength = getValueBitLength(Array.isArray(piece) ? piece[0] : piece);
    output = (output << bitLength) >>> 0;
    if (Array.isArray(piece)) {
      for (let j = 0; j < piece.length; j++) {
        writeResult = writeBitsForPiece(piece[j], output, values);
        if (writeResult.wrote) {
          output = writeResult.output;
          break; // j
        }
      }
    }
    else {
      writeResult = writeBitsForPiece(piece, output, values);
      if (writeResult.wrote) {
        output = writeResult.output;
      }
    }

    bitOffset += bitLength;
  }

  if (bitOffset != 32)
    throw new Error("Incorrect number of bits written for format " + format);

  return output;
}

function writeBitsForPiece(piece, output, values) {
  let wrote = false;
  if (isBinaryLiteral(piece)) {
    output |= makeBitMaskFromString(piece);
    wrote = true;
  }
  else if (values[piece] !== undefined) {
    let value = values[piece] & makeBitMask(getValueBitLength(piece));
    wrote = true;
    output |= value;
  }

  return {
    wrote: wrote,
    output: output >>> 0,
  };
}

function determineOpcodeValues(givenOpcode, genericOpcode, allowedFormats, format, values) {
  const givenPieces = givenOpcode.split(".");
  const genericPieces = genericOpcode.split(".");
  if (givenPieces.length !== genericPieces.length)
    throw new Error(`Given opcode ${givenOpcode} does not have all pieces (${genericOpcode})`);

  for (let i = 0; i < genericPieces.length; i++) {
    const genericPiece = genericPieces[i];

    if (genericPiece === "fmt" || genericPiece === "ftm3") {
      if (allowedFormats.indexOf(givenPieces[i].toUpperCase()) === -1)
        throw new Error(`Format ${givenPieces[i]} is not allowed for ${genericPiece}. Allowed values are ${allowedFormats}`);

      if (genericPiece === "fmt")
        values["fmt"] = getFmtBits(givenPieces[i]);
      else if (genericPiece === "fmt3")
        values["fmt3"] = getFmt3Bits(givenPieces[i]);
    }

    if (genericPiece === "cond")
      values["cond"] = getCondBits(givenPieces[i]);
  }
}
