export type RegisterField = {
  name: string
  bitStart: number
  bitEnd: number
  type: 'enum' | 'boolean' | 'int' | 'hex'
  options?: { value: number; label: string }[]
}

export type Register = {
  address: number
  name: string
  fields: RegisterField[]
  resetValue: number
}

export type RegisterGroup = {
  name: string
  registers: Register[]
}
