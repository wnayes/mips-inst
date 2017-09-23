exports.testCases = [
  ["ADDU A0 A2 R0", 0x00C02021],
  ["ADDU A0 S1 R0", 0x02202021],
  ["JAL 0x1F120", 0x0C007C48],
  ["ADDIU SP SP 0x28", 0x27BD0028],
  ["ADDIU SP SP -0x18", 0x27BDFFE8], // 0xFFE8
  ["LH A0 0(V0)", 0x84440000],
  ["LUI A0 0x3F", 0x3C04003F],
  ["BGEZAL R0 0x3", 0x04110003],
  ["SLL V1 A1 0x6", 0x00051980],
  ["SRA V0 V0 0x10", 0x00021403],
  ["JR RA", 0x03E00008],
  ["JALR V0", 0x0040F809],
  ["JALR SP V0", 0x0040E809],
  ["BREAK", 0x0000000D],
  ["SYSCALL", 0x0000000C],
  ["NOP", 0x00000000],

  // Comma tests
  ["ADDU A0, A2, R0", 0x00C02021, { commas: true }],
  ["LUI A0, 0x3F", 0x3C04003F, { commas: true }],
  ["LH A0, 0(V0)", 0x84440000, { commas: true }],
  ["JAL 0x1F120", 0x0C007C48, { commas: true }],
  ["JALR SP, V0", 0x0040E809, { commas: true }],

  // include$ tests
  ["ADDU $A0 $A2 $R0", 0x00C02021, { include$: true }],
  ["LUI $A0 0x3F", 0x3C04003F, { include$: true }],
  ["LH $A0 0($V0)", 0x84440000, { include$: true }],
  ["JAL 0x1F120", 0x0C007C48, { include$: true }],
  ["JALR $SP $V0", 0x0040E809, { include$: true }],

  // casing tests
  ["addu a0 a2 r0", 0x00C02021, { casing: "toLowerCase" }],
  ["lui a0 0x3f", 0x3C04003F, { casing: "toLowerCase" }],
  ["lh a0 0(v0)", 0x84440000, { casing: "toLowerCase" }],
  ["jal 0x1f120", 0x0C007C48, { casing: "toLowerCase" }],
  ["jalr sp v0", 0x0040E809, { casing: "toLowerCase" }],

  // numbase tests
  ["LUI A0 63", 0x3C04003F, { numBase: 10 }],
  ["LH A0 0(V0)", 0x84440000, { numBase: 10 }],
  ["JAL 127264", 0x0C007C48, { numBase: 10 }],
  ["ADDIU SP SP -24", 0x27BDFFE8, { numBase: 10 }],
  ["ADDIU SP SP -0o30", 0x27BDFFE8, { numBase: 8 }],
  ["ADDIU SP SP -0b11000", 0x27BDFFE8, { numBase: 2 }],
];
