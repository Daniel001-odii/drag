import * as fabric from 'fabric'

export interface CanvasConfig {
  width: number
  height: number
  selectionColor?: string
  selectionBorderColor?: string
  selectionLineWidth?: number
  transparentCorners?: boolean
  borderColor?: string
  cornerColor?: string
  cornerStrokeColor?: string
  cornerSize?: number
  cornerStyle?: 'circle' | 'rect'
  cornerDashArray?: number[]
  hasRotatingPoint?: boolean
  rotatingPointOffset?: number
  padding?: number
  borderScaleFactor?: number
  borderDashArray?: number[]
}

export const defaultCanvasConfig: CanvasConfig = {
  width: 800,
  height: 600,
  selectionColor: 'rgba(59, 130, 246, 0.3)',
  selectionBorderColor: '#3b82f6',
  selectionLineWidth: 2,
  transparentCorners: false,
  borderColor: '#3b82f6',
  cornerColor: '#ffffff',
  cornerStrokeColor: '#3b82f6',
  cornerSize: 12,
  cornerStyle: 'circle',
  cornerDashArray: [0, 0],
  hasRotatingPoint: true,
  rotatingPointOffset: 40,
  padding: 10,
  borderScaleFactor: 2,
  borderDashArray: [5, 5],
}

export const createCanvas = (canvasElement: HTMLCanvasElement, config: CanvasConfig = defaultCanvasConfig): fabric.Canvas => {
  return new fabric.Canvas(canvasElement, {
    width: config.width,
    height: config.height,
    selection: true,
    preserveObjectStacking: true,
    // Customize selection appearance
    selectionColor: config.selectionColor,
    selectionBorderColor: config.selectionBorderColor,
    selectionLineWidth: config.selectionLineWidth,
    // Customize control appearance
    transparentCorners: config.transparentCorners,
    borderColor: config.borderColor,
    cornerColor: config.cornerColor,
    cornerStrokeColor: config.cornerStrokeColor,
    cornerSize: config.cornerSize,
    cornerStyle: config.cornerStyle,
    cornerDashArray: config.cornerDashArray,
    // Rotation control
    hasRotatingPoint: config.hasRotatingPoint,
    rotatingPointOffset: config.rotatingPointOffset,
    // Padding for controls
    padding: config.padding,
    // Additional anchor customization
    borderScaleFactor: config.borderScaleFactor,
    borderDashArray: config.borderDashArray,
  })
}

export interface CanvasEventHandlers {
  onMouseDown?: (e: unknown) => void
  onMouseUp?: (e: unknown) => void
  onObjectMoving?: (e: unknown) => void
  onObjectModified?: (e: unknown) => void
  onSelectionCleared?: () => void
  onKeyDown?: (e: KeyboardEvent) => void
}

export const setupCanvasEventListeners = (
  canvas: fabric.Canvas, 
  handlers: CanvasEventHandlers
): (() => void) => {
  const cleanupFunctions: (() => void)[] = []

  if (handlers.onMouseDown) {
    canvas.on('mouse:down', handlers.onMouseDown)
    cleanupFunctions.push(() => canvas.off('mouse:down', handlers.onMouseDown!))
  }

  if (handlers.onMouseUp) {
    canvas.on('mouse:up', handlers.onMouseUp)
    cleanupFunctions.push(() => canvas.off('mouse:up', handlers.onMouseUp!))
  }

  if (handlers.onObjectMoving) {
    canvas.on('object:moving', handlers.onObjectMoving)
    cleanupFunctions.push(() => canvas.off('object:moving', handlers.onObjectMoving!))
  }

  if (handlers.onObjectModified) {
    canvas.on('object:modified', handlers.onObjectModified)
    cleanupFunctions.push(() => canvas.off('object:modified', handlers.onObjectModified!))
  }

  if (handlers.onSelectionCleared) {
    canvas.on('selection:cleared', handlers.onSelectionCleared)
    cleanupFunctions.push(() => canvas.off('selection:cleared', handlers.onSelectionCleared!))
  }

  if (handlers.onKeyDown) {
    document.addEventListener('keydown', handlers.onKeyDown)
    cleanupFunctions.push(() => document.removeEventListener('keydown', handlers.onKeyDown!))
  }

  return () => {
    cleanupFunctions.forEach(cleanup => cleanup())
  }
}

export const disposeCanvas = (canvas: fabric.Canvas | null): void => {
  if (canvas) {
    canvas.dispose()
  }
} 

/**
 * Export canvas as PNG image
 * @param canvas - Fabric.js canvas instance
 * @param options - Export options
 * @returns Promise<string> - Data URL of the exported PNG
 */
export const exportCanvasAsPNG = async (
  canvas: fabric.Canvas,
  options: {
    format?: 'png' | 'jpeg'
    quality?: number
    multiplier?: number
    left?: number
    top?: number
    width?: number
    height?: number
  } = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const {
        format = 'png',
        quality = 1,
        multiplier = 1,
        left = 0,
        top = 0,
        width = canvas.width || 800,
        height = canvas.height || 600
      } = options

      // Try to export directly first
      try {
        const dataURL = canvas.toDataURL({
          format,
          quality,
          multiplier,
          left,
          top,
          width,
          height
        })
        resolve(dataURL)
        return
      } catch (error) {
        // If direct export fails due to tainted canvas, create a clean version
        console.warn('Canvas export failed due to tainted canvas, creating clean version...', error)
        
        // Create a temporary canvas for export
        const tempCanvas = document.createElement('canvas')
        const tempContext = tempCanvas.getContext('2d')
        
        if (!tempContext) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Set canvas dimensions
        tempCanvas.width = width * multiplier
        tempCanvas.height = height * multiplier

        // Create a clean version of the canvas without tainted images
        const cleanCanvas = new fabric.Canvas(tempCanvas, {
          width: width * multiplier,
          height: height * multiplier,
          backgroundColor: canvas.backgroundColor || '#ffffff'
        })

        // Create a simple canvas with background and recreate non-image objects
        console.log('Creating clean canvas with background and non-image objects...')
        
        // Set the background color
        cleanCanvas.backgroundColor = canvas.backgroundColor || '#ffffff'
        
        // Get all objects and recreate non-image ones
        const objects = canvas.getObjects()
        
        objects.forEach(obj => {
          if (obj.type !== 'image') {
            try {
              // Create new objects based on their type instead of cloning
              let newObj: fabric.Object | null = null
              
              if (obj.type === 'text') {
                const textObj = obj as fabric.Text
                newObj = new fabric.Text(textObj.text || '', {
                  left: textObj.left,
                  top: textObj.top,
                  fontSize: textObj.fontSize,
                  fontFamily: textObj.fontFamily,
                  fill: textObj.fill,
                  angle: textObj.angle,
                  scaleX: textObj.scaleX,
                  scaleY: textObj.scaleY,
                  fontWeight: textObj.fontWeight,
                  fontStyle: textObj.fontStyle,
                  textAlign: textObj.textAlign,
                  underline: textObj.underline,
                  linethrough: textObj.linethrough,
                  overline: textObj.overline
                })
              } else if (obj.type === 'rect') {
                const rectObj = obj as fabric.Rect
                newObj = new fabric.Rect({
                  left: rectObj.left,
                  top: rectObj.top,
                  width: rectObj.width,
                  height: rectObj.height,
                  fill: rectObj.fill,
                  stroke: rectObj.stroke,
                  strokeWidth: rectObj.strokeWidth,
                  angle: rectObj.angle,
                  scaleX: rectObj.scaleX,
                  scaleY: rectObj.scaleY
                })
              } else if (obj.type === 'circle') {
                const circleObj = obj as fabric.Circle
                newObj = new fabric.Circle({
                  left: circleObj.left,
                  top: circleObj.top,
                  radius: circleObj.radius,
                  fill: circleObj.fill,
                  stroke: circleObj.stroke,
                  strokeWidth: circleObj.strokeWidth,
                  angle: circleObj.angle,
                  scaleX: circleObj.scaleX,
                  scaleY: circleObj.scaleY
                })
              } else if (obj.type === 'triangle') {
                const triangleObj = obj as fabric.Triangle
                newObj = new fabric.Triangle({
                  left: triangleObj.left,
                  top: triangleObj.top,
                  width: triangleObj.width,
                  height: triangleObj.height,
                  fill: triangleObj.fill,
                  stroke: triangleObj.stroke,
                  strokeWidth: triangleObj.strokeWidth,
                  angle: triangleObj.angle,
                  scaleX: triangleObj.scaleX,
                  scaleY: triangleObj.scaleY
                })
              } else if (obj.type === 'ellipse') {
                const ellipseObj = obj as fabric.Ellipse
                newObj = new fabric.Ellipse({
                  left: ellipseObj.left,
                  top: ellipseObj.top,
                  rx: ellipseObj.rx,
                  ry: ellipseObj.ry,
                  fill: ellipseObj.fill,
                  stroke: ellipseObj.stroke,
                  strokeWidth: ellipseObj.strokeWidth,
                  angle: ellipseObj.angle,
                  scaleX: ellipseObj.scaleX,
                  scaleY: ellipseObj.scaleY
                })
              }
              
              if (newObj) {
                cleanCanvas.add(newObj)
              }
            } catch (createError) {
              console.warn('Failed to recreate object:', createError)
              // Skip this object if creation fails
            }
          }
        })
        
        // Render the clean canvas
        cleanCanvas.renderAll()

        // Export the clean canvas
        try {
          const dataURL = cleanCanvas.toDataURL({
            format,
            quality,
            multiplier: 1, // Use 1 for clean canvas
            left: 0,
            top: 0,
            width: width * multiplier,
            height: height * multiplier
          })

          // Dispose of the temporary canvas
          cleanCanvas.dispose()

          resolve(dataURL)
        } catch (exportError) {
          console.warn('Failed to export clean canvas, trying empty canvas...', exportError)
          
          // If even the clean canvas fails, create an empty canvas with just background
          const emptyCanvas = new fabric.Canvas(document.createElement('canvas'), {
            width: width * multiplier,
            height: height * multiplier,
            backgroundColor: canvas.backgroundColor || '#ffffff'
          })
          
          try {
            const dataURL = emptyCanvas.toDataURL({
              format,
              quality,
              multiplier: 1,
              left: 0,
              top: 0,
              width: width * multiplier,
              height: height * multiplier
            })
            
            emptyCanvas.dispose()
            resolve(dataURL)
          } catch (finalError) {
            emptyCanvas.dispose()
            reject(new Error('Failed to export canvas: ' + finalError))
          }
        }
      }
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Download canvas as PNG file
 * @param canvas - Fabric.js canvas instance
 * @param filename - Name of the file to download
 * @param options - Export options
 */
export const downloadCanvasAsPNG = async (
  canvas: fabric.Canvas,
  filename: string = 'canvas-export.png',
  options: {
    format?: 'png' | 'jpeg'
    quality?: number
    multiplier?: number
    left?: number
    top?: number
    width?: number
    height?: number
  } = {}
): Promise<void> => {
  try {
    const dataURL = await exportCanvasAsPNG(canvas, options)
    
    // Create download link
    const link = document.createElement('a')
    link.download = filename
    link.href = dataURL
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading canvas:', error)
    throw error
  }
}

/**
 * Export canvas as JSON
 * @param canvas - Fabric.js canvas instance
 * @param options - Export options
 * @returns Promise<string> - JSON string of the canvas
 */
export const exportCanvasAsJSON = async (
  canvas: fabric.Canvas,
  options: {
    includeBackground?: boolean
    includeBackgroundImage?: boolean
    includeCustomProperties?: boolean
  } = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const {
        includeBackground = true,
        includeBackgroundImage = true,
      } = options

      // Get canvas JSON with specified options
      const canvasJSON = canvas.toJSON()

      // Create a complete project object
      const projectData = {
        version: '1.0.0',
        name: 'Fizzle Design',
        createdAt: new Date().toISOString(),
        canvas: {
          width: canvas.width,
          height: canvas.height,
          backgroundColor: includeBackground ? canvas.backgroundColor : undefined,
          backgroundImage: includeBackgroundImage ? canvas.backgroundImage : undefined,
          objects: canvasJSON.objects || [],
          version: canvasJSON.version
        },
        metadata: {
          totalObjects: canvasJSON.objects?.length || 0,
          exportDate: new Date().toISOString(),
          app: 'Fizzle'
        }
      }

      resolve(JSON.stringify(projectData, null, 2))
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Export canvas as pure Fabric JSON (without wrapper)
 * @param canvas - Fabric.js canvas instance
 * @param options - Export options
 * @returns Promise<string> - Pure Fabric JSON string
 */
export const exportPureFabricJSON = async (
  canvas: fabric.Canvas,
  options: {
    includeBackground?: boolean
    includeBackgroundImage?: boolean
    includeCustomProperties?: boolean
  } = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const {
        includeBackground = true,
        includeBackgroundImage = true,
      } = options

      // Get pure Fabric.js JSON
      const fabricJSON = canvas.toJSON()

      // Add canvas dimensions and background if requested
      if (includeBackground) {
        fabricJSON.width = canvas.width
        fabricJSON.height = canvas.height
        fabricJSON.backgroundColor = canvas.backgroundColor
      }

      if (includeBackgroundImage && canvas.backgroundImage) {
        fabricJSON.backgroundImage = canvas.backgroundImage
      }

      resolve(JSON.stringify(fabricJSON, null, 2))
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Download canvas as pure Fabric JSON file
 * @param canvas - Fabric.js canvas instance
 * @param filename - Name of the file to download
 * @param options - Export options
 */
export const downloadPureFabricJSON = async (
  canvas: fabric.Canvas,
  filename: string = 'fabric-canvas.json',
  options: {
    includeBackground?: boolean
    includeBackgroundImage?: boolean
    includeCustomProperties?: boolean
  } = {}
): Promise<void> => {
  try {
    const jsonString = await exportPureFabricJSON(canvas, options)
    
    // Create blob with JSON data
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // Create download link
    const link = document.createElement('a')
    link.download = filename
    link.href = url
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the URL object
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading pure Fabric JSON:', error)
    throw error
  }
}

/**
 * Download canvas as JSON file
 * @param canvas - Fabric.js canvas instance
 * @param filename - Name of the file to download
 * @param options - Export options
 */
export const downloadCanvasAsJSON = async (
  canvas: fabric.Canvas,
  filename: string = 'fizzle-project.json',
  options: {
    includeBackground?: boolean
    includeBackgroundImage?: boolean
    includeCustomProperties?: boolean
  } = {}
): Promise<void> => {
  try {
    const jsonString = await exportCanvasAsJSON(canvas, options)
    
    // Create blob with JSON data
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // Create download link
    const link = document.createElement('a')
    link.download = filename
    link.href = url
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the URL object
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading JSON:', error)
    throw error
  }
}

/**
 * Import canvas from JSON file
 * @param canvas - Fabric.js canvas instance
 * @param jsonData - JSON string or object to import
 * @param options - Import options
 */
export const importCanvasFromJSON = async (
  canvas: fabric.Canvas,
  jsonData: string | object,
  options: {
    clearCanvas?: boolean
    preserveAspectRatio?: boolean
    onCanvasSizeChange?: (size: { width: number; height: number }) => void
  } = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const {
        clearCanvas = true,
        onCanvasSizeChange
      } = options

      // Parse JSON if it's a string
      const projectData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData

      // Validate the JSON structure
      if (!projectData.canvas || !projectData.canvas.objects) {
        throw new Error('Invalid project file format')
      }

      // Clear canvas if requested
      if (clearCanvas) {
        canvas.clear()
      }

      // Set canvas dimensions if they exist
      if (projectData.canvas.width && projectData.canvas.height) {
        canvas.setDimensions({
          width: projectData.canvas.width,
          height: projectData.canvas.height
        })
        
        // Call the callback to update UI state if provided
        if (onCanvasSizeChange) {
          onCanvasSizeChange({
            width: projectData.canvas.width,
            height: projectData.canvas.height
          })
        }
      }

      // Set background color if it exists
      if (projectData.canvas.backgroundColor) {
        canvas.backgroundColor = projectData.canvas.backgroundColor
      }

      

      // Load objects from JSON using promise syntax
      canvas.loadFromJSON(projectData.canvas).then((fabricCanvas) => {
        fabricCanvas.requestRenderAll()
        resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
} 