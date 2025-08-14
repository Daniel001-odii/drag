import * as fabric from 'fabric'

export const addObjectToCanvas = (
  canvas: fabric.Canvas, 
  obj: fabric.Object, 
  setActive: boolean = true
): void => {
  canvas.add(obj)
  if (setActive) {
    canvas.setActiveObject(obj)
  }
  canvas.renderAll()
}

export const removeObjectFromCanvas = (
  canvas: fabric.Canvas, 
  obj: fabric.Object
): void => {
  canvas.remove(obj)
  canvas.renderAll()
}

export const bringObjectToFront = (
  canvas: fabric.Canvas, 
  obj: fabric.Object
): void => {
  canvas.bringObjectToFront(obj)
  canvas.renderAll()
}

export const sendObjectToBack = (
  canvas: fabric.Canvas, 
  obj: fabric.Object
): void => {
  canvas.sendObjectToBack(obj)
  canvas.renderAll()
}

export const lockObject = (obj: fabric.Object): void => {
  obj.set({
    selectable: true,
    evented: true,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    lockUniScaling: true,
    hasControls: true,
    hasBorders: true,
    editable: false
  })
}

export const unlockObject = (obj: fabric.Object): void => {
  obj.set({
    selectable: true,
    evented: true,
    lockMovementX: false,
    lockMovementY: false,
    lockRotation: false,
    lockScalingX: false,
    lockScalingY: false,
    lockUniScaling: false,
    hasControls: true,
    hasBorders: true,
    editable: true,
  })
}

export const isObjectLocked = (obj: fabric.Object): boolean => {
  return obj.lockMovementX === true
}

export const toggleObjectLock = (obj: fabric.Object): boolean => {
  const isLocked = isObjectLocked(obj)
  if (isLocked) {
    unlockObject(obj)
  } else {
    lockObject(obj)
  }
  return !isLocked
}

export const setObjectName = (obj: fabric.Object, name: string): void => {
  ;(obj as fabric.Object & { name?: string }).name = name
}

export const getObjectName = (obj: fabric.Object): string | undefined => {
  return (obj as fabric.Object & { name?: string }).name
}

export const generateObjectId = (): string => {
  return Date.now().toString()
}

export const updateMenuPosition = (object: fabric.Object, cursorPosition?: { x: number; y: number }): { x: number; y: number } => {
  // If cursor position is provided, use it for menu positioning
  if (cursorPosition) {
    const x = cursorPosition.x + 100
    const y = cursorPosition.y - 100 // Position menu above the cursor
    return { x, y, }
  }
  
  // Fallback to object-based positioning if no cursor position
  const aCoords = (object as fabric.Object & { aCoords?: Record<string, fabric.Point> }).aCoords
  
  if (aCoords) {
    // Extract all x and y values from aCoords
    const xValues = Object.values(aCoords).map((coord) => coord.x)
    const yValues = Object.values(aCoords).map((coord) => coord.y)
    
    // Find the lowest x and y values
    const lowestX = Math.min(...xValues)
    const lowestY = Math.min(...yValues)
    
    return { 
      x: lowestX + object.width,
      y: lowestY - 25 
    }
  }
  
  // Fallback to original method if aCoords is not available
  return { 
    x: (object?.left || 0) + 50, 
    y: (object?.top || 0) - 10 
  }
}

export const getCanvasCenter = (canvas: fabric.Canvas): { x: number; y: number } => {
  return {
    x: canvas.getWidth() / 2,
    y: canvas.getHeight() / 2
  }
}

export const getActiveObjects = (canvas: fabric.Canvas): fabric.Object[] => {
  return canvas.getActiveObjects()
}

export const clearSelection = (canvas: fabric.Canvas): void => {
  canvas.discardActiveObject()
  canvas.renderAll()
}

export const selectObject = (canvas: fabric.Canvas, obj: fabric.Object): void => {
  canvas.setActiveObject(obj)
  canvas.renderAll()
}

export const selectMultipleObjects = (canvas: fabric.Canvas, objects: fabric.Object[]): void => {
  const selection = new fabric.ActiveSelection(objects, { canvas })
  canvas.setActiveObject(selection)
  canvas.renderAll()
}

export const addImageToCanvas = (
  canvas: fabric.Canvas, 
  imageUrl: string, 
  options?: {
    left?: number
    top?: number
    scaleX?: number
    scaleY?: number
    angle?: number
    name?: string
  }
): Promise<fabric.Image> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    
    // Try with crossOrigin first
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const fabricImage = new fabric.Image(img, {
        left: options?.left || canvas.getWidth() / 2 - img.width / 2,
        top: options?.top || canvas.getHeight() / 2 - img.height / 2,
        scaleX: options?.scaleX || 1,
        scaleY: options?.scaleY || 1,
        angle: options?.angle || 0,
        name: options?.name || `Image_${Date.now()}`
      })
      
      addObjectToCanvas(canvas, fabricImage)
      resolve(fabricImage)
    }
    
    img.onerror = () => {
      // If crossOrigin fails, try without it
      console.warn('Failed to load image with crossOrigin, trying without...')
      const img2 = new window.Image()
      
      img2.onload = () => {
        const fabricImage = new fabric.Image(img2, {
          left: options?.left || canvas.getWidth() / 2 - img2.width / 2,
          top: options?.top || canvas.getHeight() / 2 - img2.height / 2,
          scaleX: options?.scaleX || 1,
          scaleY: options?.scaleY || 1,
          angle: options?.angle || 0,
          name: options?.name || `Image_${Date.now()}`
        })
        
        addObjectToCanvas(canvas, fabricImage)
        resolve(fabricImage)
      }
      
      img2.onerror = () => {
        reject(new Error('Failed to load image with or without crossOrigin'))
      }
      
      img2.src = imageUrl
    }
    
    img.src = imageUrl
  })
} 