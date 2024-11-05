import React, { useState, useEffect } from 'react'
import {
  combineBytes,
  getFieldValue,
  setFieldValue,
  splitToBytes,
} from './state'
import type { RegisterField } from './types'

type ControlSelectorProps = {
  field: RegisterField
  registerValues: number[]
  onChange: (newValues: number[]) => void
}

export const ControlSelector: React.FC<ControlSelectorProps> = ({
  field,
  registerValues,
  onChange,
}) => {
  const initialValue =
    field.byteCount && field.byteCount > 1
      ? combineBytes(registerValues.slice(0, field.byteCount))
      : getFieldValue(registerValues[0], field.bitStart, field.bitEnd)

  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleChange = (newVal: number) => {
    setValue(newVal)

    if (field.byteCount && field.byteCount > 1) {
      const newValues = splitToBytes(newVal, field.byteCount)
      onChange(newValues)
    } else {
      const updatedRegisterValue = setFieldValue(
        registerValues[0],
        field.bitStart,
        field.bitEnd,
        newVal
      )
      onChange([updatedRegisterValue])
    }
  }

  switch (field.type) {
    case 'enum':
      return (
        <select
          value={value}
          onChange={(e) => handleChange(parseInt(e.target.value, 10))}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => handleChange(e.target.checked ? 1 : 0)}
        />
      )
    case 'int':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(parseInt(e.target.value, 10))}
        />
      )
    default:
      return null
  }
}
