export type RegisterField = {
  name: string
  description?: string
  bitStart: number
  bitEnd: number
  type: 'enum' | 'boolean' | 'int' | 'hex'
  options?: { value: number; label: string }[]
}

export type Register = {
  name: string
  description?: string
  address: number
  fields: RegisterField[]
  resetValue: number
  group?: string
}

export type RegisterGroup = {
  type: 'group'
  id: string
  name: string
  description?: string
}
