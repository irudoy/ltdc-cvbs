export type RegisterField = {
  name: string
  bitStart: number
  bitEnd: number
  type: 'enum' | 'boolean' | 'int'
  options?: { value: number; label: string }[]
  byteCount?: number
}

export type Register = {
  address: string
  name: string
  fields: RegisterField[]
  resetValue: number
}
