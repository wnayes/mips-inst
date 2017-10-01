import { getFmtBits } from "./regs"

export const op = "op";
export const rs = "rs";
export const rt = "rt";
export const rd = "rd";
export const fs = "fs";
export const ft = "ft";
export const fd = "fd";
export const sa = "sa";
export const imm = "imm";
export const f = "f";

export function getOpcodeDetails(opcode) {
  return opcodeDetails[opcode.toLowerCase()];
}

// returns name
export function findMatch(inst) {
  const op = inst >>> 26;

  for (let opName in opcodeDetails) {
    const opDetails = opcodeDetails[opName];
    if ((opDetails.known["op"] || 0) === op) {
      // For R, we must also match the function
      if (opDetails.format === "R") {
        const rs = (inst >>> 21) & 0x1F;
        const rt = (inst >>> 16) & 0x1F;
        const f = inst & 0x2F;

        if ((opDetails.known["f"] || 0) !== f)
          continue;

        const knownRs = opDetails.known["rs"];
        if (knownRs !== undefined && knownRs !== rs)
          continue;

        const knownRt = opDetails.known["rt"];
        if (knownRt !== undefined && knownRt !== rt)
          continue;
      }
      else if (opDetails.format === "FR") {
        const f = inst & 0x2F;

        // Function must also match
        if ((opDetails.known["f"] || 0) !== f)
          continue;

        // Format should be one of the allowed ones
        let foundFmt = false;
        const fmt = (inst >>> 21) & 0x1F;
        for (let i = 0; i < opDetails.formats.length; i++) {
          let format = opDetails.formats[i];
          if (getFmtBits(format) === fmt) {
            foundFmt = true;
            break;
          }
        }
        if (!foundFmt)
          continue;
      }
      else if (opDetails.format === "I") {
        const rs = (inst >>> 21) & 0x1F;
        const rt = (inst >>> 16) & 0x1F;

        const knownRs = opDetails.known["rs"];
        if (knownRs !== undefined && knownRs !== rs)
          continue;

        const knownRt = opDetails.known["rt"];
        if (knownRt !== undefined && knownRt !== rt)
          continue;
      }

      return opName;
    }
  }
}

const opcodeDetails = {
  add: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100000
    }
  },
  "add.fmt": {
    format: "FR",
    formats: ["S", "D"],
    display: [fd, fs, ft],
    known: {
      [op]: 0b010001,
      [f]: 0b000000,
    }
  },
  addi: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001000
    }
  },
  addiu: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001001
    },
  },
  addu: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100001
    },
  },
  and: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100100
    },
  },
  andi: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001100
    },
  },
  bc1f: {
    format: "I",
    display: [imm], // off
    known: {
      [op]: 0b010001,
      [rs]: 0b01000,
      [rt]: 0b00000,
    }
  },
  beq: {
    format: "I",
    display: [rs, rt, imm], // off
    known: {
      [op]: 0b000100
    },
  },
  beql: {
    format: "I",
    display: [rs, rt, imm], // off
    known: {
      [op]: 0b010100
    },
  },
  bgez: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b00001,
    },
  },
  bgezal: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b10001,
    },
  },
  bgezall: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b10011,
    },
  },
  bgezl: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b00011,
    },
  },
  bgtz: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000111,
      [rt]: 0,
    },
  },
  bgtzl: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b010111,
      [rt]: 0,
    },
  },
  blez: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000110,
      [rt]: 0,
    },
  },
  blezl: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b010110,
      [rt]: 0,
    },
  },
  bltz: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0,
    },
  },
  bltzal: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b10000,
    },
  },
  bltzall: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b10010,
    },
  },
  bltzl: {
    format: "I",
    display: [rs, imm], // off
    known: {
      [op]: 0b000001,
      [rt]: 0b00010,
    },
  },
  bne: {
    format: "I",
    display: [rs, rt, imm], // off
    known: {
      [op]: 0b000101
    },
  },
  bnel: {
    format: "I",
    display: [rs, rt, imm], // off
    known: {
      [op]: 0b010101
    },
  },
  // break: {
  //   format: "BREAK",
  //   display: [],
  //   known: {
  //     break: 0b001101
  //   },
  // },
  cop0: {
    format: "J",
    shift: false,
    display: [imm], // cop_fun
    known: {
      [op]: 0b010000
    },
  },
  cop1: {
    format: "J",
    shift: false,
    display: [imm], // cop_fun
    known: {
      [op]: 0b010001
    },
  },
  cop2: {
    format: "J",
    shift: false,
    display: [imm], // cop_fun
    known: {
      [op]: 0b010010
    },
  },
  cop3: {
    format: "J",
    shift: false,
    display: [imm], // cop_fun
    known: {
      [op]: 0b010011
    },
  },
  dadd: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b101100
    },
  },
  daddi: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b011000
    },
  },
  daddiu: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b011001
    },
  },
  daddu: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b101101
    },
  },
  ddiv: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011110,
      [rd]: 0,
    },
  },
  ddivu: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011111,
      [rd]: 0,
    },
  },
  div: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011010,
      [rd]: 0,
    },
  },
  divu: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011011,
      [rd]: 0,
    },
  },
  dmult: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011100,
      [rd]: 0,
    },
  },
  dmultu: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011101,
      [rd]: 0,
    },
  },
  dsll: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b111000,
      [rs]: 0,
    },
  },
  dsll32: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b111100,
      [rs]: 0,
    },
  },
  dsllv: {
    format: "R",
    display: [rd, rt, rs],
    known: {
      [f]: 0b010100,
    },
  },
  dsra: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b111011,
      [rs]: 0,
    },
  },
  dsra32: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b111111,
      [rs]: 0,
    },
  },
  dsrav: {
    format: "R",
    display: [rd, rt, rs],
    known: {
      [f]: 0b010111,
    },
  },
  dsrl: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b111010,
      [rs]: 0,
    },
  },
  dsrl32: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b111110,
      [rs]: 0,
    },
  },
  dsrlv: {
    format: "R",
    display: [rd, rt, rs],
    known: {
      [f]: 0b010110,
    },
  },
  dsub: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b101110,
    },
  },
  dsubu: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b101111,
    },
  },
  j: {
    format: "J",
    shift: true,
    display: [imm],
    known: {
      [op]: 0b000010
    },
  },
  jal: {
    format: "J",
    shift: true,
    display: [imm],
    known: {
      [op]: 0b000011
    },
  },
  jalr: {
    format: "R",
    display: ["rd?", rs],
    known: {
      [f]: 0b001001,
      rt: 0,
      rd: 31 // Implied unless specified
    },
  },
  jr: {
    format: "R",
    display: [rs],
    known: {
      [f]: 0b001000,
      rt: 0,
      rd: 0
    },
  },
  lb: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100000
    },
  },
  lbu: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100100
    },
  },
  ld: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b110111
    },
  },
  ldc1: {
    format: "I",
    display: [ft, imm, rs], // off
    known: {
      [op]: 0b110101
    },
  },
  ldc2: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b110110
    },
  },
  ldl: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b011010
    },
  },
  ldr: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b011011
    },
  },
  lh: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100001
    },
  },
  lhu: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100101
    },
  },
  ll: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b110000
    },
  },
  lld: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b110100
    },
  },
  lui: {
    format: "I",
    display: [rt, imm],
    known: {
      [op]: 0b001111,
      [rs]: 0,
    },
  },
  lw: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100011
    },
  },
  lwc1: {
    format: "I",
    display: [ft, imm, rs], // off
    known: {
      [op]: 0b110001
    },
  },
  lwc2: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b110010
    },
  },
  lwc3: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b110011
    },
  },
  lwl: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100010
    },
  },
  lwr: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100110
    },
  },
  lwu: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b100111
    },
  },
  mfhi: {
    format: "R",
    display: [rd],
    known: {
      [f]: 0b010000,
      [rs]: 0,
      [rd]: 0,
    },
  },
  mflo: {
    format: "R",
    display: [rd],
    known: {
      [f]: 0b010010,
      [rs]: 0,
      [rd]: 0,
    },
  },
  movn: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b001011,
    },
  },
  movz: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b001010,
    },
  },
  mthi: {
    format: "R",
    display: [rs],
    known: {
      [f]: 0b010001,
      [rt]: 0,
      [rd]: 0,
    },
  },
  mtlo: {
    format: "R",
    display: [rs],
    known: {
      [f]: 0b010011
    },
  },
  mult: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011000,
      [rd]: 0,
    },
  },
  multu: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b011001,
      [rd]: 0,
    },
  },
  // nop: {
  //   format: "R",
  //   display: [],
  //   known: {
  //   },
  // },
  nor: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100111
    },
  },
  or: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100101
    },
  },
  ori: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001101
    },
  },
  pref: {
    format: "I",
    display: [rt, imm, rs], // hint, offset, base
    known: {
      [op]: 0b110011
    },
  },
  sb: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b101000
    },
  },
  sc: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b111000
    },
  },
  scd: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b111100
    },
  },
  sd: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b111111
    },
  },
  sdc1: {
    format: "I",
    display: [ft, imm, rs], // off
    known: {
      [op]: 0b111101
    },
  },
  sdc2: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b111110
    },
  },
  sdl: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b101100
    },
  },
  sdr: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b101101
    },
  },
  sh: {
    format: "I",
    display: [rt, imm, rs], // off
    known: {
      [op]: 0b101001
    },
  },
  sll: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0
    },
  },
  sllv: {
    format: "R",
    display: [rd, rt, rs],
    known: {
      [f]: 0b000100
    },
  },
  slt: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b101010
    },
  },
  slti: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001010
    },
  },
  sltiu: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001011
    },
  },
  sltu: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b101011
    },
  },
  sra: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b000011
    },
  },
  srav: {
    format: "R",
    display: [rd, rt, rs],
    known: {
      [f]: 0b000111
    },
  },
  srl: {
    format: "R",
    display: [rd, rt, sa],
    known: {
      [f]: 0b000010
    },
  },
  srlv: {
    format: "R",
    display: [rd, rt, rs],
    known: {
      [f]: 0b000110
    },
  },
  sub: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100010
    },
  },
  subu: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100011
    },
  },
  sw: {
    format: "I",
    display: [rt, imm, rs],
    known: {
      [op]: 0b101011
    },
  },
  swc1: {
    format: "I",
    display: [ft, imm, rs],
    known: {
      [op]: 0b111001
    },
  },
  swc2: {
    format: "I",
    display: [rt, imm, rs],
    known: {
      [op]: 0b111010
    },
  },
  swc3: {
    format: "I",
    display: [rt, imm, rs],
    known: {
      [op]: 0b111011
    },
  },
  swl: {
    format: "I",
    display: [rt, imm, rs],
    known: {
      [op]: 0b101010
    },
  },
  swr: {
    format: "I",
    display: [rt, imm, rs],
    known: {
      [op]: 0b101110
    },
  },
  sync: {
    format: "R",
    display: [],
    known: {
      [f]: 0b001111,
      [sa]: 0,
      [rs]: 0,
      [rt]: 0,
      [rd]: 0,
    },
  },
  // syscall: {
  //   format: "SYSCALL",
  //   display: [],
  //   known: {
  //     [f]: 0b001100,
  //   },
  // },
  teq: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b110100
    },
  },
  teqi: {
    format: "I",
    display: [rs, imm],
    known: {
      [op]: 0b000001,
      [rt]: 0b01100,
    },
  },
  tge: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b110000,
    },
  },
  tgei: {
    format: "I",
    display: [rs, imm],
    known: {
      [op]: 0b000001,
      [rt]: 0b01000,
    },
  },
  tgeiu: {
    format: "I",
    display: [rs, imm],
    known: {
      [op]: 0b000001,
      [rt]: 0b01001,
    },
  },
  tgeu: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b110001,
    },
  },
  tlt: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b110010,
    },
  },
  tlti: {
    format: "I",
    display: [rs, imm],
    known: {
      [op]: 0b000001,
      [rt]: 0b01010,
    },
  },
  tltiu: {
    format: "I",
    display: [rs, imm],
    known: {
      [op]: 0b000001,
      [rt]: 0b01011,
    },
  },
  tltu: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b110011,
    },
  },
  tne: {
    format: "R",
    display: [rs, rt],
    known: {
      [f]: 0b110110,
    },
  },
  tnei: {
    format: "I",
    display: [rs, imm],
    known: {
      [op]: 0b000001,
      [rt]: 0b01110,
    },
  },
  xor: {
    format: "R",
    display: [rd, rs, rt],
    known: {
      [f]: 0b100110
    },
  },
  xori: {
    format: "I",
    display: [rt, rs, imm],
    known: {
      [op]: 0b001110
    },
  }
};
