import { useCallback, useEffect, useState } from 'react'
import { Button, Checkbox, Input, InputNumber, List, Card } from 'antd'
import {
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import type { InputNumberProps } from 'antd'
import { DataTypeIn, getConfig, pushConfig, MessageInParsed } from '../api'
import type { ConfigStateEnhanced, ComputedState, State } from '../types'
import { useStm32Serial } from '../serial-stm32'
import { FrameViz } from './frame-viz'

const initialState: ConfigStateEnhanced = {
  pixelClockMhz: 27 / 2,
  hSyncWidth: 0,
  hBackPorch: 0,
  hFrontPorch: 0,
  activeWidth: 0,
  vSyncHeight: 0,
  vBackPorch: 0,
  vFrontPorch: 0,
  activeHeight: 0,
}

const computeState = (config: ConfigStateEnhanced): ComputedState => {
  const totalWidth =
    config.hSyncWidth +
    config.hBackPorch +
    config.activeWidth +
    config.hFrontPorch -
    1

  const totalHeight =
    config.vSyncHeight +
    config.vBackPorch +
    config.activeHeight +
    config.vFrontPorch -
    1

  const accActiveWidth =
    config.hSyncWidth + config.hBackPorch + config.activeWidth - 1
  const accActiveHeight =
    config.vSyncHeight + config.vBackPorch + config.activeHeight - 1

  return {
    hSyncWidthComputed: config.hSyncWidth - 1,
    accHBackPorch: config.hSyncWidth + config.hBackPorch - 1,
    accActiveWidth,
    totalWidth,
    vSyncHeightComputed: config.vSyncHeight - 1,
    accVBackPorch: config.vSyncHeight + config.vBackPorch - 1,
    accActiveHeight,
    totalHeight,

    frameRate: (config.pixelClockMhz * 1e6) / (totalWidth * totalHeight),
    frameRate2:
      (config.pixelClockMhz * 1e6) / ((totalWidth + 1) * (totalHeight + 1)),
  }
}

const useConfigState = () => {
  const [state, setState] = useState<State>({
    ...initialState,
    ...computeState(initialState),
  })
  const [description, setDescription] = useState('')
  const [savedSets, setSavedSets] = useState<
    { description: string; config: ConfigStateEnhanced }[]
  >(() => {
    const saved = localStorage.getItem('savedSets')
    return saved ? JSON.parse(saved) : []
  })

  const handleInputChange =
    (key: keyof ConfigStateEnhanced) => (value: string | number | null) => {
      if (value !== null) {
        setState((prevState) => {
          const newConfig = { ...prevState, [key]: Number(value) }
          return {
            ...newConfig,
            ...computeState(newConfig),
          }
        })
      }
    }

  const saveCurrentState = () => {
    const newSet = { description, config: state }
    const updatedSets = [...savedSets, newSet]
    setSavedSets(updatedSets)
    localStorage.setItem('savedSets', JSON.stringify(updatedSets))
    setDescription('')
  }

  const loadSet = (config: ConfigStateEnhanced) => {
    setState({
      ...config,
      ...computeState(config),
    })
  }

  const deleteSet = (index: number) => {
    const updatedSets = savedSets.filter((_, i) => i !== index)
    setSavedSets(updatedSets)
    localStorage.setItem('savedSets', JSON.stringify(updatedSets))
  }

  return {
    state,
    description,
    savedSets,
    setDescription,
    handleInputChange,
    saveCurrentState,
    loadSet,
    deleteSet,
  }
}

export function LtdcConfigurator() {
  const {
    state,
    description,
    savedSets,
    setDescription,
    handleInputChange,
    saveCurrentState,
    loadSet,
    deleteSet,
  } = useConfigState()

  const handleMessageReceive = useCallback(
    (m: MessageInParsed) => {
      if (m.type === DataTypeIn.LTDC_CONFIG) {
        loadSet({
          pixelClockMhz: state.pixelClockMhz,
          hSyncWidth: m.horizontalSync + 1,
          hBackPorch: m.accumulatedHBP - m.horizontalSync,
          hFrontPorch: m.totalWidth - m.accumulatedActiveW,
          activeWidth: m.accumulatedActiveW - m.accumulatedHBP,
          vSyncHeight: m.verticalSync + 1,
          vBackPorch: m.accumulatedVBP - m.verticalSync,
          activeHeight: m.accumulatedActiveH - m.accumulatedVBP,
          vFrontPorch: m.totalHeight - m.accumulatedActiveH,
        })
      }
    },
    [loadSet, state.pixelClockMhz]
  )

  const { portState, sendMessage } = useStm32Serial(handleMessageReceive)

  const [liveUpdate, setLiveUpdate] = useState(false)

  useEffect(() => {
    if (liveUpdate) {
      sendMessage(pushConfig(state))
    }
  }, [liveUpdate, state, sendMessage])

  const disabled = portState !== 'open'

  return (
    <Card
      title="STM32 LTDC Configurator"
      extra={
        <div className="flex items-center gap-4">
          <Button
            icon={<DownloadOutlined />}
            disabled={disabled}
            onClick={() => sendMessage(getConfig())}
          >
            Get config
          </Button>
          <Button
            icon={<UploadOutlined />}
            disabled={disabled}
            onClick={() => sendMessage(pushConfig(state))}
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
      <div className="grid grid-cols-7 gap-4 mb-3">
        <div>
          <TimingsInput
            label="Pixel Clock (MHz)"
            min={1}
            max={196}
            step={0.0001}
            value={state.pixelClockMhz}
            onChange={handleInputChange('pixelClockMhz')}
          />
          <TimingsInput
            disabled
            label="FPS"
            value={state.frameRate.toFixed(2)}
          />
          <TimingsInput
            disabled
            label="FPS (2)"
            value={state.frameRate2.toFixed(2)}
          />
        </div>
        <div>
          <TimingsInput
            label="HSync"
            min={1}
            max={4095}
            value={state.hSyncWidth}
            onChange={handleInputChange('hSyncWidth')}
          />
          <TimingsInput
            label="HBP"
            min={0}
            max={4095}
            value={state.hBackPorch}
            onChange={handleInputChange('hBackPorch')}
          />
          <TimingsInput
            label="Active Width"
            min={0}
            max={3955}
            value={state.activeWidth}
            onChange={handleInputChange('activeWidth')}
          />
          <TimingsInput
            label="HFP"
            min={0}
            max={4095}
            value={state.hFrontPorch}
            onChange={handleInputChange('hFrontPorch')}
          />
          {[
            'hSyncWidthComputed',
            'accHBackPorch',
            'accActiveWidth',
            'totalWidth',
          ].map((key) => (
            <TimingsInput
              key={key}
              label={key}
              value={state[key as keyof ComputedState]}
              disabled
            />
          ))}
        </div>
        <div>
          <TimingsInput
            label="VSync"
            min={1}
            max={2047}
            value={state.vSyncHeight}
            onChange={handleInputChange('vSyncHeight')}
          />
          <TimingsInput
            label="VBP"
            min={0}
            max={2047}
            value={state.vBackPorch}
            onChange={handleInputChange('vBackPorch')}
          />
          <TimingsInput
            label="Active Height"
            min={0}
            max={2025}
            value={state.activeHeight}
            onChange={handleInputChange('activeHeight')}
          />
          <TimingsInput
            label="VFP"
            min={0}
            max={2047}
            value={state.vFrontPorch}
            onChange={handleInputChange('vFrontPorch')}
          />
          {[
            'vSyncHeightComputed',
            'accVBackPorch',
            'accActiveHeight',
            'totalHeight',
          ].map((key) => (
            <TimingsInput
              key={key}
              label={key}
              value={state[key as keyof ComputedState]}
              disabled
            />
          ))}
        </div>
        <div className="col-span-4">
          <div className="mb-1">Saved configurations:</div>
          <div className="flex items-center gap-3 mb-3">
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button
              disabled={!description}
              onClick={saveCurrentState}
              type="primary"
            >
              Save
            </Button>
          </div>
          {savedSets.length > 0 && (
            <div>
              <List
                size="small"
                dataSource={savedSets}
                renderItem={(set, index) => (
                  <List.Item
                    classNames={{
                      actions: 'flex items-center',
                    }}
                    actions={[
                      <Button onClick={() => loadSet(set.config)}>Load</Button>,
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          if (window.confirm('Delete this configuration?')) {
                            deleteSet(index)
                          }
                        }}
                      />,
                    ]}
                  >
                    {set.description}
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto min-h-96 flex place-content-center">
        <FrameViz state={state} />
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
