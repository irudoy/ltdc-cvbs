import { useState, useEffect, memo } from 'react'
import { Select, Checkbox, InputNumber, Tooltip } from 'antd'
import { getFieldValue, setFieldValue } from './utils'
import type { RegisterField } from './types'
import { InputHex } from './atoms'

type Props = {
  field: RegisterField
  registerValue: number
  onChange: (newValue: number) => void
}

export const ControlSelector = memo(
  ({ field, registerValue, onChange }: Props) => {
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
          <Select
            size="small"
            className="min-w-48 text-left"
            value={value}
            onChange={(val) => handleChange(val)}
            disabled={field.readonly}
          >
            {field.options?.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        )
      case 'boolean':
        return (
          <Tooltip
            title={
              value
                ? field.booleanDescription?.true
                : field.booleanDescription?.false
            }
          >
            <Checkbox
              checked={Boolean(value)}
              onChange={(e) => handleChange(e.target.checked ? 1 : 0)}
              disabled={field.readonly}
            />
          </Tooltip>
        )
      case 'int':
        return (
          <InputNumber
            className="min-w-48"
            size="small"
            type="number"
            value={value}
            min={0}
            max={255}
            onChange={(value) => handleChange(value ?? 0)}
            disabled={field.readonly}
          />
        )
      case 'hex':
        return (
          <InputHex
            className="min-w-48"
            size="small"
            value={value}
            min={0}
            max={255}
            onChange={(value) => handleChange(Number(value ?? 0))}
            disabled={field.readonly}
          />
        )
      default:
        return null
    }
  }
)
