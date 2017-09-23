const opRegex = "([A-Za-z0-3]+)";
const immRegex = "(-)?0?([xbo]?)([A-Fa-f0-9]+)";
const regRegex = "\\$?(\\w+)";
const regIndRegex = immRegex + "\\s*" + "\\(?" + regRegex + "\\)?";
const floatRegRegex = "\\$?[Ff]{1,2}([0-9]+)";

const opcodeRegex = new RegExp("^\\s*" + opRegex);

export function getOpcode(str) {
  const match = opcodeRegex.exec(str);
  if (match) {
    return match[1];
  }
  return null;
}

import { rs, rt, rd, fs, ft, fd, sa, imm } from "./opcodes.js";

export function makeRegexForOpcode(opcodeObj) {
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
    else if (isFloatReg(part)) {
      regexPart += floatRegRegex;
    }
    else if (part === sa) {
      regexPart += immRegex;
    }
    else if (part === imm) {
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

export function isReg(entry) {
  if (!entry)
    return false;

  switch (entry.substr(0, 2)) {
    case rs:
    case rt:
    case rd:
      return true;
  }
  return false;
}

export function isFloatReg(entry) {
  if (!entry)
    return false;

  switch (entry.substr(0, 2)) {
    case fs:
    case ft:
    case fd:
      return true;
  }
  return false;
}
