import { useState } from 'react'
import type { ConfigStateEnhanced, ComputedState, State } from './types'

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
    (key: keyof ConfigStateEnhanced) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value)
      setState((prevState) => {
        const newConfig = { ...prevState, [key]: value }
        return {
          ...newConfig,
          ...computeState(newConfig),
        }
      })
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

export { initialState, computeState, useConfigState }
