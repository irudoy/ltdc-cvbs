import type { Register, RegisterGroup } from './types'

export const configRegisters: (Register | RegisterGroup)[] = [
  {
    address: 0x00,
    name: 'Power Mode',
    resetValue: 0x12,
    fields: [
      {
        name: 'Sleep Mode',
        description:
          'With this control enabled, the current consumption is reduced to µA level. All DACs and the internal PLL circuit are disabled. Registers can be read from and written to in sleep mode',
        bitStart: 0,
        bitEnd: 0,
        type: 'boolean',
        booleanDescription: {
          true: 'Sleep mode on',
          false: 'Sleep mode off',
        },
      },
      {
        name: 'PLL Control',
        description:
          'PLL and oversampling control. This control allows the internal PLL circuit to be powered down and the oversampling to be switched off',
        bitStart: 1,
        bitEnd: 1,
        type: 'boolean',
        booleanDescription: {
          true: 'PLL off',
          false: 'PLL on',
        },
      },
      {
        name: 'DAC3 Power',
        description: 'DAC 3: power on/off',
        bitStart: 2,
        bitEnd: 2,
        type: 'boolean',
        booleanDescription: {
          true: 'DAC 3 on',
          false: 'DAC 3 off',
        },
      },
      {
        name: 'DAC2 Power',
        description: 'DAC 2: power on/off',
        bitStart: 3,
        bitEnd: 3,
        type: 'boolean',
        booleanDescription: {
          true: 'DAC 2 on',
          false: 'DAC 2 off',
        },
      },
      {
        name: 'DAC1 Power',
        description: 'DAC 1: power on/off',
        bitStart: 4,
        bitEnd: 4,
        type: 'boolean',
        booleanDescription: {
          true: 'DAC 1 on',
          false: 'DAC 1 off',
        },
      },
      {
        name: 'Reserved',
        bitStart: 5,
        bitEnd: 5,
        type: 'boolean',
      },
      {
        name: 'Reserved',
        bitStart: 6,
        bitEnd: 6,
        type: 'boolean',
      },
      {
        name: 'Reserved',
        bitStart: 7,
        bitEnd: 7,
        type: 'boolean',
      },
    ],
  },
  {
    address: 0x01,
    name: 'Mode Select',
    resetValue: 0x00,
    fields: [
      {
        name: 'Reserved',
        bitStart: 0,
        bitEnd: 0,
        type: 'boolean',
      },
      {
        name: 'DDR Clock Edge Alignment',
        description:
          'DDR clock edge alignment (used only for ED2 and HD DDR modes)',
        bitStart: 1,
        bitEnd: 2,
        type: 'enum',
        options: [
          { value: 0b00, label: 'Chroma rising, Luma falling' },
          { value: 0b01, label: 'Reserved' },
          { value: 0b10, label: 'Reserved' },
          { value: 0b11, label: 'Luma rising, Chroma falling' },
        ],
      },
      {
        name: 'Reserved',
        bitStart: 3,
        bitEnd: 3,
        type: 'boolean',
      },
      {
        name: 'Input Mode',
        bitStart: 4,
        bitEnd: 6,
        type: 'enum',
        options: [
          { value: 0b000, label: 'SD input' },
          { value: 0b001, label: 'ED/HD-SDR input' },
          { value: 0b010, label: 'ED/HD-DDR input' },
          { value: 0b011, label: 'Reserved' },
          { value: 0b100, label: 'Reserved' },
          { value: 0b101, label: 'Reserved' },
          { value: 0b110, label: 'Reserved' },
          { value: 0b111, label: 'ED (54 MHz) input' },
        ],
      },
      {
        name: 'Reserved',
        bitStart: 7,
        bitEnd: 7,
        type: 'boolean',
      },
    ],
  },
  {
    address: 0x02,
    name: 'Mode Register 0',
    resetValue: 0x20,
    fields: [
      {
        name: 'Reserved',
        description: 'Zero must be written to this bit',
        bitStart: 0,
        bitEnd: 0,
        type: 'boolean',
      },
      {
        name: 'HD interlace external VSYNC and HSYNC',
        description:
          'If using HD HSYNC/VSYNCinterlace mode, setting this bit to 1 is recommended (see the HD Interlace External HSYNC and VSYNC Considerations section for more information)',
        bitStart: 1,
        bitEnd: 1,
        type: 'boolean',
        booleanDescription: {
          true: 'External',
          false: 'Default',
        },
      },
      {
        name: 'Test pattern black bar',
        description:
          'Subaddress 0x31, Bit 2 must also be enabled (ED/HD). Subaddress 0x84, Bit 6 must also be enabled (SD)',
        bitStart: 2,
        bitEnd: 2,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'Manual CSC matrix adjust',
        bitStart: 3,
        bitEnd: 3,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'Sync on RGB',
        bitStart: 4,
        bitEnd: 4,
        type: 'boolean',
        booleanDescription: {
          true: 'Sync on all RGB outputs',
          false: 'No sync',
        },
      },
      {
        name: 'RGB/YPrPb output select',
        bitStart: 5,
        bitEnd: 5,
        type: 'boolean',
        booleanDescription: {
          true: 'YPrPb component outputs',
          false: 'RGB component outputs',
        },
      },
      {
        name: 'SD sync output enable',
        bitStart: 6,
        bitEnd: 6,
        type: 'boolean',
        booleanDescription: {
          true: 'Output SD syncs on HSYNC and VSYNC pins',
          false: 'No sync output',
        },
      },
      {
        name: 'ED/HD sync output enable',
        bitStart: 7,
        bitEnd: 7,
        type: 'boolean',
        booleanDescription: {
          true: 'Output ED/HD syncs on HSYNC and VSYNC pins',
          false: 'No sync output',
        },
      },
    ],
  },

  // 0x03 ED/HD CSC Matrix 0
  // 0x04 ED/HD CSC Matrix 1
  // 0x05 ED/HD CSC Matrix 2
  // 0x06 ED/HD CSC Matrix 3
  // 0x07 ED/HD CSC Matrix 4
  // 0x08 ED/HD CSC Matrix 5
  // 0x09 ED/HD CSC Matrix 6

  // {
  //   address: 0x0b,
  //   name: 'DAC 1, DAC 2, DAC 3 output levels',
  //   resetValue: 0x00,
  //   fields: [
  //     {
  //       name: 'Gain',
  //       description:
  //         '0-64 - positive gain: 0[+0%]; 64[+7.5%]; 192-255 - negative gain: 192[-7.5%]; 255[-0.018%];',
  //       bitStart: 0,
  //       bitEnd: 7,
  //       type: 'int',
  //     },
  //   ],
  // },
  // {
  //   address: 0x0d,
  //   name: 'DAC power mode',
  //   resetValue: 0x00,
  //   fields: [
  //     {
  //       name: 'DAC 1 low power mode',
  //       bitStart: 0,
  //       bitEnd: 0,
  //       type: 'boolean',
  //       booleanDescription: {
  //         true: 'Enabled',
  //         false: 'Disabled',
  //       },
  //     },
  //     {
  //       name: 'DAC 2 low power mode',
  //       bitStart: 1,
  //       bitEnd: 1,
  //       type: 'boolean',
  //       booleanDescription: {
  //         true: 'Enabled',
  //         false: 'Disabled',
  //       },
  //     },
  //     {
  //       name: 'DAC 3 low power mode',
  //       bitStart: 2,
  //       bitEnd: 2,
  //       type: 'boolean',
  //       booleanDescription: {
  //         true: 'Enabled',
  //         false: 'Disabled',
  //       },
  //     },
  //     {
  //       name: 'SD/ED oversample rate select',
  //       bitStart: 3,
  //       bitEnd: 3,
  //       type: 'boolean',
  //       booleanDescription: {
  //         true: 'SD = 8x, ED = 4x',
  //         false: 'SD = 16x, ED = 8x',
  //       },
  //     },
  //     {
  //       name: 'Reserved',
  //       bitStart: 4,
  //       bitEnd: 4,
  //       type: 'boolean',
  //     },
  //     {
  //       name: 'Reserved',
  //       bitStart: 5,
  //       bitEnd: 5,
  //       type: 'boolean',
  //     },
  //     {
  //       name: 'Reserved',
  //       bitStart: 6,
  //       bitEnd: 6,
  //       type: 'boolean',
  //     },
  //     {
  //       name: 'Reserved',
  //       bitStart: 7,
  //       bitEnd: 7,
  //       type: 'boolean',
  //     },
  //   ],
  // },
  // {
  //   address: 0x10,
  //   name: 'Cable detection',
  //   resetValue: 0x00,
  //   fields: [
  //     {
  //       name: 'DAC 1 cable detect',
  //       bitStart: 0,
  //       bitEnd: 0,
  //       type: 'boolean',
  //       booleanDescription: {
  //         true: 'DAC 1 unconnected',
  //         false: 'Cable detected on DAC 1',
  //       },
  //       readonly: true,
  //     },
  //     {
  //       name: 'DAC 2 cable detect',
  //       bitStart: 1,
  //       bitEnd: 1,
  //       type: 'boolean',
  //       booleanDescription: {
  //         true: 'DAC 2 unconnected',
  //         false: 'Cable detected on DAC 2',
  //       },
  //       readonly: true,
  //     },
  //     {
  //       name: 'Reserved',
  //       bitStart: 2,
  //       bitEnd: 2,
  //       type: 'boolean',
  //     },
  //     {
  //       name: 'Reserved',
  //       bitStart: 3,
  //       bitEnd: 3,
  //       type: 'boolean',
  //     },
  //     {
  //       name: 'Unconnected DAC autopower-down',
  //       bitStart: 4,
  //       bitEnd: 4,
  //       type: 'boolean',
  //       booleanDescription: {
  //         true: 'DAC autopower-down enable',
  //         false: 'DAC autopower-down disable',
  //       },
  //     },
  //     {
  //       name: 'Reserved',
  //       bitStart: 5,
  //       bitEnd: 5,
  //       type: 'boolean',
  //     },
  //     {
  //       name: 'Reserved',
  //       bitStart: 6,
  //       bitEnd: 6,
  //       type: 'boolean',
  //     },
  //     {
  //       name: 'Reserved',
  //       bitStart: 7,
  //       bitEnd: 7,
  //       type: 'boolean',
  //     },
  //   ],
  // },

  // 0x13 Pixel Port Readback A (1)
  // 0x14 Pixel Port Readback B (1)
  // 0x16 Control port readback (1)
  // (1) For correct operation, Subaddress 0x01[6:4] must equal the default value of 000
  // 0x17 Software reset: Writing a 1 to b1 resets the device; this is a selfclearing bit

  // 0x30 ED/HD Mode Register 1
  // 0x31 ED/HD Mode Register 2
  // 0x32 ED/HD Mode Register 3
  // 0x33 ED/HD Mode Register 4
  // 0x34 ED/HD Mode Register 5
  // 0x35 ED/HD Mode Register 6
  // 0x36 ED/HD Y level
  // 0x37 ED/HD Cr level
  // 0x38 ED/HD Cb level
  // 0x39 ED/HD Mode Register 7
  // 0X3A ED/HD Mode Register 8
  // 0x40 ED/HD sharpness filter gain
  // 0x41 ED/HD CGMS Data 0
  // 0x42 ED/HD CGMS Data 1
  // 0x43 ED/HD CGMS Data 2
  // 0x44-0x4D ED/HD Gamma A0-A9
  // 0x4E-0x57 ED/HD Gamma B0-B9
  // 0x58 ED/HD Adaptive Filter Gain 1
  // 0x59 ED/HD Adaptive Filter Gain 2
  // 0x5A ED/HD Adaptive Filter Gain 3
  // 0x5B ED/HD Adaptive Filter Threshold A
  // 0x5C ED/HD Adaptive Filter Threshold B
  // 0x5D ED/HD Adaptive Filter Threshold C
  // 0x5E-0x6E ED/HD CGMS Type B Register 0-16

  {
    address: 0x80,
    name: 'SD Mode Register 1',
    resetValue: 0x10,
    fields: [
      {
        name: 'SD standard',
        bitStart: 0,
        bitEnd: 1,
        type: 'enum',
        options: [
          { value: 0b00, label: 'NTSC' },
          { value: 0b01, label: 'PAL B, PAL D, PAL G, PAL H, PAL I' },
          { value: 0b10, label: 'PAL M' },
          { value: 0b11, label: 'PAL N' },
        ],
      },
      {
        name: 'SD luma filter',
        bitStart: 2,
        bitEnd: 4,
        type: 'enum',
        options: [
          { value: 0b000, label: 'LPF NTSC' },
          { value: 0b001, label: 'LPF PAL' },
          { value: 0b010, label: 'Notch NTSC' },
          { value: 0b011, label: 'Notch PAL' },
          { value: 0b100, label: 'Luma SSAF' },
          { value: 0b101, label: 'Luma CIF' },
          { value: 0b110, label: 'Luma QCIF' },
          { value: 0b111, label: 'Reserved' },
        ],
      },
      {
        name: 'SD chroma filter',
        bitStart: 5,
        bitEnd: 7,
        type: 'enum',
        options: [
          { value: 0b000, label: '1.3 MHz' },
          { value: 0b001, label: '0.65 MHz' },
          { value: 0b010, label: '1.0 MHz' },
          { value: 0b011, label: '2.0 MHz' },
          { value: 0b100, label: 'Reserved' },
          { value: 0b101, label: 'Chroma CIF' },
          { value: 0b110, label: 'Chroma QCIF' },
          { value: 0b111, label: '3.0 MHz' },
        ],
      },
    ],
  },
  {
    address: 0x82,
    name: 'SD Mode Register 2',
    resetValue: 0x0b,
    fields: [
      {
        name: 'SD PrPb SSAF filter',
        bitStart: 0,
        bitEnd: 0,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD DAC Output 1',
        description: 'See Table 37 in datasheet',
        bitStart: 1,
        bitEnd: 1,
        type: 'boolean',
        booleanDescription: {
          true: 'CVBS',
          false: 'G/Y',
        },
      },
      {
        name: 'Reserved',
        bitStart: 2,
        bitEnd: 2,
        type: 'boolean',
      },
      {
        name: 'SD pedestal',
        bitStart: 3,
        bitEnd: 3,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD square pixel mode',
        bitStart: 4,
        bitEnd: 4,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD VCR FF/RW sync',
        bitStart: 5,
        bitEnd: 5,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD pixel data valid',
        bitStart: 6,
        bitEnd: 6,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD active video edge control',
        bitStart: 7,
        bitEnd: 7,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
    ],
  },
  {
    address: 0x83,
    name: 'SD Mode Register 3',
    resetValue: 0x04,
    fields: [
      {
        name: 'SD pedestal YPrPb output',
        bitStart: 0,
        bitEnd: 0,
        type: 'boolean',
        booleanDescription: {
          true: '7.5 IRE pedestal on YPrPb',
          false: 'No pedestal on YPrPb',
        },
      },
      {
        name: 'SD Output Levels Y',
        bitStart: 1,
        bitEnd: 1,
        type: 'boolean',
        booleanDescription: {
          true: 'Y = 714 mV/286 mV',
          false: 'Y = 700 mV/300 mV',
        },
      },
      {
        name: 'SD Output Levels PrPb',
        bitStart: 2,
        bitEnd: 3,
        type: 'enum',
        options: [
          { value: 0b00, label: '700 mV p-p (PAL), 1000 mV p-p (NTSC)' },
          { value: 0b01, label: '700 mV p-p' },
          { value: 0b10, label: '1000 mV p-p' },
          { value: 0b11, label: '648 mV p-p' },
        ],
      },
      {
        name: 'SD vertical blanking interval (VBI) open',
        bitStart: 4,
        bitEnd: 4,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD closed captioning field control',
        bitStart: 5,
        bitEnd: 6,
        type: 'enum',
        options: [
          { value: 0b00, label: 'Disabled' },
          { value: 0b01, label: 'On odd field only' },
          { value: 0b10, label: 'On even field only' },
          { value: 0b11, label: 'On both fields' },
        ],
      },
      {
        name: 'Reserved',
        bitStart: 7,
        bitEnd: 7,
        type: 'boolean',
      },
    ],
  },
  {
    address: 0x84,
    name: 'SD Mode Register 4',
    resetValue: 0x00,
    fields: [
      {
        name: 'Reserved',
        bitStart: 0,
        bitEnd: 0,
        type: 'boolean',
      },
      {
        name: 'SD SFL/SCR/TR mode select',
        bitStart: 1,
        bitEnd: 2,
        type: 'enum',
        options: [
          { value: 0b00, label: 'Disabled' },
          { value: 0b11, label: 'SFL mode enabled' },
        ],
      },
      {
        name: 'SD active video length',
        bitStart: 3,
        bitEnd: 3,
        type: 'boolean',
        booleanDescription: {
          true: '710 (NTSC), 702 (PAL)',
          false: '720 pixels',
        },
      },
      {
        name: 'SD chroma',
        bitStart: 4,
        bitEnd: 4,
        type: 'boolean',
        booleanDescription: {
          true: 'Disabled',
          false: 'Enabled',
        },
      },
      {
        name: 'SD burst',
        bitStart: 5,
        bitEnd: 5,
        type: 'boolean',
        booleanDescription: {
          true: 'Disabled',
          false: 'Enabled',
        },
      },
      {
        name: 'SD color bars',
        bitStart: 6,
        bitEnd: 6,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD luma/chroma swap',
        bitStart: 7,
        bitEnd: 7,
        type: 'boolean',
        booleanDescription: {
          true: 'DAC 2 = chroma, DAC 3 = luma',
          false: 'DAC 2 = luma, DAC 3 = chroma',
        },
      },
    ],
  },
  {
    address: 0x86,
    name: 'SD Mode Register 5',
    resetValue: 0x02,
    fields: [
      {
        name: 'NTSC color subcarrier adjust',
        description:
          'Delay from the falling edge of output HSYNC pulse to the start of color burst',
        bitStart: 0,
        bitEnd: 1,
        type: 'enum',
        options: [
          { value: 0b00, label: '5.17 μs' },
          { value: 0b01, label: '5.31 μs' },
          { value: 0b10, label: '5.59 μs (Macrovision)' },
          { value: 0b11, label: 'Reserved' },
        ],
      },
      {
        name: 'Reserved',
        bitStart: 2,
        bitEnd: 2,
        type: 'boolean',
      },
      {
        name: 'SD EIA/CEA-861B synchronization compliance',
        bitStart: 3,
        bitEnd: 3,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'Reserved',
        bitStart: 4,
        bitEnd: 4,
        type: 'boolean',
      },
      {
        name: 'Reserved',
        bitStart: 5,
        bitEnd: 5,
        type: 'boolean',
      },
      {
        name: 'SD horizontal/vertical counter mode',
        description:
          'When set to 0, the horizontal/vertical counters automatically wrap around at the end of the line/field/frame of the selected standard. When set to 1, the horizontal/vertical counters are free running and wrap around when external sync signals indicate to do so',
        bitStart: 6,
        bitEnd: 6,
        type: 'boolean',
        booleanDescription: {
          true: 'Field/line counter free running',
          false: 'Update field/line counter',
        },
      },
      {
        name: 'SD RGB color swap',
        bitStart: 7,
        bitEnd: 7,
        type: 'boolean',
        booleanDescription: {
          true: 'Color reversal enabled',
          false: 'Normal',
        },
      },
    ],
  },
  {
    address: 0x87,
    name: 'SD Mode Register 6',
    resetValue: 0x00,
    fields: [
      {
        name: 'SD luma and color scale control',
        bitStart: 0,
        bitEnd: 0,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD luma scale saturation',
        bitStart: 1,
        bitEnd: 1,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD hue adjust',
        bitStart: 2,
        bitEnd: 2,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD brightness',
        bitStart: 3,
        bitEnd: 3,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD luma SSAF gain',
        bitStart: 4,
        bitEnd: 4,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD input standard autodetection',
        bitStart: 5,
        bitEnd: 5,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'Reserved',
        description: '0 must be written to this bit',
        bitStart: 6,
        bitEnd: 6,
        type: 'boolean',
      },
      {
        name: 'SD RGB input enable',
        bitStart: 7,
        bitEnd: 7,
        type: 'boolean',
        booleanDescription: {
          true: 'SD RGB input',
          false: 'SD YCrCb input',
        },
      },
    ],
  },
  {
    address: 0x88,
    name: 'SD Mode Register 7',
    resetValue: 0x00,
    fields: [
      {
        name: 'Reserved',
        bitStart: 0,
        bitEnd: 0,
        type: 'boolean',
      },
      {
        name: 'SD noninterlaced mode',
        bitStart: 1,
        bitEnd: 1,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD double buffering',
        bitStart: 2,
        bitEnd: 2,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD input format',
        bitStart: 3,
        bitEnd: 4,
        type: 'enum',
        options: [
          { value: 0b00, label: '8-bit YCbCr input' },
          { value: 0b01, label: '16-bit YCbCr input' },
          { value: 0b10, label: '10-bit YCbCr/16-bit SD RGB input' },
          { value: 0b11, label: 'Reserved' },
        ],
      },
      {
        name: 'SD digital noise reduction',
        bitStart: 5,
        bitEnd: 5,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD gamma correction enable',
        bitStart: 6,
        bitEnd: 6,
        type: 'boolean',
        booleanDescription: {
          true: 'Enabled',
          false: 'Disabled',
        },
      },
      {
        name: 'SD gamma correction curve select',
        bitStart: 7,
        bitEnd: 7,
        type: 'enum',
        options: [
          { value: 0b0, label: 'Curve A' },
          { value: 0b1, label: 'Curve B' },
        ],
      },
    ],
  },
  {
    address: 0x89,
    name: 'SD Mode Register 8',
    resetValue: 0x00,
    fields: [
      {
        name: 'SD undershoot limiter',
        bitStart: 0,
        bitEnd: 1,
        type: 'enum',
        options: [
          { value: 0b00, label: 'Disabled' },
          { value: 0b01, label: '−11 IRE' },
          { value: 0b10, label: '−6 IRE' },
          { value: 0b11, label: '−1.5 IRE' },
        ],
      },
      {
        name: 'Reserved',
        description: '0 must be written to this bit',
        bitStart: 2,
        bitEnd: 2,
        type: 'boolean',
      },
      {
        name: 'Reserved',
        bitStart: 3,
        bitEnd: 3,
        type: 'boolean',
      },
      {
        name: 'SD chroma delay',
        bitStart: 4,
        bitEnd: 5,
        type: 'enum',
        options: [
          { value: 0b00, label: 'Disabled' },
          { value: 0b01, label: '4 clock cycles' },
          { value: 0b10, label: '8 clock cycles' },
          { value: 0b11, label: 'Reserved' },
        ],
      },
      {
        name: 'Reserved',
        description: '0 must be written to this bit',
        bitStart: 6,
        bitEnd: 6,
        type: 'boolean',
      },
      {
        name: 'Reserved',
        description: '0 must be written to this bit',
        bitStart: 7,
        bitEnd: 7,
        type: 'boolean',
      },
    ],
  },
  {
    address: 0x8a,
    name: 'SD Timing Register 0',
    resetValue: 0x08,
    fields: [
      {
        name: 'SD slave/master mode',
        bitStart: 0,
        bitEnd: 0,
        type: 'boolean',
        booleanDescription: {
          true: 'Master mode',
          false: 'Slave mode',
        },
      },
      {
        name: 'SD timing mode',
        bitStart: 1,
        bitEnd: 2,
        type: 'enum',
        options: [
          { value: 0b00, label: 'Mode 0' },
          { value: 0b01, label: 'Mode 1' },
          { value: 0b10, label: 'Mode 2' },
          { value: 0b11, label: 'Mode 3' },
        ],
      },
      {
        name: 'Reserved',
        description: '1 must be written to this bit',
        bitStart: 3,
        bitEnd: 3,
        type: 'boolean',
      },
      {
        name: 'SD luma delay',
        bitStart: 4,
        bitEnd: 5,
        type: 'enum',
        options: [
          { value: 0b00, label: 'No delay' },
          { value: 0b01, label: 'Two clock cycles' },
          { value: 0b10, label: 'Four clock cycles' },
          { value: 0b11, label: 'Six clock cycles' },
        ],
      },
      {
        name: 'SD minimum luma value',
        bitStart: 6,
        bitEnd: 6,
        type: 'enum',
        options: [
          { value: 0b0, label: '−40 IRE' },
          { value: 0b1, label: '−7.5 IRE' },
        ],
      },
      {
        name: 'SD timing reset',
        description:
          'A low-high-low transition resets the internal SD timing counters',
        bitStart: 7,
        bitEnd: 7,
        type: 'boolean',
      },
    ],
  },
  {
    address: 0x8b,
    name: 'SD Timing Register 1',
    description:
      'Applicable in master modes only, that is, Subaddress 0x8A, Bit 0 = 1',
    resetValue: 0x00,
    fields: [
      {
        name: 'SD HSYNC width',
        bitStart: 0,
        bitEnd: 1,
        type: 'enum',
        options: [
          { value: 0b00, label: 'ta = 1 clock cycle' },
          { value: 0b01, label: 'ta = 4 clock cycles' },
          { value: 0b10, label: 'ta = 16 clock cycles' },
          { value: 0b11, label: 'ta = 128 clock cycles' },
        ],
      },
      {
        name: 'SD HSYNC to VSYNC delay',
        bitStart: 2,
        bitEnd: 3,
        type: 'enum',
        options: [
          { value: 0b00, label: 'tb = 0 clock cycles' },
          { value: 0b01, label: 'tb = 4 clock cycles' },
          { value: 0b10, label: 'tb = 8 clock cycles' },
          { value: 0b11, label: 'tb = 18 clock cycles' },
        ],
      },
      {
        name: 'SD VSYNC width',
        description:
          'SD VSYNC width (Mode 2 only) / SD HSYNC to VSYNC rising edge delay (Mode 1 only)',
        bitStart: 4,
        bitEnd: 5,
        type: 'enum',
        options: [
          { value: 0b00, label: '1 clock cycle (m2) / tc = tb (m1)' },
          {
            value: 0b01,
            label: '4 clock cycles (m2) / tc = tb + 32 µs (m1)',
          },
          { value: 0b10, label: '16 clock cycles' },
          { value: 0b11, label: '128 clock cycles' },
        ],
      },
      {
        name: 'SD HSYNC to pixel data adjust',
        bitStart: 6,
        bitEnd: 7,
        type: 'enum',
        options: [
          { value: 0b00, label: '0 clock cycles' },
          { value: 0b01, label: '1 clock cycle' },
          { value: 0b10, label: '2 clock cycles' },
          { value: 0b11, label: '3 clock cycles' },
        ],
      },
    ],
  },
  // {
  //   type: 'group',
  //   id: 'sd_fsc',
  //   name: 'SD Subcarrier Frequency',
  //   description: 'SD Subcarrier Frequency Combined',
  // },
  // {
  //   address: 0x8c,
  //   name: 'SD Fsc Register 0',
  //   description: 'Subcarrier Frequency Bits[7:0]',
  //   group: 'sd_fsc',
  //   resetValue: 0x1f,
  //   fields: [
  //     {
  //       name: 'Frequency Value',
  //       description: 'Subcarrier Frequency Bits[7:0]',
  //       bitStart: 0,
  //       bitEnd: 7,
  //       type: 'hex',
  //     },
  //   ],
  // },
  // {
  //   address: 0x8d,
  //   name: 'SD Fsc Register 1',
  //   description: 'Subcarrier Frequency Bits[15:8]',
  //   group: 'sd_fsc',
  //   resetValue: 0x7c,
  //   fields: [
  //     {
  //       name: 'Frequency Value',
  //       description: 'Subcarrier Frequency Bits[15:8]',
  //       bitStart: 0,
  //       bitEnd: 7,
  //       type: 'hex',
  //     },
  //   ],
  // },
  // {
  //   address: 0x8e,
  //   name: 'SD Fsc Register 2',
  //   description: 'Subcarrier Frequency Bits[23:16]',
  //   group: 'sd_fsc',
  //   resetValue: 0xf0,
  //   fields: [
  //     {
  //       name: 'Frequency Value',
  //       description: 'Subcarrier Frequency Bits[23:16]',
  //       bitStart: 0,
  //       bitEnd: 7,
  //       type: 'hex',
  //     },
  //   ],
  // },
  // {
  //   address: 0x8f,
  //   name: 'SD Fsc Register 3',
  //   description: 'Subcarrier Frequency Bits[31:24]',
  //   group: 'sd_fsc',
  //   resetValue: 0x21,
  //   fields: [
  //     {
  //       name: 'Frequency Value',
  //       description: 'Subcarrier Frequency Bits[31:24]',
  //       bitStart: 0,
  //       bitEnd: 7,
  //       type: 'hex',
  //     },
  //   ],
  // },
  // {
  //   address: 0x90,
  //   name: 'SD Fsc Phase',
  //   description: 'Subcarrier Phase Bits[9:2]',
  //   resetValue: 0x00,
  //   fields: [
  //     {
  //       name: 'Subcarrier Phase Bits[9:2]',
  //       bitStart: 0,
  //       bitEnd: 7,
  //       type: 'hex',
  //     },
  //   ],
  // },
  // {
  //   address: 0x91,
  //   name: 'SD Closed Captioning',
  //   description: 'Extended data on even fields',
  //   resetValue: 0x00,
  //   fields: [
  //     {
  //       name: 'Extended Data Bits[7:0]',
  //       bitStart: 0,
  //       bitEnd: 7,
  //       type: 'hex',
  //     },
  //   ],
  // },
  // {
  //   address: 0x92,
  //   name: 'SD Closed Captioning',
  //   description: 'Extended data on even fields',
  //   resetValue: 0x00,
  //   fields: [
  //     {
  //       name: 'Extended Data Bits[15:8]',
  //       bitStart: 0,
  //       bitEnd: 7,
  //       type: 'hex',
  //     },
  //   ],
  // },
  // {
  //   address: 0x93,
  //   name: 'SD Closed Captioning',
  //   description: 'Data on odd fields',
  //   resetValue: 0x00,
  //   fields: [
  //     {
  //       name: 'Data Bits[7:0]',
  //       bitStart: 0,
  //       bitEnd: 7,
  //       type: 'hex',
  //     },
  //   ],
  // },
  // {
  //   address: 0x94,
  //   name: 'SD Closed Captioning',
  //   description: 'Data on odd fields',
  //   resetValue: 0x00,
  //   fields: [
  //     {
  //       name: 'Data Bits[15:8]',
  //       bitStart: 0,
  //       bitEnd: 7,
  //       type: 'hex',
  //     },
  //   ],
  // },
  // {
  //   address: 0x95,
  //   name: 'SD Pedestal Register 0',
  //   description: 'Pedestal on odd fields',
  //   resetValue: 0x00,
  //   fields: makePedestalFields(10),
  // },
  // {
  //   address: 0x96,
  //   name: 'SD Pedestal Register 0',
  //   description: 'Pedestal on odd fields',
  //   resetValue: 0x00,
  //   fields: makePedestalFields(18),
  // },
  // {
  //   address: 0x97,
  //   name: 'SD Pedestal Register 0',
  //   description: 'Pedestal on even fields',
  //   resetValue: 0x00,
  //   fields: makePedestalFields(18),
  // },
  // {
  //   address: 0x98,
  //   name: 'SD Pedestal Register 0',
  //   description: 'Pedestal on even fields',
  //   resetValue: 0x00,
  //   fields: makePedestalFields(18),
  // },
  // 0x99 SD CGMS/WSS 0
  // 0x9A SD CGMS/WSS 1
  // 0x9B SD CGMS/WSS 2
  // 0x9C SD scale LSB
  // 0x9D SD Y scale
  // 0x9E SD Cb scale
  // 0x9F SD Cr scale
  // 0xA0 SD hue adjust
  // 0xA1 SD brightness/WSS
  // 0xA2 SD luma SSAF
  // 0xA3 SD DNR 0
  // 0xA4 SD DNR 1
  // 0xA5 SD DNR 2
  // 0xA6-0xAF SD Gamma A0-A9
  // 0xB0-0xB9 SD Gamma B0-B9
  // 0xBA SD brightness detect
  // 0xBB Field count
  // 0xC9 Teletext control
  // 0xCA Teletext request control
  // 0xCB-0xCE TTX Line Enable 0-3
  // 0xE0-0xF1 Macrovision
]

function makePedestalFields(line: number) {
  return Array.from({ length: 8 }).map((_, i) => ({
    name: `Setting these bit to 1 disables the pedestal on the line #${line + i}`,
    bitStart: i,
    bitEnd: i,
    type: 'boolean' as const,
  }))
}
