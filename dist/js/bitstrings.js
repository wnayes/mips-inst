export function isBinaryLiteral(str) {
  return str[0] === "0" || str[0] === "1"; // Checking first char is enough for now
}

export function compareBits(number, bitString, bitOffset) {
  let shifted = (number >>> bitOffset) & makeBitMask(bitString.length);
  let mask = makeBitMaskFromString(bitString);
  return shifted === mask;
}

export function makeBitMaskFromString(bitString) {
  let mask = 0;
  for (var i = 0; i < bitString.length; i++) {
    let bit = bitString[i] === "1" ? 1 : 0;
    mask <<= 1;
    mask = mask | bit;
  }
  return mask;
}

export function makeBitMask(len) {
  if (len <= 0)
    throw new Error(`makeBitMask cannot make mask of length ${len}`);

  let mask = 1;
  while (--len) {
    mask <<= 1;
    mask = mask | 1;
  }
  return mask;
}

export function padBitString(str, minLen) {
  while (str.length < minLen) {
    str = "0" + str;
  }
  return str;
}
