import type { ConfigState, ClkState } from './types'

const MESSAGE_OUT_SIZE = 64

export type MessageOut = Uint8Array
export type MessageIn = {
  type: number
  size: number
  data: Uint8Array
}

enum CommandOut {
  NEXT_SCREEN = 0x01,
  PREV_SCREEN = 0x02,
  GET_CONFIG = 0x03,
  PUSH_CONFIG = 0x04,
  GET_CLK_CONFIG = 0x05,
  PUSH_CLK_CONFIG = 0x06,
}

export enum DataTypeIn {
  LTDC_CONFIG = 0x01,
  LTDC_CLK_CONFIG = 0x02,
}

type MessageLTDCConfig = {
  type: DataTypeIn.LTDC_CONFIG
  horizontalSync: number
  verticalSync: number
  accumulatedHBP: number
  accumulatedVBP: number
  accumulatedActiveW: number
  accumulatedActiveH: number
  totalWidth: number
  totalHeight: number
  imageWidth: number
  imageHeight: number
}

type MessageClkConfig = {
  type: DataTypeIn.LTDC_CLK_CONFIG
  pllSaiN: number
  pllSaiR: number
  pllSaiDivR: number
}

type MessageInParsed = MessageLTDCConfig | MessageClkConfig

function createPacket(command: CommandOut, payload?: Uint8Array): MessageOut {
  const message = new Uint8Array(MESSAGE_OUT_SIZE)
  message.set([command, ...(payload ?? [])])
  return message
}

export function nextScreen(): MessageOut {
  return createPacket(CommandOut.NEXT_SCREEN)
}

export function prevScreen(): MessageOut {
  return createPacket(CommandOut.PREV_SCREEN)
}

export function getConfig(): MessageOut {
  return createPacket(CommandOut.GET_CONFIG)
}

export function getClkConfig(): MessageOut {
  return createPacket(CommandOut.GET_CLK_CONFIG)
}

export function pushConfig(s: ConfigState): MessageOut {
  const horizontalSync = s.hSyncWidth - 1
  const verticalSync = s.vSyncHeight - 1
  const accumulatedHBP = s.hBackPorch + horizontalSync
  const accumulatedVBP = s.vBackPorch + verticalSync
  const accumulatedActiveW = s.activeWidth + accumulatedHBP
  const accumulatedActiveH = s.activeHeight + accumulatedVBP
  const totalWidth = accumulatedActiveW + s.hFrontPorch
  const totalHeight = accumulatedActiveH + s.vFrontPorch

  const values = new Int32Array([
    horizontalSync,
    verticalSync,
    accumulatedHBP,
    accumulatedVBP,
    accumulatedActiveW,
    accumulatedActiveH,
    totalWidth,
    totalHeight,
    s.activeWidth,
    s.activeHeight,
  ])

  const payload: Uint8Array = new Uint8Array(40)
  payload.set(new Uint8Array(values.buffer))

  return createPacket(CommandOut.PUSH_CONFIG, payload)
}

export function pushClkConfig(s: ClkState): MessageOut {
  const values = new Int32Array([s.pllSaiN, s.pllSaiR, s.pllSaiDivR])
  const payload: Uint8Array = new Uint8Array(12)
  payload.set(new Uint8Array(values.buffer))

  return createPacket(CommandOut.PUSH_CLK_CONFIG, payload)
}

export function createMessageReader(
  onMessageReceive: (message: MessageIn) => void
): (chunk: Uint8Array) => void {
  let buffer: Uint8Array | null = null
  let type: number | null = null
  let size: number | null = null
  let bytesRead = 0

  return function readChunk(chunk: Uint8Array) {
    if (!buffer) {
      type = chunk[0]
      size = chunk[1]
      buffer = new Uint8Array(size)
      buffer.set(chunk.subarray(2))
      bytesRead = chunk.length - 2
    } else {
      buffer.set(chunk, bytesRead)
      bytesRead += chunk.length
    }

    if (bytesRead === size) {
      onMessageReceive({ type: type!, size: size!, data: buffer })
      buffer = null
      bytesRead = 0
    }
  }
}

export function parsedMessageLTDCConfigToState(
  m: MessageLTDCConfig
): ConfigState {
  return {
    hSyncWidth: m.horizontalSync + 1,
    vSyncHeight: m.verticalSync + 1,
    hBackPorch: m.accumulatedHBP - m.horizontalSync,
    vBackPorch: m.accumulatedVBP - m.verticalSync,
    activeWidth: m.accumulatedActiveW - m.accumulatedHBP,
    activeHeight: m.accumulatedActiveH - m.accumulatedVBP,
    hFrontPorch: m.totalWidth - m.accumulatedActiveW,
    vFrontPorch: m.totalHeight - m.accumulatedActiveH,
  }
}

export function parseMessageIn(m: MessageIn): MessageInParsed {
  console.log('MessageIn:', m)

  switch (m.type) {
    case DataTypeIn.LTDC_CONFIG: {
      const [
        horizontalSync,
        verticalSync,
        accumulatedHBP,
        accumulatedVBP,
        accumulatedActiveW,
        accumulatedActiveH,
        totalWidth,
        totalHeight,
        imageWidth,
        imageHeight,
      ] = new Int32Array(m.data.buffer)
      return {
        type: DataTypeIn.LTDC_CONFIG,
        horizontalSync,
        verticalSync,
        accumulatedHBP,
        accumulatedVBP,
        accumulatedActiveW,
        accumulatedActiveH,
        totalWidth,
        totalHeight,
        imageWidth,
        imageHeight,
      }
    }
    case DataTypeIn.LTDC_CLK_CONFIG: {
      const [pllSaiN, pllSaiR, pllSaiDivR] = new Int32Array(m.data.buffer)
      return {
        type: DataTypeIn.LTDC_CLK_CONFIG,
        pllSaiN,
        pllSaiR,
        pllSaiDivR,
      }
    }
    default:
      throw new Error(`Unknown message type ${m.type}`)
  }
}
