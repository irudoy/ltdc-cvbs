import { type InputNumberProps, InputNumber, Typography } from 'antd'
import type { TextProps } from 'antd/es/typography/Text'
import { formatBin, formatHex } from './utils'

export function Bytes({
  children,
  binary = false,
  ...textProps
}: { children: number | [number, number]; binary?: boolean } & TextProps) {
  const format = binary ? formatBin : formatHex
  const content = Array.isArray(children)
    ? children.map((v) => format(v, 1)).join('-')
    : format(children, 1)
  return (
    <Typography.Text code {...textProps}>
      {content}
    </Typography.Text>
  )
}

export function InputHex(props: InputNumberProps) {
  return (
    <InputNumber
      {...props}
      formatter={(value) => `0x${Number(value).toString(16).toUpperCase()}`}
      parser={(value) => parseInt(value?.replace(/^0x/i, '') || '0', 16)}
    />
  )
}
