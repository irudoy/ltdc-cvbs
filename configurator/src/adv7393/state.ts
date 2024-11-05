// function handleRegisterChange(startAddress: string, newValues: number[]) {
//   setRegisters((prevRegisters) =>
//     prevRegisters.map((reg) => {
//       if (reg.address === startAddress) {
//         const combinedValue = combineBytes(newValues)
//         return { ...reg, defaultValue: combinedValue }
//       }
//       return reg
//     })
//   )
// }

// Объединение многобайтовых значений в одно целое число
export function combineBytes(bytes: number[]): number {
  return bytes.reduce((acc, byte, index) => acc | (byte << (8 * index)), 0)
}

// Разбиение целого числа на массив байт
export function splitToBytes(value: number, byteCount: number): number[] {
  const bytes = []
  for (let i = 0; i < byteCount; i++) {
    bytes.push((value >> (8 * i)) & 0xff)
  }
  return bytes
}

// Получить значение из поля в регистре
export function getFieldValue(
  registerValue: number,
  bitStart: number,
  bitEnd: number
): number {
  const mask = (1 << (bitEnd - bitStart + 1)) - 1
  return (registerValue >> bitStart) & mask
}

// Установить значение в поле в регистре
export function setFieldValue(
  registerValue: number,
  bitStart: number,
  bitEnd: number,
  value: number
): number {
  const mask = (1 << (bitEnd - bitStart + 1)) - 1
  // Очистить целевое поле
  registerValue &= ~(mask << bitStart)
  // Установить новое значение
  registerValue |= (value & mask) << bitStart
  return registerValue
}
