export function parseImmediate(immArr, maxBits, signed) {
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