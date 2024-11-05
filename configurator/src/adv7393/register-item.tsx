import React from 'react'
import { ControlSelector } from './control-selector'
import type { Register } from './types'
import { splitToBytes } from './state'

type RegisterItemProps = {
  register: Register
  value: number
  onRegisterChange: (startAddress: string, newValues: number[]) => void
}

export const RegisterItem: React.FC<RegisterItemProps> = ({
  register,
  value,
  onRegisterChange,
}) => {
  const handleFieldChange = (newValues: number[]) => {
    onRegisterChange(register.address, newValues)
  }

  return (
    <div className="mb-3">
      <h3 className="text-lg font-bold mb-1">
        <code>{register.address}</code>: {register.name}
      </h3>
      <div className="text-gray-500 mb-2">
        Current value:{' '}
        <code>
          0x{value.toString(16)} (0b
          {value.toString(2).padStart(8, '0')})
        </code>
      </div>
      <div className="text-gray-500 mb-2">
        Reset value:{' '}
        <code>
          0x{register.resetValue.toString(16)} (0b
          {register.resetValue.toString(2).padStart(8, '0')})
        </code>
        <button
          className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded"
          onClick={() =>
            handleFieldChange(
              splitToBytes(register.resetValue, register.fields.length)
            )
          }
        >
          Reset
        </button>
      </div>
      {register.fields.map((field) => (
        <div key={field.name} className="grid grid-cols-5 gap-2 mb-1">
          <label>{field.name}</label>
          <ControlSelector
            field={field}
            registerValues={splitToBytes(value, field.byteCount || 1)}
            onChange={handleFieldChange}
          />
        </div>
      ))}
    </div>
  )
}
