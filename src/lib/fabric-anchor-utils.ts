import * as fabric from 'fabric'

// ========================================
// CUSTOM ANCHOR STYLING OPTIONS
// ========================================
// You can easily customize these values to change the appearance:
//
// Corner Controls (resize handles):
// - cornerStyle: 'circle' | 'rect' | 'cross' | 'diamond'
// - cornerSize: number (default: 12)
// - cornerColor: string (fill color)
// - cornerStrokeColor: string (border color)
// - transparentCorners: boolean (background transparency)
//
// Border (selection outline):
// - borderColor: string (outline color)
// - borderScaleFactor: number (outline thickness)
// - borderDashArray: number[] (dashed line pattern)
//
// Control Points:
// - mt: middle top (resize vertically)
// - mb: middle bottom (resize vertically)
// - ml: middle left (resize horizontally)
// - mr: middle right (resize horizontally)
// - tl: top left (resize diagonally)
// - tr: top right (resize diagonally)
// - bl: bottom left (resize diagonally)
// - br: bottom right (resize diagonally)
// - mtr: rotation control
// ========================================

export interface AnchorStyles {
  cornerStyle: 'circle' | 'rect' | 'cross' | 'diamond'
  cornerSize: number
  cornerColor: string
  cornerStrokeColor: string
  transparentCorners: boolean
  borderColor: string
  borderScaleFactor: number
  borderDashArray: number[]
}

export const defaultAnchorStyles: AnchorStyles = {
  cornerStyle: 'circle',
  cornerSize: 12,
  cornerColor: '#ffffff',
  cornerStrokeColor: '#3b82f6',
  transparentCorners: false,
  borderColor: '#3b82f6',
  borderScaleFactor: 2,
  borderDashArray: [5, 5],
}

export const customizeAnchors = (canvas: fabric.Canvas, styles: AnchorStyles = defaultAnchorStyles) => {
  // Set global control styles for all objects
  fabric.Object.prototype.setControlsVisibility({
    mt: true, // middle top
    mb: true, // middle bottom
    ml: true, // middle left
    mr: true, // middle right
    bl: true, // bottom left
    br: true, // bottom right
    tl: true, // top left
    tr: true, // top right
    mtr: true, // rotation control
  })

  // Customize the appearance of controls globally
  fabric.Object.prototype.cornerStyle = styles.cornerStyle
  fabric.Object.prototype.cornerSize = styles.cornerSize
  fabric.Object.prototype.cornerColor = styles.cornerColor
  fabric.Object.prototype.cornerStrokeColor = styles.cornerStrokeColor
  fabric.Object.prototype.transparentCorners = styles.transparentCorners

  // Customize border appearance
  fabric.Object.prototype.borderColor = styles.borderColor
  fabric.Object.prototype.borderScaleFactor = styles.borderScaleFactor
  fabric.Object.prototype.borderDashArray = styles.borderDashArray

  // Override the default control point calculation to move rotation control below objects
  const originalGetControlPoint = (fabric.Object.prototype as any).getControlPoint
  ;(fabric.Object.prototype as any).getControlPoint = function(key: string, control: any) {
    const point = originalGetControlPoint.call(this, key, control)
    if (!point) return point

    // Move rotation control (mtr) to appear below the object
    if (key === 'mtr') {
      const objHeight = this.height || 0
      const objTop = this.top || 0
      point.y = objTop + objHeight + 40 // 40px below the object
    }

    return point
  }

  // Add custom cursor behavior for better UX
  canvas.on('mouse:over', (e) => {
    if (e.target) {
      canvas.defaultCursor = 'move'
    }
  })

  canvas.on('mouse:out', () => {
    canvas.defaultCursor = 'default'
  })
}

export const applyCustomAnchorStyles = (obj: fabric.Object, styles: AnchorStyles = defaultAnchorStyles) => {
  obj.set({
    cornerStyle: styles.cornerStyle,
    cornerSize: styles.cornerSize,
    cornerColor: styles.cornerColor,
    cornerStrokeColor: styles.cornerStrokeColor,
    transparentCorners: styles.transparentCorners,
    borderColor: styles.borderColor,
    borderScaleFactor: styles.borderScaleFactor,
    borderDashArray: styles.borderDashArray,
  })
  
  // Enable all control points
  obj.setControlsVisibility({
    mt: true, // middle top
    mb: true, // middle bottom
    ml: true, // middle left
    mr: true, // middle right
    bl: true, // bottom left
    br: true, // bottom right
    tl: true, // top left
    tr: true, // top right
    mtr: true, // rotation control
  })
} 