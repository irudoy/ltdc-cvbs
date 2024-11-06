import React from 'react'
import { ControlSelector } from './control-selector'
import type { Register } from './types'
import { Button, Typography } from 'antd'
import type { TextProps } from 'antd/lib/typography/Text'
import { UndoOutlined } from '@ant-design/icons'

type RegisterItemProps = {
  register: Register
  value: number
  onRegisterChange: (startAddress: number, newValue: number) => void
}

export const RegisterItem: React.FC<RegisterItemProps> = ({
  register,
  value,
  onRegisterChange,
}) => {
  const handleFieldChange = (newValue: number) => {
    onRegisterChange(register.address, newValue)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Bytes className="text-lg">{register.address}</Bytes>
          <h3 className="text-lg font-bold">{register.name}</h3>
          <div className="text-gray-500">
            Current: <Bytes>{value}</Bytes>
            <Bytes binary>{value}</Bytes>
          </div>
        </div>

        <div className="text-gray-500 flex items-center gap-1">
          <div>
            Reset: <Bytes>{register.resetValue}</Bytes>
            <Bytes binary>{register.resetValue}</Bytes>
          </div>
          <Button
            size="small"
            icon={<UndoOutlined />}
            title="Reset to default value"
            onClick={() => handleFieldChange(register.resetValue)}
          />
        </div>
      </div>

      {register.fields.map((field) => {
        const { name, bitStart, bitEnd } = field
        const dirty = isRegisterValueModified(
          value,
          bitStart,
          bitEnd,
          register.resetValue
        )
        return (
          <div key={name} className="grid grid-cols-5 gap-2 mb-1">
            <label>
              <Typography.Text code className="mr-1">
                {bitStart === bitEnd
                  ? `b${bitStart}`
                  : `b${bitStart}:${bitEnd}`}
              </Typography.Text>
              {dirty ? <b>{name} *</b> : name}
            </label>
            <ControlSelector
              field={field}
              registerValue={value}
              onChange={handleFieldChange}
            />
          </div>
        )
      })}
    </div>
  )
}

function isRegisterValueModified(
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

function formatHex(value: number, byteCount: number) {
  return `0x${value
    .toString(16)
    .padStart(byteCount * 2, '0')
    .toUpperCase()}`
}

function formatBin(value: number, byteCount: number) {
  return `0b${value
    .toString(2)
    .padStart(byteCount * 8, '0')
    .toUpperCase()}`
}

function Bytes({
  children,
  binary = false,
  ...textProps
}: { children: number; binary?: boolean } & TextProps) {
  return (
    <Typography.Text code {...textProps}>
      {binary ? formatBin(children, 1) : formatHex(children, 1)}
    </Typography.Text>
  )
}
