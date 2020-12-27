export function parseImmediate(immArr, maxBits, signed, shift) {
  let [neg, base, num] = immArr;
  base = base.toLowerCase();

  let value;
  if (base === "b")
    value = parseInt(num, 2);
  else if (base === "o")
    value = parseInt(num, 8);
  else if (base === "x")
    value = parseInt(num, 16);
  else
    value = parseInt(num, 10);

  if (isNaN(value)) {
    return value; // Let the caller decide what to do with NaN.
  }

  if (shift) {
    value >>>= shift;
  }

  if (maxBits === 16) {
    if (signed) {
      value = makeInt16(value);
    }
  }

  if (neg)
    value = -value;

  return value;
}

export function formatImmediate(value, maxBits) {
  if (maxBits === 16) {
    value = (new Uint16Array([value]))[0];
  }

  return value;
}

export function makeInt16(value) {
  return (new Int16Array([value]))[0];
}

export function getImmFormatDetails(formatVal) {
  // Remove optional indicator
  if (formatVal[formatVal.length - 1] === "?")
    formatVal = formatVal.substring(0, formatVal.length - 1);

  if (formatVal.indexOf("int") === -1) {
    if (formatVal.substr(0, 2) === "cc") {
      return {
        signed: false,
        bits: 4,
        shift: false,
      };
    }

    return null; // Not an immediate
  }

  let shift = 0;
  const shiftIndex = formatVal.indexOf("shift");
  if (shiftIndex > 0)
    shift = formatVal.substr(shiftIndex).match(/\d+/g);

  return {
    signed: formatVal[0] !== "u",
    bits: parseInt(formatVal.match(/\d+/g)),
    shift: shift,
  };
}
