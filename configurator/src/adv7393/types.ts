export type RegisterField = {
  name: string
  description?: string
  bitStart: number
  bitEnd: number
  type: 'enum' | 'boolean' | 'int' | 'hex'
  booleanDescription?: {
    true: string
    false: string
  }
  options?: { value: number; label: string }[]
  readonly?: boolean
}

export type Register = {
  name: string
  description?: string
  address: number
  resetValue: number
  group?: string
  fields: RegisterField[]
}

export type RegisterGroup = {
  type: 'group'
  id: string
  name: string
  description?: string
}
