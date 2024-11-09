import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Checkbox } from 'antd'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import {
  type MessageInParsed,
  DataTypeIn,
  getAdv7393Config,
  pushAdv7393Config,
} from '../api'
import { useStm32Serial } from '../serial-stm32'
import type { Register } from './types'
import { configRegisters as config } from './config'
import { RegisterItem } from './register-item'
import { RegisterGroup } from './register-group'
import { combineBytes, splitToBytes } from './utils'

export const RegisterConfigurator = () => {
  const [values, setValues] = useState<{ [key: number]: number }>(() =>
    config.reduce(
      (acc, reg) => {
        if ('type' in reg) return acc
        acc[reg.address] = reg.resetValue
        return acc
      },
      {} as { [key: number]: number }
    )
  )

  const handleRegisterChange = useCallback(
    (startAddress: number, newValue: number) => {
      setValues((prevValues) => ({
        ...prevValues,
        [startAddress]: newValue,
      }))
    },
    []
  )

  useEffect(() => {
    console.log('New register values:', values)
  }, [values])

  const handleMessageReceive = useCallback((m: MessageInParsed) => {
    if (m.type === DataTypeIn.ADV7393_CONFIG) {
      const dataObject = Object.fromEntries(m.data.entries())
      setValues(dataObject)
    }
  }, [])

  const { portState, sendMessage } = useStm32Serial(handleMessageReceive)

  const [liveUpdate, setLiveUpdate] = useState(false)

  useEffect(() => {
    if (liveUpdate) {
      sendMessage(pushAdv7393Config(values))
    }
  }, [liveUpdate, sendMessage, values])

  const disabled = portState !== 'open'

  return (
    <Card
      title="ADV7393 Register Configurator"
      extra={
        <div className="flex items-center gap-4">
          <Button
            icon={<DownloadOutlined />}
            disabled={disabled}
            onClick={() =>
              sendMessage(
                getAdv7393Config(
                  Object.keys(values).map((address) => parseInt(address, 10))
                )
              )
            }
          >
            Get config
          </Button>
          <Button
            icon={<UploadOutlined />}
            disabled={disabled}
            onClick={() => sendMessage(pushAdv7393Config(values))}
          >
            Push config
          </Button>
          <Checkbox
            disabled={disabled}
            checked={liveUpdate}
            onChange={(e) => setLiveUpdate(e.target.checked)}
          >
            Live update
          </Checkbox>
        </div>
      }
    >
      {config.map((register) => {
        if ('type' in register) {
          const groupedRegisters = config.filter(
            (it) => 'group' in it && it.group === register.id
          ) as Register[]

          const value = combineBytes(
            groupedRegisters.map((r) => values[r.address])
          )

          const handleChange = (newValue: number) => {
            splitToBytes(newValue, groupedRegisters.length).forEach(
              (byte, i) => {
                const reg = groupedRegisters[i]
                handleRegisterChange(reg.address, byte)
              }
            )
          }

          return (
            <RegisterGroup
              key={register.name}
              name={register.name}
              description={register.description}
              registers={groupedRegisters}
              value={value}
              onChange={handleChange}
            />
          )
        }

        return (
          <RegisterItem
            key={register.address}
            register={register}
            value={values[register.address]}
            onRegisterChange={handleRegisterChange}
          />
        )
      })}
    </Card>
  )
}
