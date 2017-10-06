import { getOpcodeDetails, getValueBitLength } from "./opcodes";
import { parseImmediate, getImmFormatDetails } from "./immediates";
import { getRegBits, getFmtBits, getFmt3Bits, getCondBits } from "./regs";
import * as formats from "./regex";
import { isBinaryLiteral, makeBitMaskFromString, makeBitMask } from "./bitstrings";

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

  let opcodeObj = getOpcodeDetails(opcode);
  if (!opcodeObj) {
    throw `Opcode ${opcode} was not recognized`;
  }

  let regex = formats.makeRegexForOpcode(opcodeObj);
  let match = regex.exec(value);
  if (!match)
    throw `Could not parse instruction: ${value}`;

  let values = {};

  if (opcode.indexOf(".fmt") !== -1 || opcode.indexOf(".cond") !== -1) {
    determineOpcodeValues(match[1], opcode, opcodeObj.fmts, opcodeObj.format, values);
  }

  const display = opcodeObj.display;
  let matchIndex = 2; // 0 is whole match, 1 is opcode - skip both
  for (let i = 0; i < display.length; i++, matchIndex++) {
    const parsedVal = match[matchIndex];
    let displayEntry = display[i];

    const optional = displayEntry.endsWith("?");
    displayEntry = displayEntry.replace("?", "");

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
        values[displayEntry] = value;
      }

      matchIndex += 2;

      continue;
    }

    throw `Unrecognized opcode display entry ${displayEntry}`;
  }

  return bitsFromFormat(opcodeObj.format, values);
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
    throw `Given opcode ${givenOpcode} does not have all pieces (${genericOpcode})`;

  for (let i = 0; i < genericPieces.length; i++) {
    const genericPiece = genericPieces[i];

    if (genericPiece === "fmt" || genericPiece === "ftm3") {
      if (allowedFormats.indexOf(givenPieces[i]) === -1)
        throw `Format ${givenPieces[i]} is not allowed for ${genericPiece}. Allowed values are ${allowedFormats}`;

      if (genericPiece === "fmt")
        values["fmt"] = getFmtBits(givenPieces[i]);
      else if (genericPiece === "fmt3")
        values["fmt3"] = getFmt3Bits(givenPieces[i]);
    }

    if (genericPiece === "cond")
      values["cond"] = getCondBits(givenPieces[i]);
  }
}
