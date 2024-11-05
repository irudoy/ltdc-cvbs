import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Checkbox,
  Input,
  InputNumber,
  Select,
  Typography,
  List,
  ConfigProvider,
  theme,
} from 'antd'
import type { InputNumberProps } from 'antd'
import { FrameViz } from './frame-viz'
import { RegisterConfigurator } from './adv7393'
import { SerialProvider, useSerial } from './serial'
import {
  type MessageIn,
  type MessageOut,
  DataTypeIn,
  createMessageReader,
  parseMessageIn,
  getConfig,
  nextScreen,
  prevScreen,
  pushConfig,
  getClkConfig,
  pushClkConfig,
} from './api'
import { useConfigState } from './state-manager'
import type { ClkState } from './types'

function Root() {
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

  const [clkState, setClkState] = useState<ClkState>({
    pllSaiN: 0,
    pllSaiR: 0,
    pllSaiDivR: 0,
  })

  const handleClkInputChange =
    (key: keyof ClkState) => (value: string | number | null) => {
      if (value !== null) {
        setClkState((prev) => ({ ...prev, [key]: Number(value) }))
      }
    }

  const { connect, disconnect, subscribe, write, portState } = useSerial()

  useEffect(() => {
    console.log('Port state change: ', portState)
  }, [portState])

  const handleMessageReceive = useCallback(
    function handleMessageReceive(m: MessageIn) {
      const newConfigRaw = parseMessageIn(m)
      switch (newConfigRaw.type) {
        case DataTypeIn.LTDC_CONFIG: {
          loadSet({
            pixelClockMhz: state.pixelClockMhz,
            hSyncWidth: newConfigRaw.horizontalSync + 1,
            hBackPorch:
              newConfigRaw.accumulatedHBP - newConfigRaw.horizontalSync,
            hFrontPorch:
              newConfigRaw.totalWidth - newConfigRaw.accumulatedActiveW,
            activeWidth:
              newConfigRaw.accumulatedActiveW - newConfigRaw.accumulatedHBP,
            vSyncHeight: newConfigRaw.verticalSync + 1,
            vBackPorch: newConfigRaw.accumulatedVBP - newConfigRaw.verticalSync,
            activeHeight:
              newConfigRaw.accumulatedActiveH - newConfigRaw.accumulatedVBP,
            vFrontPorch:
              newConfigRaw.totalHeight - newConfigRaw.accumulatedActiveH,
          })
          break
        }
        case DataTypeIn.LTDC_CLK_CONFIG: {
          setClkState({
            pllSaiN: newConfigRaw.pllSaiN,
            pllSaiR: newConfigRaw.pllSaiR,
            pllSaiDivR: newConfigRaw.pllSaiDivR,
          })
          break
        }
        default:
          break
      }
    },
    [loadSet, state.pixelClockMhz]
  )

  const readMessageChunk = useMemo(
    () => createMessageReader(handleMessageReceive),
    [handleMessageReceive]
  )

  useEffect(() => {
    console.log('Subscribe')
    const unsubscribe = subscribe((message) => readMessageChunk(message.value))
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = useCallback(
    (data: MessageOut) => {
      write(data)
        .then((res) => {
          if (!res) {
            console.error('Failed to send message:', data)
          } else {
            console.log('Message sent:', data)
          }
        })
        .catch(console.error)
    },
    [write]
  )

  const [liveUpdate, setLiveUpdate] = useState(false)

  useEffect(() => {
    if (liveUpdate) {
      sendMessage(pushConfig(state))
    }
  }, [liveUpdate, state, sendMessage])

  const [clkLiveUpdate, setClkLiveUpdate] = useState(false)

  useEffect(() => {
    if (clkLiveUpdate) {
      sendMessage(pushClkConfig(clkState))
    }
  }, [clkLiveUpdate, clkState, sendMessage])

  return (
    <>
      <div className="flex items-center gap-4 mb-3">
        <span title={`Port state: ${portState}`}>
          {portState === 'open' ? '🟢' : '🟡'}
        </span>
        <Button
          onClick={() => (portState === 'closed' ? connect() : disconnect())}
          type="primary"
        >
          {portState === 'closed' ? 'Connect' : 'Disconnect'}
        </Button>
        {portState === 'open' && (
          <>
            <Button onClick={() => sendMessage(prevScreen())}>⬅️</Button>
            <Button onClick={() => sendMessage(nextScreen())}>➡️</Button>
            <Button onClick={() => sendMessage(getConfig())}>Get config</Button>
            <Button onClick={() => sendMessage(pushConfig(state))}>
              Push config
            </Button>
            <Checkbox
              checked={liveUpdate}
              onChange={(e) => setLiveUpdate(e.target.checked)}
            >
              Live update
            </Checkbox>
          </>
        )}
      </div>
      <div className="grid grid-cols-7 gap-4 mb-3">
        <div>
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
          <TimingsInput
            label="Pixel Clock (MHz)"
            min={1}
            max={196}
            step={0.0001}
            value={state.pixelClockMhz}
            onChange={handleInputChange('pixelClockMhz')}
          />
          <br />
          <b>Horizontal:</b>
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
          <br />
          <b>Vertical:</b>
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
        </div>
        <div className="col-span-6 mb-3">
          <div className="overflow-x-auto">
            <FrameViz state={state} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <pre>
                {JSON.stringify(
                  {
                    hSyncWidthComputed: state.hSyncWidthComputed,
                    accHBackPorch: state.accHBackPorch,
                    accActiveWidth: state.accActiveWidth,
                    totalWidth: state.totalWidth,
                    vSyncHeightComputed: state.vSyncHeightComputed,
                    accVBackPorch: state.accVBackPorch,
                    accActiveHeight: state.accActiveHeight,
                    totalHeight: state.totalHeight,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
            <div>
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
                  <Typography.Title level={3}>Saved Sets</Typography.Title>
                  <List
                    dataSource={savedSets}
                    renderItem={(set, index) => (
                      <List.Item
                        actions={[
                          <Button
                            onClick={() => loadSet(set.config)}
                            type="primary"
                          >
                            Load
                          </Button>,
                          <Button
                            onClick={() => deleteSet(index)}
                            type="primary"
                            danger
                          >
                            Delete
                          </Button>,
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
        </div>
      </div>
      <div className="flex items-center gap-4 mb-3">
        {portState === 'open' ? (
          <>
            <Button onClick={() => sendMessage(getClkConfig())}>Get CLK</Button>
            <Button onClick={() => sendMessage(pushClkConfig(clkState))}>
              Push CLK
            </Button>
            <Checkbox
              checked={clkLiveUpdate}
              onChange={(e) => setClkLiveUpdate(e.target.checked)}
            >
              Live update
            </Checkbox>
          </>
        ) : (
          'Port closed, connect to the device to configure clock settings'
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="col-span-1">
          <TimingsInput
            label="PLL SAI *N"
            min={50}
            max={432}
            value={clkState.pllSaiN}
            onChange={handleClkInputChange('pllSaiN')}
          />
          <TimingsInput
            label="PLL SAI /R"
            min={2}
            max={7}
            value={clkState.pllSaiR}
            onChange={handleClkInputChange('pllSaiR')}
          />
          <label>
            PLL SAI /DIVR
            <Select
              value={clkState.pllSaiDivR}
              className="w-full"
              onChange={handleClkInputChange('pllSaiDivR')}
            >
              {[
                [0, 2],
                [1, 4],
                [2, 8],
                [3, 16],
              ].map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </label>
        </div>
        <div className="col-span-2">
          {/* <pre>{JSON.stringify(clkState, null, 2)}</pre> */}
        </div>
      </div>
      <RegisterConfigurator />
    </>
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

export function App() {
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <ConfigProvider
      theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : undefined }}
    >
      <SerialProvider>
        <Root />
      </SerialProvider>
    </ConfigProvider>
  )
}
