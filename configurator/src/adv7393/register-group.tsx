import { memo } from 'react'
import { Button, InputNumber, List, Tooltip, Typography } from 'antd'
import { UndoOutlined } from '@ant-design/icons'
import type { Register } from './types'
import { Bytes, InputHex } from './atoms'
import { combineBytes } from './utils'

type Props = {
  name: string
  description?: string
  registers: Register[]
  value: number
  onChange: (newValue: number) => void
}

export const RegisterGroup = memo(
  ({ name, description, registers, value, onChange }: Props) => {
    const resetValue = combineBytes(registers.map((r) => r.resetValue))
    const dirty = resetValue !== value

    return (
      <List
        className="mb-5"
        bordered
        size="small"
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bytes className="text-lg">
                {[
                  registers[0].address,
                  registers[registers.length - 1].address,
                ]}
              </Bytes>
              <Tooltip title={description}>
                <h3 className="text-lg font-bold">
                  {name}
                  {dirty && ' *'}
                </h3>
              </Tooltip>
            </div>

            <div className="flex items-center gap-1">
              <div>
                <Typography.Text type="secondary">Current:</Typography.Text>
                <Bytes>{value}</Bytes>
              </div>

              <Button
                disabled={!dirty}
                size="small"
                icon={<UndoOutlined />}
                title="Reset to default value"
                onClick={() => onChange(resetValue)}
              />
            </div>
          </div>
        }
      >
        <>
          <List.Item>
            <label className="w-full flex gap-2">
              <div className="flex grow min-w-0 items-center gap-2 cursor-pointer whitespace-nowrap">
                HEX
              </div>
              <div className="text-right">
                <InputHex
                  className="min-w-48"
                  size="small"
                  value={value}
                  onChange={(value) => onChange(Number(value ?? 0))}
                />
              </div>
            </label>
          </List.Item>
          <List.Item>
            <label className="w-full flex gap-2">
              <div className="flex grow min-w-0 items-center gap-2 cursor-pointer whitespace-nowrap">
                DEC
              </div>
              <div className="text-right">
                <InputNumber
                  className="min-w-48"
                  size="small"
                  type="number"
                  value={value}
                  onChange={(value) => onChange(value ?? 0)}
                />
              </div>
            </label>
          </List.Item>
        </>
      </List>
    )
  }
)
