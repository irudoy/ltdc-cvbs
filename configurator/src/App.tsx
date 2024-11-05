import { useCallback, useEffect, useMemo, useState } from 'react'
import { FrameViz } from './frame-viz'
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

import './App.css'

const BTN_CLASS =
  'bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 font-bold rounded'

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
    (key: keyof ClkState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setClkState((prev) => ({ ...prev, [key]: parseInt(e.target.value, 10) }))
    }

  const { connect, disconnect, subscribe, write, portState } = useSerial()

  useEffect(() => {
    console.log('Port state change: ', portState)
  }, [portState])

  const handleMessageReceive = useCallback(
    (m: MessageIn) => {
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
        <button
          onClick={() => (portState === 'closed' ? connect() : disconnect())}
          className={BTN_CLASS}
        >
          {portState === 'closed' ? 'Connect' : 'Disconnect'}
        </button>
        {portState === 'open' && (
          <>
            <button
              onClick={() => sendMessage(prevScreen())}
              className={BTN_CLASS}
            >
              ⬅️
            </button>
            <button
              onClick={() => sendMessage(nextScreen())}
              className={BTN_CLASS}
            >
              ➡️
            </button>
            <button
              onClick={() => sendMessage(getConfig())}
              className={BTN_CLASS}
            >
              Get config
            </button>
            <button
              onClick={() => sendMessage(pushConfig(state))}
              className={BTN_CLASS}
            >
              Push config
            </button>
            <label>
              <input
                className="mr-2"
                type="checkbox"
                checked={liveUpdate}
                onChange={(e) => setLiveUpdate(e.target.checked)}
              />
              Live update
            </label>
          </>
        )}
      </div>
      <div className="grid grid-cols-7 gap-4 mb-3">
        <div>
          <NumberInput
            disabled
            label="FPS"
            value={state.frameRate.toFixed(2)}
          />
          <NumberInput
            disabled
            label="FPS (2)"
            value={state.frameRate2.toFixed(2)}
          />
          <NumberInput
            label="Pixel Clock (MHz)"
            min={1}
            max={196}
            step={0.0001}
            value={state.pixelClockMhz}
            onChange={handleInputChange('pixelClockMhz')}
          />
          <br />
          <b>Horizontal:</b>
          <NumberInput
            label="HSync"
            min={1}
            max={4095}
            value={state.hSyncWidth}
            onChange={handleInputChange('hSyncWidth')}
          />
          <NumberInput
            label="HBP"
            min={0}
            max={4095}
            value={state.hBackPorch}
            onChange={handleInputChange('hBackPorch')}
          />
          <NumberInput
            label="Active Width"
            min={0}
            max={3955}
            value={state.activeWidth}
            onChange={handleInputChange('activeWidth')}
          />
          <NumberInput
            label="HFP"
            min={0}
            max={4095}
            value={state.hFrontPorch}
            onChange={handleInputChange('hFrontPorch')}
          />
          <br />
          <b>Vertical:</b>
          <NumberInput
            label="VSync"
            min={1}
            max={2047}
            value={state.vSyncHeight}
            onChange={handleInputChange('vSyncHeight')}
          />
          <NumberInput
            label="VBP"
            min={0}
            max={2047}
            value={state.vBackPorch}
            onChange={handleInputChange('vBackPorch')}
          />
          <NumberInput
            label="Active Height"
            min={0}
            max={2025}
            value={state.activeHeight}
            onChange={handleInputChange('activeHeight')}
          />
          <NumberInput
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
              <pre>{JSON.stringify(state, null, 2)}</pre>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 rounded"
                />
                <button
                  disabled={!description}
                  onClick={saveCurrentState}
                  className={BTN_CLASS}
                >
                  Save
                </button>
              </div>
              {savedSets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Saved Sets</h3>
                  <ul>
                    {savedSets.map((set, index) => (
                      <li key={index} className="mb-2">
                        <span>{set.description}</span>
                        <button
                          onClick={() => loadSet(set.config)}
                          className={`${BTN_CLASS} ml-2`}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteSet(index)}
                          className={`${BTN_CLASS} ml-2`}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-3">
        {portState === 'open' ? (
          <>
            <button
              onClick={() => sendMessage(getClkConfig())}
              className={BTN_CLASS}
            >
              Get CLK
            </button>

            <button
              onClick={() => sendMessage(pushClkConfig(clkState))}
              className={BTN_CLASS}
            >
              Push CLK
            </button>
            <label>
              <input
                className="mr-2"
                type="checkbox"
                checked={clkLiveUpdate}
                onChange={(e) => setClkLiveUpdate(e.target.checked)}
              />
              Live update
            </label>
          </>
        ) : (
          'Port closed, connect to the device to configure clock settings'
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <NumberInput
            label="PLL SAI *N"
            min={50}
            max={432}
            value={clkState.pllSaiN}
            onChange={handleClkInputChange('pllSaiN')}
          />
          <NumberInput
            label="PLL SAI /R"
            min={2}
            max={7}
            value={clkState.pllSaiR}
            onChange={handleClkInputChange('pllSaiR')}
          />
          <label>
            PLL SAI /DIVR
            <select
              className="w-full"
              onChange={handleClkInputChange('pllSaiDivR')}
            >
              {[
                [0, 2],
                [1, 4],
                [2, 8],
                [3, 16],
              ].map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                  selected={clkState.pllSaiDivR === value}
                >
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="col-span-2">
          <pre>{JSON.stringify(clkState, null, 2)}</pre>
        </div>
      </div>
    </>
  )
}

function NumberInput({
  label,
  ...rest
}: {
  label: string
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) {
  return (
    <label className="block mb-2">
      {label}
      <br />
      <input {...rest} type="number" className="w-full mt-1" />
    </label>
  )
}

function App() {
  return (
    <SerialProvider>
      <Root />
    </SerialProvider>
  )
}

export default App
