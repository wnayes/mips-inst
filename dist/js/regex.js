import { isFmtString, isCondString } from "./regs";
import { getImmFormatDetails } from "./immediates";

const opRegex = "([A-Za-z0-3.]+)";
const immRegex = "(-)?0?([xbo]?)([A-Fa-f0-9]+)";
const regRegex = "\\$?(\\w+)";
const floatRegRegex = "\\$?[Ff]([0-9]+)";

const opcodeRegex = new RegExp("^\\s*" + opRegex);

const _regexCache = Object.create(null);

// Gets the op string from a given entire instruction.
// This is a general form (.fmt rather than .S, .D, etc.)
export function getOpcode(str) {
  const match = opcodeRegex.exec(str);
  if (match) {
    const pieces = match[1].split("."); // Could be .fmt, .cond.fmt, etc
    if (pieces.length === 1)
      return pieces[0].toLowerCase();

    // Loop from the end, as the end has the .fmt for tricky things like .D.W
    let result = "";
    let foundFmt = false;
    let foundCond = false;
    for (let i = pieces.length - 1; i > 0; i--) {
      let piece = pieces[i];
      if (!foundFmt) {
        if (piece === "fmt" || isFmtString(piece)) {
          foundFmt = true;
          piece = "fmt";
        }
      }

      if (!foundCond) {
        if (isCondString(piece)) {
          foundCond = true;
          piece = "cond";
        }
      }

      result = "." + piece + result;
    }

    return (pieces[0] + result).toLowerCase();
  }
  return null;
}

export function makeRegexForOpcode(opcode, opcodeObj) {
  if (_regexCache[opcode]) {
    return _regexCache[opcode];
  }

  const parts = [opRegex];
  const display = opcodeObj.display;
  for (let i = 0; i < display.length; i++) {
    const part = display[i];
    const optional = part.endsWith("?");

    let regexPart = "";
    if (optional)
      regexPart += "(?:[,\\s]+";

    if (display[i + 1] === "(") {
      if (optional)
        throw new Error("Not prepared to generate optional regex with parenthesis");

      if (display[i + 3] !== ")")
        throw new Error("Not prepared to generate regex for multiple values in parenthesis"); // Or no closing paren

      regexPart += makeParenthesisRegex(getRegexForPart(part), getRegexForPart(display[i + 2]));
      i = i + 3;
    }
    else {
      regexPart += getRegexForPart(part);
    }

    if (optional)
      regexPart += ")?";

    parts.push(regexPart);
  }

  let regexStr =
    "^\\s*" +
    parts.reduce((str, next, index) => {
      if (index === 0 || partIsOptional(next))
        return str + next;

      return str + "[,\\s]+" + next;
    }, "") +
    "\\s*$";

  const regex = new RegExp(regexStr);
  _regexCache[opcode] = regex;
  return regex;
}

function getRegexForPart(part) {
  if (isReg(part))
    return regRegex;
  if (isFloatReg(part))
    return floatRegRegex;

  if (getImmFormatDetails(part))
    return immRegex;

  throw new Error(`Unrecognized display entry ${part}`);
}

function makeParenthesisRegex(regex1, regex2) {
  return regex1 + "\\s*" + "\\(?" + regex2 + "\\)?";
}

function partIsOptional(partStr) {
  return partStr.startsWith("(?:");
}

export function isReg(entry) {
  if (!entry)
    return false;

  switch (entry.substr(0, 2)) {
    case "rs":
    case "rt":
    case "rd":
      return true;
  }
  return false;
}

export function isFloatReg(entry) {
  if (!entry)
    return false;

  switch (entry.substr(0, 2)) {
    case "fs":
    case "ft":
    case "fd":
      return true;
  }
  return false;
}
