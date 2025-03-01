import { memo, useCallback, useEffect, useState } from 'react'
import { Button, List, Tooltip, Typography } from 'antd'
import { UndoOutlined } from '@ant-design/icons'
import type { Register } from './types'
import { isRegisterValueModified } from './utils'
import { ControlSelector } from './control-selector'
import { Bytes } from './atoms'

type Props = {
  register: Register
  value: number
  updatedRegisters: Set<number>
  onRegisterChange: (startAddress: number, newValue: number) => void
}

export const RegisterItem = memo(
  ({ register, value, updatedRegisters, onRegisterChange }: Props) => {
    const handleFieldChange = useCallback(
      (newValue: number) => {
        onRegisterChange(register.address, newValue)
      },
      [register.address, onRegisterChange]
    )

    const [highlighted, setHighlighted] = useState(false)

    useEffect(() => {
      let timer: number
      if (updatedRegisters.has(register.address)) {
        setHighlighted(true)
        timer = setTimeout(() => {
          setHighlighted(false)
          updatedRegisters.delete(register.address)
        }, 500)
      }
      return () => clearTimeout(timer)
    }, [updatedRegisters, register.address])

    return (
      <List
        className="mb-5"
        bordered
        size="small"
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bytes className="text-lg">{register.address}</Bytes>

              <Tooltip title={register.description}>
                <h3
                  className={`text-lg font-bold transition-all ${highlighted && 'text-lime-200'}`}
                >
                  {register.name}
                </h3>
              </Tooltip>

              <div>
                <Typography.Text type="secondary">Reset:</Typography.Text>
                <Bytes>{register.resetValue}</Bytes>
                <Bytes binary>{register.resetValue}</Bytes>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div>
                <Typography.Text type="secondary">Current:</Typography.Text>
                <Bytes>{value}</Bytes>
                <Bytes binary>{value}</Bytes>
              </div>

              <Button
                disabled={value === register.resetValue}
                size="small"
                icon={<UndoOutlined />}
                title="Reset to default value"
                onClick={() => handleFieldChange(register.resetValue)}
              />
            </div>
          </div>
        }
        dataSource={register.fields}
        renderItem={(field) => {
          const { name, bitStart, bitEnd } = field
          const dirty = isRegisterValueModified(
            value,
            bitStart,
            bitEnd,
            register.resetValue
          )

          let description = field.description
          if (field.type === 'boolean' && field.booleanDescription) {
            description = `${description ? description + '; ' : ''}0 - ${field.booleanDescription.true}; 1 - ${field.booleanDescription.false}`
          }
          return (
            <List.Item key={name}>
              <label className="w-full flex gap-2">
                <div className="flex grow min-w-0 items-center gap-2 cursor-pointer whitespace-nowrap">
                  <Typography.Text code className="mr-1">
                    {bitStart === bitEnd
                      ? `b${bitStart}`
                      : `b${bitStart}:${bitEnd}`}
                  </Typography.Text>
                  {dirty ? <b>{name} *</b> : name}
                  <Tooltip title={description}>
                    <Typography.Text type="secondary" ellipsis>
                      {description}
                    </Typography.Text>
                  </Tooltip>
                </div>
                <div className="text-right">
                  <ControlSelector
                    field={field}
                    registerValue={value}
                    onChange={handleFieldChange}
                  />
                </div>
              </label>
            </List.Item>
          )
        }}
      />
    )
  }
)
