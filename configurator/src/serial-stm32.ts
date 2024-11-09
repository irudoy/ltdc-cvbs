import { useCallback, useEffect, useMemo } from 'react'
import { useSerial } from './serial'
import {
  type MessageIn,
  type MessageInParsed,
  type MessageOut,
  createMessageReader,
  parseMessageIn,
} from './api'

export const useStm32Serial = (rxCb?: (m: MessageInParsed) => void) => {
  const { connect, disconnect, subscribe, write, portState } = useSerial()

  const handleMessageReceive = useCallback(
    (m: MessageIn) => {
      if (rxCb) {
        rxCb(parseMessageIn(m))
      }
    },
    [rxCb]
  )

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

  const readMessageChunk = useMemo(() => {
    console.log('createMessageReader')
    return createMessageReader(handleMessageReceive)
  }, [handleMessageReceive])

  useEffect(() => {
    const unsubscribe = subscribe((message) => readMessageChunk(message.value))
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { connect, disconnect, portState, subscribe, sendMessage }
}
