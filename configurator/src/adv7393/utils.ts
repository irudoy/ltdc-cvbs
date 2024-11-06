export function isRegisterValueModified(
  value: number,
  bitStart: number,
  bitEnd: number,
  registerResetValue: number
): boolean {
  return (
    (value & (((1 << (bitEnd - bitStart + 1)) - 1) << bitStart)) >> bitStart !==
    (registerResetValue & (((1 << (bitEnd - bitStart + 1)) - 1) << bitStart)) >>
      bitStart
  )
}

export function getFieldValue(
  registerValue: number,
  bitStart: number,
  bitEnd: number
): number {
  const mask = (1 << (bitEnd - bitStart + 1)) - 1
  return (registerValue >> bitStart) & mask
}

export function setFieldValue(
  registerValue: number,
  bitStart: number,
  bitEnd: number,
  value: number
): number {
  const mask = (1 << (bitEnd - bitStart + 1)) - 1
  // clear
  registerValue &= ~(mask << bitStart)
  // set
  registerValue |= (value & mask) << bitStart
  return registerValue
}

export function combineBytes(bytes: number[]): number {
  return bytes.reduce((acc, byte, index) => acc | (byte << (8 * index)), 0)
}

export function splitToBytes(value: number, byteCount: number): number[] {
  const bytes = []
  for (let i = 0; i < byteCount; i++) {
    bytes.push((value >> (8 * i)) & 0xff)
  }
  return bytes
}

export function formatHex(value: number, byteCount: number) {
  return `0x${value
    .toString(16)
    .padStart(byteCount * 2, '0')
    .toUpperCase()}`
}

export function formatBin(value: number, byteCount: number) {
  return `0b${value
    .toString(2)
    .padStart(byteCount * 8, '0')
    .toUpperCase()}`
}
