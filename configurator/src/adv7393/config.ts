import type { Register } from './types'

export const configRegisters: Register[] = [
  {
    address: '0x80',
    name: 'SD Mode Register 1',
    fields: [
      {
        name: 'SD Standard',
        bitStart: 5,
        bitEnd: 7,
        type: 'enum',
        options: [
          { value: 0, label: 'NTSC' },
          { value: 1, label: 'PAL B, PAL D, PAL G, PAL H, PAL I' },
          { value: 2, label: 'PAL M' },
          { value: 3, label: 'PAL N' },
        ],
      },
      {
        name: 'SD Luma Filter',
        bitStart: 2,
        bitEnd: 4,
        type: 'enum',
        options: [
          { value: 0, label: 'LPF NTSC' },
          { value: 1, label: 'LPF PAL' },
          { value: 2, label: 'Notch NTSC' },
          { value: 3, label: 'Notch PAL' },
          { value: 4, label: 'Luma SSAF' },
          { value: 5, label: 'Luma CIF' },
          { value: 6, label: 'Luma QCIF' },
          { value: 7, label: 'Reserved' },
        ],
      },
      {
        name: 'SD Chroma Filter',
        bitStart: 0,
        bitEnd: 1,
        type: 'enum',
        options: [
          { value: 0, label: '1.3 MHz' },
          { value: 1, label: '0.65 MHz' },
          { value: 2, label: '1.0 MHz' },
          { value: 3, label: '2.0 MHz' },
        ],
      },
    ],
    resetValue: 0x10,
  },
  {
    address: '0x8C',
    name: 'Subcarrier Frequency',
    fields: [
      {
        name: 'Frequency Value',
        bitStart: 0,
        bitEnd: 31,
        type: 'int',
        byteCount: 4, // Значение занимает 4 байта (0x8C, 0x8D, 0x8E, 0x8F)
      },
    ],
    resetValue: 0x1f7c0f21, // Пример 32-битного значения по умолчанию
  },
  {
    address: '0x00',
    name: 'Power Mode',
    fields: [
      {
        name: 'Sleep Mode',
        bitStart: 7,
        bitEnd: 7,
        type: 'boolean',
      },
      {
        name: 'PLL Control',
        bitStart: 6,
        bitEnd: 6,
        type: 'boolean',
      },
      {
        name: 'DAC3 Power',
        bitStart: 5,
        bitEnd: 5,
        type: 'boolean',
      },
      {
        name: 'DAC2 Power',
        bitStart: 4,
        bitEnd: 4,
        type: 'boolean',
      },
      {
        name: 'DAC1 Power',
        bitStart: 3,
        bitEnd: 3,
        type: 'boolean',
      },
    ],
    resetValue: 0x12,
  },
  {
    address: '0x01',
    name: 'Mode Select',
    fields: [
      {
        name: 'DDR Clock Edge Alignment',
        bitStart: 5,
        bitEnd: 6,
        type: 'enum',
        options: [
          { value: 0, label: 'Chroma rising, Luma falling' },
          { value: 1, label: 'Reserved' },
          { value: 2, label: 'Reserved' },
          { value: 3, label: 'Luma rising, Chroma falling' },
        ],
      },
      {
        name: 'Input Mode',
        bitStart: 0,
        bitEnd: 3,
        type: 'enum',
        options: [
          { value: 0, label: 'SD input' },
          { value: 1, label: 'ED/HD-SDR input' },
          { value: 2, label: 'ED/HD-DDR input' },
          { value: 3, label: 'Reserved' },
          { value: 4, label: 'Reserved' },
          { value: 5, label: 'Reserved' },
          { value: 6, label: 'Reserved' },
          { value: 7, label: 'ED (54 MHz) input' },
        ],
      },
    ],
    resetValue: 0x00,
  },
  {
    address: '0x02',
    name: 'Mode Register 0',
    fields: [
      {
        name: 'HD Interlace VSYNC/HSYNC',
        bitStart: 6,
        bitEnd: 6,
        type: 'boolean',
      },
      {
        name: 'Test Pattern Black Bar',
        bitStart: 5,
        bitEnd: 5,
        type: 'boolean',
      },
      {
        name: 'Manual CSC Matrix Adjust',
        bitStart: 4,
        bitEnd: 4,
        type: 'boolean',
      },
      {
        name: 'Sync on RGB',
        bitStart: 3,
        bitEnd: 3,
        type: 'boolean',
      },
      {
        name: 'RGB/YPrPb Output Select',
        bitStart: 2,
        bitEnd: 2,
        type: 'boolean',
      },
      {
        name: 'SD Sync Output Enable',
        bitStart: 1,
        bitEnd: 1,
        type: 'boolean',
      },
      {
        name: 'ED/HD Sync Output Enable',
        bitStart: 0,
        bitEnd: 0,
        type: 'boolean',
      },
    ],
    resetValue: 0x20,
  },
]
