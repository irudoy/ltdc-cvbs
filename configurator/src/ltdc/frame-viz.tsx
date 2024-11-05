import { useEffect, useRef } from 'react'
import type { State } from '../types'

interface Section {
  x: number
  y: number
  width: number
  height: number
  color: string
  label: string
  guide?: 'x' | 'y'
}

const CANVAS_PADDING = 115

const OFFSET_X = 100
const LABEL_OFFSET_X = OFFSET_X - 50

const OFFSET_Y = 80
const LABEL_OFFSET_Y = OFFSET_Y - 30

export function FrameViz({ state }: { state: State }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = (state.totalWidth + CANVAS_PADDING) * dpr // Extra space for labels
    canvas.height = (state.totalHeight + CANVAS_PADDING) * dpr // Extra space for labels
    canvas.style.width = `${state.totalWidth + CANVAS_PADDING}px`
    canvas.style.height = `${state.totalHeight + CANVAS_PADDING}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.font = '12px Arial'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Helper function to draw rounded label
    const drawLabel = (x: number, y: number, label: string, color: string) => {
      const labelWidth = ctx.measureText(label).width
      const paddingX = 4
      const paddingY = 1
      const rectX = x - labelWidth / 2 - paddingX
      const rectY = y - 12 - paddingY
      const rectWidth = labelWidth + paddingX * 2
      const rectHeight = 16 + paddingY * 2
      const radius = 5

      ctx.fillStyle = '#FFFFFF'
      ctx.strokeStyle = color
      ctx.lineWidth = 1

      // Draw rounded rectangle
      ctx.beginPath()
      ctx.moveTo(rectX + radius, rectY)
      ctx.lineTo(rectX + rectWidth - radius, rectY)
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY,
        rectX + rectWidth,
        rectY + radius
      )
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius)
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY + rectHeight,
        rectX + rectWidth - radius,
        rectY + rectHeight
      )
      ctx.lineTo(rectX + radius, rectY + rectHeight)
      ctx.quadraticCurveTo(
        rectX,
        rectY + rectHeight,
        rectX,
        rectY + rectHeight - radius
      )
      ctx.lineTo(rectX, rectY + radius)
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY)
      ctx.closePath()

      ctx.fill()
      ctx.stroke()

      // Draw text
      ctx.fillStyle = color
      ctx.fillText(label, x - labelWidth / 2, y)
    }

    // Helper function to draw a section
    const drawSection = (
      x: number,
      y: number,
      width: number,
      height: number,
      color: string,
      label = ''
    ) => {
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)
      if (label) {
        const labelX = x + width / 2
        const labelY = y + height / 2 + 5
        drawLabel(labelX, labelY, label, color)
      }
    }

    // Helper function to draw a guide line
    const drawGuide = (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      color: string
    ) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw sections
    const sections: Section[] = [
      {
        x: state.accHBackPorch + OFFSET_X,
        y: state.accVBackPorch + OFFSET_Y,
        width: state.activeWidth,
        height: state.activeHeight,
        color: '#32CD32',
        label: 'Active Display',
      },
      {
        x: OFFSET_X,
        y: OFFSET_Y,
        width: state.totalWidth,
        height: state.vSyncHeightComputed,
        color: '#FF6347',
        label: 'VS',
        guide: 'x',
      },
      {
        x: OFFSET_X,
        y: OFFSET_Y + state.vSyncHeightComputed,
        width: state.totalWidth,
        height: state.accVBackPorch - state.vSyncHeightComputed,
        color: '#B22222',
        label: 'VBP',
        guide: 'x',
      },
      {
        x: OFFSET_X,
        y: OFFSET_Y + state.accActiveHeight,
        width: state.totalWidth,
        height: state.totalHeight - state.accActiveHeight,
        color: '#cb1123',
        label: 'VFP',
        guide: 'x',
      },
      {
        x: OFFSET_X,
        y: OFFSET_Y,
        width: state.hSyncWidthComputed,
        height: state.totalHeight,
        color: '#4169E1',
        label: 'HS',
        guide: 'y',
      },
      {
        x: OFFSET_X + state.hSyncWidthComputed,
        y: OFFSET_Y,
        width: state.accHBackPorch - state.hSyncWidthComputed,
        height: state.totalHeight,
        color: '#1E90FF',
        label: 'HBP',
        guide: 'y',
      },
      {
        x: OFFSET_X + state.accActiveWidth,
        y: OFFSET_Y,
        width: state.totalWidth - state.accActiveWidth,
        height: state.totalHeight,
        color: '#4da8e0',
        label: 'HFP',
        guide: 'y',
      },
    ]

    sections.forEach(({ x, y, width, height, color, label, guide }) => {
      drawSection(
        x,
        y,
        width,
        height,
        color,
        guide === undefined ? label : undefined
      )

      if (guide === 'x') {
        const startX = x
        const startY = y + height / 2
        const endX = LABEL_OFFSET_X
        const endY = y + height / 2

        drawGuide(startX, startY, endX, endY, color)
        drawLabel(endX, endY + 4, label, color)
      }

      if (guide === 'y') {
        const startX = x + width / 2
        const startY = y
        const endX = x + width / 2
        const endY = LABEL_OFFSET_Y

        drawGuide(startX, startY, endX, endY, color)
        drawLabel(endX, endY, label, color)
      }
    })
  }, [state])

  return <canvas ref={canvasRef} />
}
