import { createEffect, createStore } from 'effector'
import { useUnit } from 'effector-react'
import type { ClkState, ClkConfigState } from '../types'

export const PLL_SAI_DIV_R_MAP = new Map([
  [0, 2],
  [1, 4],
  [2, 8],
  [3, 16],
])

const updateClockState = createEffect((state: Partial<ClkConfigState>) => state)

export const $clockState = createStore<ClkState>({
  oscSourceValue: 0,
  pllM: 0,
  pllSaiN: 0,
  pllSaiR: 0,
  pllSaiDivR: 0,
  lcdTftClockFrequency: 0,
}).on(updateClockState.doneData, (currentState, payload) => {
  const state = { ...currentState, ...payload }

  state.lcdTftClockFrequency =
    ((state.oscSourceValue / 1e6 / state.pllM) * state.pllSaiN) /
    state.pllSaiR /
    PLL_SAI_DIV_R_MAP.get(state.pllSaiDivR)!

  return state
})

export const useClockState = () => {
  const clockState = useUnit($clockState)
  return { clockState, updateClockState }
}
