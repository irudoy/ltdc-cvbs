import React, { useState, useEffect } from 'react'
import { Select, Checkbox, InputNumber, type InputNumberProps } from 'antd'
import { getFieldValue, setFieldValue } from './state'
import type { RegisterField } from './types'

type ControlSelectorProps = {
  field: RegisterField
  registerValue: number
  onChange: (newValue: number) => void
}

export const ControlSelector: React.FC<ControlSelectorProps> = ({
  field,
  registerValue,
  onChange,
}) => {
  const initialValue = getFieldValue(
    registerValue,
    field.bitStart,
    field.bitEnd
  )

  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleChange = (newVal: number) => {
    setValue(newVal)

    const updatedRegisterValue = setFieldValue(
      registerValue,
      field.bitStart,
      field.bitEnd,
      newVal
    )

    onChange(updatedRegisterValue)
  }

  switch (field.type) {
    case 'enum':
      return (
        <Select value={value} onChange={(val) => handleChange(val)}>
          {field.options?.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      )
    case 'boolean':
      return (
        <Checkbox
          checked={Boolean(value)}
          onChange={(e) => handleChange(e.target.checked ? 1 : 0)}
        />
      )
    case 'int':
      return (
        <InputNumber
          type="number"
          value={value}
          onChange={(value) => handleChange(value ?? 0)}
        />
      )
    case 'hex':
      return (
        <InputHex
          value={value}
          onChange={(value) => handleChange(Number(value ?? 0))}
        />
      )
    default:
      return null
  }
}

function InputHex(props: InputNumberProps) {
  return (
    <InputNumber
      {...props}
      formatter={(value) => `0x${Number(value).toString(16).toUpperCase()}`}
      parser={(value) => parseInt(value?.replace(/^0x/i, '') || '0', 16)}
    />
  )
}
