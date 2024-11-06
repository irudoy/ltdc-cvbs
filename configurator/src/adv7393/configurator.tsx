import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Checkbox } from 'antd'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { type MessageInParsed, DataTypeIn } from '../api'
import { useStm32Serial } from '../serial-stm32'
import { RegisterItem } from './register-item'
import { configRegisters } from './config'

export const RegisterConfigurator = () => {
  const [values, setValues] = useState<{ [key: string]: number }>(() =>
    configRegisters.reduce(
      (acc, reg) => {
        acc[reg.address] = reg.resetValue
        return acc
      },
      {} as { [key: string]: number }
    )
  )

  const handleRegisterChange = (startAddress: number, newValue: number) => {
    setValues((prevValues) => ({
      ...prevValues,
      [startAddress]: newValue,
    }))
  }

  useEffect(() => {
    console.log('New register values:', values)
  }, [values])

  const handleMessageReceive = useCallback((m: MessageInParsed) => {
    // if (m.type === DataTypeIn.LTDC_CLK_CONFIG) {
    //   setValues({})
    // }
  }, [])

  const { portState, sendMessage } = useStm32Serial(handleMessageReceive)

  const [liveUpdate, setLiveUpdate] = useState(false)

  useEffect(() => {
    if (liveUpdate) {
      // sendMessage())
    }
  }, [liveUpdate, sendMessage])

  const disabled = portState !== 'open'

  return (
    <Card
      title="ADV7393 Register Configurator"
      extra={
        <div className="flex items-center gap-4">
          <Button
            icon={<DownloadOutlined />}
            disabled={disabled}
            onClick={() => null}
          >
            Get config
          </Button>
          <Button
            icon={<UploadOutlined />}
            disabled={disabled}
            onClick={() => null}
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
      {configRegisters.map((register) => (
        <RegisterItem
          key={register.address}
          register={register}
          value={values[register.address]}
          onRegisterChange={handleRegisterChange}
        />
      ))}
    </Card>
  )
}
