import type { LTDCConfigState, ClkConfigState } from './types'

const MESSAGE_SIZE = 64

export type MessageOut = Uint8Array
export type MessageIn = {
  type: number
  size: number
  data: Uint8Array
}

enum CommandOut {
  NEXT_SCREEN = 0xc1,
  PREV_SCREEN = 0xc2,
  GET_CONFIG = 0xc3,
  PUSH_CONFIG = 0xc4,
  GET_CLK_CONFIG = 0xc5,
  PUSH_CLK_CONFIG = 0xc6,
  GET_ADV7393_CONFIG = 0xc7,
  PUSH_ADV7393_CONFIG = 0xc8,
}

export enum DataTypeIn {
  LTDC_CONFIG = 0xf1,
  LTDC_CLK_CONFIG = 0xf2,
  ADV7393_CONFIG = 0xf3,
  ADV7393_CHANGESET = 0xf4,
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
  oscSourceValue: number
  pllM: number
  pllSaiN: number
  pllSaiR: number
  pllSaiDivR: number
}

type MessageADV7393Config = {
  type: DataTypeIn.ADV7393_CONFIG
  data: Map<number, number>
}

type MessageADV7393Changeset = {
  type: DataTypeIn.ADV7393_CHANGESET
  data: Set<number>
}

export type MessageInParsed =
  | MessageLTDCConfig
  | MessageClkConfig
  | MessageADV7393Config
  | MessageADV7393Changeset

function calcCrc(data: Uint8Array): number {
  let crc = 0
  for (let i = 0; i < data.length - 1; i++) {
    crc += data[i]
  }
  return crc & 0xff
}

function createPacket(command: CommandOut, payload?: Uint8Array): MessageOut {
  const message = new Uint8Array(MESSAGE_SIZE)
  message.set([command, ...(payload ? [payload.length, ...payload] : [])])
  message.set([calcCrc(message)], MESSAGE_SIZE - 1)
  return message
}

export function nextScreen(): MessageOut {
  return createPacket(CommandOut.NEXT_SCREEN)
}

export function prevScreen(): MessageOut {
  return createPacket(CommandOut.PREV_SCREEN)
}

export function getLTDCConfig(): MessageOut {
  return createPacket(CommandOut.GET_CONFIG)
}

export function getClkConfig(): MessageOut {
  return createPacket(CommandOut.GET_CLK_CONFIG)
}

export function getAdv7393Config(registers: number[]): MessageOut {
  return createPacket(CommandOut.GET_ADV7393_CONFIG, new Uint8Array(registers))
}

export function pushLTDCConfig(s: LTDCConfigState): MessageOut {
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

export function pushClkConfig(s: ClkConfigState): MessageOut {
  const values = new Int32Array([s.pllSaiN, s.pllSaiR, s.pllSaiDivR])
  const payload: Uint8Array = new Uint8Array(12)
  payload.set(new Uint8Array(values.buffer))

  return createPacket(CommandOut.PUSH_CLK_CONFIG, payload)
}

export function pushAdv7393Config(data: Record<number, number>): MessageOut {
  const entries = Object.entries(data)
  const payload = new Uint8Array(entries.length * 2)

  let i = 0
  for (const [address, value] of entries) {
    payload[i++] = parseInt(address, 10)
    payload[i++] = value
  }

  return createPacket(CommandOut.PUSH_ADV7393_CONFIG, payload)
}

export function createMessageReader(
  onMessageReceive: (message: MessageIn) => void
): (chunk: Uint8Array) => void {
  let buffer = new Uint8Array(0)

  return function readChunk(chunk: Uint8Array) {
    buffer = new Uint8Array([...buffer, ...chunk])

    while (buffer.length >= MESSAGE_SIZE) {
      const message = buffer.slice(0, MESSAGE_SIZE)
      buffer = buffer.slice(MESSAGE_SIZE)

      const crc = calcCrc(message)
      if (crc !== message[MESSAGE_SIZE - 1]) {
        console.error('CRC mismatch', crc, message[MESSAGE_SIZE - 1], message)
        continue
      }

      const type = message[0]
      const size = message[1]
      const data = message.slice(2, 2 + size)

      onMessageReceive({ type, size, data })
    }
  }
}

export function parsedMessageLTDCConfigToState(
  m: MessageLTDCConfig
): LTDCConfigState {
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
      const [oscSourceValue, pllM, pllSaiN, pllSaiR, pllSaiDivR] =
        new Int32Array(m.data.buffer)

      return {
        type: DataTypeIn.LTDC_CLK_CONFIG,
        oscSourceValue,
        pllM,
        pllSaiN,
        pllSaiR,
        pllSaiDivR,
      }
    }
    case DataTypeIn.ADV7393_CONFIG: {
      const data = new Map<number, number>()
      for (let i = 0; i < m.size; i += 2) {
        data.set(m.data[i], m.data[i + 1])
      }
      console.log(m, data)
      return { type: DataTypeIn.ADV7393_CONFIG, data }
    }
    case DataTypeIn.ADV7393_CHANGESET: {
      const data = new Set<number>()
      for (let i = 0; i < m.size; i += 2) {
        data.add(m.data[i])
      }
      console.log(m, data)
      return { type: DataTypeIn.ADV7393_CHANGESET, data }
    }
    default:
      throw new Error(`Unknown message type ${m.type}`)
  }
}
