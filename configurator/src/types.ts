export type LTDCConfigState = {
  hSyncWidth: number
  hBackPorch: number
  hFrontPorch: number
  activeWidth: number

  vSyncHeight: number
  vBackPorch: number
  activeHeight: number
  vFrontPorch: number
}

export type LTDCComputedState = {
  hSyncWidthComputed: number // hSyncWidth - 1
  accHBackPorch: number // hSyncWidth + hBackPorch - 1
  accActiveWidth: number // hSyncWidth + hBackPorch + activeWidth - 1
  totalWidth: number // hsyncWidth + hBackPorch + activeWidth + hFrontPorch - 1

  vSyncHeightComputed: number // vSyncHeight - 1
  accVBackPorch: number // vSyncHeight + vBackPorch - 1
  accActiveHeight: number // vSyncHeight + vBackPorch + activeHeight - 1
  totalHeight: number // vSyncHeight + vBackPorch + activeHeight + vFrontPorch - 1
}

export type LTDCState = LTDCConfigState & LTDCComputedState

export type ClkConfigState = {
  oscSourceValue: number
  pllM: number
  pllSaiN: number
  pllSaiR: number
  pllSaiDivR: number
}

export type ClkStateComputed = {
  lcdTftClockFrequency: number
}

export type ClkState = ClkConfigState & ClkStateComputed
