const regs = {
  r0: 0,
  zero: 0,
  at: 1,
  v0: 2,
  v1: 3,
  a0: 4,
  a1: 5,
  a2: 6,
  a3: 7,
  t0: 8,
  t1: 9,
  t2: 10,
  t3: 11,
  t4: 12,
  t5: 13,
  t6: 14,
  t7: 15,
  s0: 16,
  s1: 17,
  s2: 18,
  s3: 19,
  s4: 20,
  s5: 21,
  s6: 22,
  s7: 23,
  t8: 24,
  t9: 25,
  k0: 26,
  k1: 27,
  gp: 28,
  sp: 29,
  fp: 30,
  ra: 31
};

export function getRegBits(reg) {
  if (!reg)
    return undefined;
  return regs[reg.toLowerCase()];
}

export function getRegName(bits) {
  for (let name in regs) {
    if (regs[name] === bits)
      return name;
  }
  return "";
}

export function getFloatRegName(bits) {
  if (typeof bits !== "number")
    throw new Error("getFloatRegName encountered non-number");

  return "F" + bits;
}

const fmts = {
  S: 16,
  D: 17,
  W: 20,
  L: 21,
};

export function getFmtBits(fmtStr) {
  return fmts[fmtStr.toUpperCase()];
}

export function getFmtName(bits) {
  for (let name in fmts) {
    if (fmts[name] === bits)
      return name;
  }
  return "";
}

const fmt3s = {
  S: 0,
  D: 1,
  W: 4,
  L: 5,
};

export function getFmt3Bits(fmtStr) {
  return fmt3s[fmtStr.toUpperCase()];
}

export function getFmt3Name(bits) {
  for (let name in fmt3s) {
    if (fmt3s[name] === bits)
      return name;
  }
  return "";
}

export function isFmtString(fmtStr) {
  return fmts.hasOwnProperty(fmtStr.toUpperCase()) || fmt3s.hasOwnProperty(fmtStr.toUpperCase());
}

const conds = {
  F: 0,
  UN: 1,
  EQ: 2,
  UEQ: 3,
  OLT: 4,
  ULT: 5,
  OLE: 6,
  ULE: 7,
  SF: 8,
  NGLE: 9,
  SEQ: 10,
  NGL: 11,
  LT: 12,
  NGE: 13,
  LE: 14,
  NGT: 15,
};

export function getCondBits(condStr) {
  return conds[condStr.toUpperCase()];
}

export function getCondName(bits) {
  for (let name in conds) {
    if (conds[name] === bits)
      return name;
  }
  return "";
}

export function isCondString(condStr) {
  return conds.hasOwnProperty(condStr.toUpperCase());
}
