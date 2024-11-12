import { useCallback, useEffect, useState } from 'react'
import {
  type InputNumberProps,
  Button,
  Card,
  Checkbox,
  InputNumber,
  Select,
} from 'antd'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import {
  DataTypeIn,
  pushClkConfig,
  getClkConfig,
  MessageInParsed,
} from '../api'
import type { ClkConfigState } from '../types'
import { useStm32Serial } from '../serial-stm32'
import { useClockState, PLL_SAI_DIV_R_MAP } from '../store'

export function ClockConfigurator() {
  const { clockState: state, updateClockState: setState } = useClockState()

  const handleInputChange =
    (key: keyof ClkConfigState) => (value: string | number | null) => {
      if (value !== null) {
        setState({
          [key]: Number(value),
        })
      }
    }

  const handleMessageReceive = useCallback((m: MessageInParsed) => {
    if (m.type === DataTypeIn.LTDC_CLK_CONFIG) {
      setState(m)
    }
  }, [])

  const { portState, sendMessage } = useStm32Serial(handleMessageReceive)

  const [liveUpdate, setLiveUpdate] = useState(false)

  useEffect(() => {
    if (liveUpdate) {
      sendMessage(pushClkConfig(state))
    }
  }, [liveUpdate, state, sendMessage])

  const disabled = portState !== 'open'

  return (
    <Card
      title="STM32 Clock Configurator"
      extra={
        <div className="flex items-center gap-4">
          <Button
            icon={<DownloadOutlined />}
            disabled={disabled}
            onClick={() => sendMessage(getClkConfig())}
          >
            Get config
          </Button>
          <Button
            icon={<UploadOutlined />}
            disabled={disabled}
            onClick={() => sendMessage(pushClkConfig(state))}
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
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="col-span-1">
          <TimingsInput
            label="LCD-TFT clock frequency"
            disabled
            value={state.lcdTftClockFrequency}
          />
          <TimingsInput
            label="PLL SAI *N"
            min={50}
            max={432}
            value={state.pllSaiN}
            onChange={handleInputChange('pllSaiN')}
          />
          <TimingsInput
            label="PLL SAI /R"
            min={2}
            max={7}
            value={state.pllSaiR}
            onChange={handleInputChange('pllSaiR')}
          />
          <label>
            PLL SAI /DIVR
            <Select
              options={Array.from(PLL_SAI_DIV_R_MAP).map(([value, label]) => ({
                label,
                value,
              }))}
              value={state.pllSaiDivR}
              className="w-full"
              onChange={handleInputChange('pllSaiDivR')}
            />
          </label>
        </div>
        <div className="col-span-2">
          {/* <pre>{JSON.stringify(clkState, null, 2)}</pre> */}
        </div>
      </div>
    </Card>
  )
}

function TimingsInput({
  label,
  ...rest
}: {
  label: string
} & InputNumberProps) {
  return (
    <label className="block mb-2">
      {label}
      <br />
      <InputNumber {...rest} className="w-full mt-1" />
    </label>
  )
}
