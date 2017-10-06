exports.testCases = [
  ["ADDU A0 A2 R0", 0x00C02021],
  ["ADDU A0 S1 R0", 0x02202021],
  ["SUBU A0 S1 V0", 0x02222023],
  ["JAL 0x1F120", 0x0C007C48],
  ["ADDIU SP SP 0x28", 0x27BD0028],
  ["ADDIU SP SP 0xFFE8", 0x27BDFFE8],
  ["LH A0 0(V0)", 0x84440000],
  ["LB V0 0(V1)", 0x80620000],
  ["LUI A0 0x3F", 0x3C04003F],
  ["ORI A3 T9 0x1700", 0x37271700],
  ["BLTZL V0 0x1", 0x04420001],
  ["BGEZAL R0 0x3", 0x04110003],
  ["SLL V1 A1 0x6", 0x00051980],
  ["SRA V0 V0 0x10", 0x00021403],
  ["JR RA", 0x03E00008],
  ["JALR V0", 0x0040F809],
  ["JALR SP V0", 0x0040E809],
  ["J 0xFFFFFFC", 0x0BFFFFFF],
  ["JAL 0xFFFFFFC", 0x0FFFFFFF],
  ["COP0 0x20", 0x40000020],
  ["COP1 0xFFFF", 0x4400FFFF],
  ["COP2 0xF1F1F1", 0x48F1F1F1],
  ["COP3 0x3FFFFFF", 0x4FFFFFFF],
  ["LDC2 S4 0x20(SP)", 0xDBB40020],
  ["MFHI R0", 0x00000010],
  ["TGE A3 S0", 0x00F00030],
  ["TLTU T0 S1", 0x01110033],
  ["DSLLV R0 R0 R0", 0x00000014],
  ["DDIV R0 R0", 0x0000001E],
  ["SYNC", 0x0000000F],
  ["BREAK", 0x0000000D],
  ["SYSCALL", 0x0000000C],
  ["NOP", 0x00000000],

  // FPU-related
  ["LDC1 F20 0x20(SP)", 0xD7B40020],
  ["SDC1 F20 0x20(SP)", 0xF7B40020],
  ["LWC1 F2 0x40(S0)", 0xC6020040],
  ["SWC1 F24 0x8(V0)", 0xE4580008],
  ["ADD.S F26 F26 F0", 0x4600D680],
  ["ADD.D F26 F26 F0", 0x4620D680],
  ["BC1F 0x200", 0x45000200],
  ["BC1F 0x6 0x200", 0x45180200],
  ["MOV.S F0 F0", 0x46000006],
  ["MUL.D F0 F0 F4", 0x46240002],
  ["CEIL.L.S F0 F0", 0x4600000A],
  ["CVT.D.W F0 F0", 0x46800021],
  ["CVT.S.D F0 F0", 0x46200020],
  ["TRUNC.W.S F2 F0", 0x4600008D],
  ["C.LE.S F0 F12", 0x460C003E],
  ["C.LT.S F12 F0", 0x4600603C],

  // Comma tests
  ["ADDU A0, A2, R0", 0x00C02021, { commas: true }],
  ["LUI A0, 0x3F", 0x3C04003F, { commas: true }],
  ["LH A0, 0(V0)", 0x84440000, { commas: true }],
  ["JAL 0x1F120", 0x0C007C48, { commas: true }],
  ["JALR V0", 0x0040F809, { commas: true }],
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
  ["ADDIU SP SP 65512", 0x27BDFFE8, { numBase: 10 }],
  ["ADDIU SP SP 0o177750", 0x27BDFFE8, { numBase: 8 }],
  ["ADDIU SP SP 0b1111111111101000", 0x27BDFFE8, { numBase: 2 }],
];
