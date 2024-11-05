import { useEffect, useState } from 'react'
import { Button, ConfigProvider, theme } from 'antd'
import { SerialProvider } from './serial'
import { nextScreen, prevScreen } from './api'
import { LtdcConfigurator } from './ltdc'
import { ClockConfigurator } from './clock'
import { RegisterConfigurator } from './adv7393'
import { useStm32Serial } from './serial-stm32'

function Root() {
  const { connect, disconnect, portState, sendMessage } = useStm32Serial()

  return (
    <div className="flex flex-col gap-4 py-1">
      <div className="flex items-center gap-4">
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
          </>
        )}
      </div>
      <LtdcConfigurator />
      <ClockConfigurator />
      <RegisterConfigurator />
    </div>
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
