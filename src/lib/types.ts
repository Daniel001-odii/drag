export interface StageSize {
  width: number
  height: number
  name: string
  description: string
}

export interface Background {
  type: 'solid' | 'gradient' | 'image'
  value: string
  name?: string
}

export interface SolidBackground extends Background {
  type: 'solid'
  value: string // hex color
}

export interface GradientBackground extends Background {
  type: 'gradient'
  value: string // gradient CSS string
  direction: 'linear' | 'radial'
  stops: Array<{ color: string; position: number }>
}

export interface ImageBackground extends Background {
  type: 'image'
  value: string // image URL or data URL
  name: string
  size: 'cover' | 'contain' | 'stretch' | 'repeat'
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export interface CanvasElement {
  id: string
  type: 'rect' | 'circle' | 'text'
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  fill: string
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
  textAlign?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  lineHeight?: number
  charSpacing?: number
  draggable: boolean
  rotation?: number
  borderRadius?: number
}

export interface TextElement {
  type: 'text'
  fontFamily?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline'
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  fill?: string
  stroke?: string
  strokeWidth?: number
  lineHeight?: number
  charSpacing?: number
  opacity?: number
  shadow?: {
    color: string
    blur: number
    offsetX: number
    offsetY: number
  }
}

export interface ObjectElement {
  type: 'rect' | 'circle'
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  rotation?: number
  width?: number
  height?: number
  radius?: number
  left?: number
  top?: number
  scaleX?: number
  scaleY?: number
  shadow?: {
    color: string
    blur: number
    offsetX: number
    offsetY: number
  }
  borderRadius?: number
  rx?: number
  ry?: number
}

export interface ACoords {
  tl: fabric.Point
  tr: fabric.Point
  bl: fabric.Point
  br: fabric.Point
}

export interface FabricObjectWithACoords extends fabric.Object {
  aCoords?: ACoords
} 