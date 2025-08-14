import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import * as fabric from 'fabric'
import { ObjectFloatingMenu } from './object-floating-menu'
import { CanvasSettingsMenu } from './canvas-settings-menu'
import { customizeAnchors, applyCustomAnchorStyles } from '../lib/fabric-anchor-utils'
import { createShape, duplicateObject } from '../lib/fabric-shape-utils'
import type { ShapeType, ShapeProperties } from '../lib/fabric-shape-utils'
import { createCanvas, setupCanvasEventListeners, disposeCanvas, defaultCanvasConfig } from '../lib/fabric-canvas-utils'
import {
  addObjectToCanvas,
  removeObjectFromCanvas,
  bringObjectToFront,
  sendObjectToBack,
  toggleObjectLock,
  isObjectLocked,
  setObjectName,
  generateObjectId,
  getCanvasCenter,
  updateMenuPosition,
  addImageToCanvas
} from '../lib/fabric-object-utils'

interface CanvasAreaProps {
  zoomLevel: number
  canvasSize?: { width: number; height: number }
  onAddShape?: (shapeType: ShapeType, properties?: ShapeProperties) => void
  onAddText?: (textStyle?: 'heading' | 'subheading' | 'body') => void
  onObjectSelect?: (object: fabric.Object) => void
  onObjectDeselect?: () => void
  onCanvasRef?: (canvas: fabric.Canvas) => void
}

export interface CanvasAreaHandle {
  addShapeToCanvas: (shapeType: ShapeType, properties?: ShapeProperties) => void
  addTextToCanvas: (textStyle?: 'heading' | 'subheading' | 'body', fontFamily?: string) => void
  addImageToCanvas: (imageUrl: string) => Promise<void> | void
}

export const CanvasArea = forwardRef<CanvasAreaHandle, CanvasAreaProps>(({
  zoomLevel,
  canvasSize,
  onAddText,
  onObjectSelect,
  onObjectDeselect,
  onCanvasRef
}: CanvasAreaProps, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [showFloatingMenu, setShowFloatingMenu] = useState(false)
  const [isLockedState, setIsLockedState] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const [backgroundImageSize, setBackgroundImageSize] = useState<'cover' | 'contain' | 'stretch' | 'original'>('cover')

  // Update canvas dimensions when canvasSize changes
  useEffect(() => {
    if (fabricCanvasRef.current && canvasSize) {
      fabricCanvasRef.current.setDimensions({ width: canvasSize.width, height: canvasSize.height })
      fabricCanvasRef.current.renderAll()
    }

    console.log("canvas size: ", canvasSize)
  }, [canvasSize])

  // Initialize fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      // Create canvas with default configuration
      const canvas = createCanvas(canvasRef.current, {
        ...defaultCanvasConfig,
        width: canvasSize?.width || defaultCanvasConfig.width,
        height: canvasSize?.height || defaultCanvasConfig.height,
      })

      fabricCanvasRef.current = canvas

      // Pass canvas reference to parent
      onCanvasRef?.(canvas)

      // Apply custom anchor styling
      customizeAnchors(canvas)

      // Set up canvas event listeners
      const cleanup = setupCanvasEventListeners(canvas, {
        onMouseDown: (e) => {
          const event = e as { target?: fabric.Object; e: MouseEvent | TouchEvent }
          if (event.target) {
            console.log("mouse down event fired")
            const clickedObject = event.target
            setSelectedObject(clickedObject)
            setIsLockedState(isObjectLocked(clickedObject))
            onObjectSelect?.(clickedObject)
            // Store cursor position for menu positioning
            const pointer = canvas.getPointer(event.e)
            setMenuPosition(updateMenuPosition(clickedObject, { x: pointer.x, y: pointer.y }))
            setShowFloatingMenu(false)
          } else {
            console.log("mouse down event 2 fired")
            setSelectedObject(null)
            setIsLockedState(false)
            onObjectDeselect?.()
            setShowFloatingMenu(false)
          }
        },
        onMouseUp: (e) => {
          const event = e as { target?: fabric.Object; e: MouseEvent | TouchEvent }
          if (event.target) {
            console.log("mouse up event fired, object: ", event.target)
            setIsLockedState(isObjectLocked(event.target))
            const pointer = canvas.getPointer(event.e)
            setMenuPosition(updateMenuPosition(event.target, { x: pointer.x, y: pointer.y }))
            setShowFloatingMenu(true)
          }
        },

        onObjectMoving: (e) => {
          const event = e as { target?: fabric.Object }
          if (event.target && selectedObject === event.target) {
            setShowFloatingMenu(false)
            // Don't update position during movement to avoid flickering
          }
        },

        onObjectModified: (e) => {
          const event = e as { target?: fabric.Object }
          if (event.target && selectedObject === event.target) {
            // For object modification, we'll use the object's position since cursor might not be available
            setMenuPosition(updateMenuPosition(event.target, undefined))
            setShowFloatingMenu(true)
          }
        },

        onSelectionCleared: () => {
          setSelectedObject(null)
          setIsLockedState(false)
          onObjectDeselect?.()
          setShowFloatingMenu(false)
        },

        onKeyDown: (e) => {
          if (e.key === 'Escape') {
            setSelectedObject(null)
            setIsLockedState(false)
            onObjectDeselect?.()
            setShowFloatingMenu(false)
          }
        }
      })

      // Handle keyboard shortcuts for delete
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') &&
          !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
          const activeObjects = canvas.getActiveObjects()
          if (activeObjects.length > 0) {
            activeObjects.forEach(obj => {
              canvas.remove(obj)
            })
            canvas.discardActiveObject()
            canvas.renderAll()
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        cleanup()
        disposeCanvas(canvas)
        fabricCanvasRef.current = null
      }
    }
  }, [onObjectSelect, onObjectDeselect, onCanvasRef])

  // Function to add shapes to canvas
  const addShapeToCanvas = (shapeType: ShapeType, properties?: ShapeProperties) => {
    if (!fabricCanvasRef.current) return

    const center = getCanvasCenter(fabricCanvasRef.current)
    const fabricObject = createShape(shapeType, {
      centerX: center.x,
      centerY: center.y,
      properties
    })

    // Set unique name for the object
    setObjectName(fabricObject, generateObjectId())

    // Apply custom anchor styles to the new object
    applyCustomAnchorStyles(fabricObject)

    // Add object to canvas
    addObjectToCanvas(fabricCanvasRef.current, fabricObject)
  }

  // Function to add text to canvas
  const handleAddText = async (textStyle?: 'heading' | 'subheading' | 'body', fontFamily?: string) => {
    if (!fabricCanvasRef.current) return

    const center = getCanvasCenter(fabricCanvasRef.current)

    let textConfig = {
      text: 'Click to edit',
      fill: '#000000',
      fontSize: 24,
      fontFamily
    }

    // Apply different styles based on textStyle parameter
    switch (textStyle) {
      case 'heading':
        textConfig = {
          text: 'Heading',
          fill: '#1f2937',
          fontSize: 32,
          fontFamily
        }
        break
      case 'subheading':
        textConfig = {
          text: 'Subheading',
          fill: '#374151',
          fontSize: 24,
          fontFamily
        }
        break
      case 'body':
        textConfig = {
          text: 'Body text',
          fill: '#6b7280',
          fontSize: 16,
          fontFamily
        }
        break
    }

    const textObject = createShape('text', {
      centerX: center.x,
      centerY: center.y,
      properties: textConfig
    })

    // Set unique name for the object
    setObjectName(textObject, generateObjectId())

    // Apply custom anchor styles to the new object
    applyCustomAnchorStyles(textObject)

    // Add object to canvas
    addObjectToCanvas(fabricCanvasRef.current, textObject)
    fabricCanvasRef.current.setActiveObject(textObject)

    // Make the text immediately editable
    if (textObject instanceof fabric.Textbox) {
      textObject.enterEditing()
      textObject.selectAll()
    }

    fabricCanvasRef.current.renderAll()
  }

  // Handler functions for floating menu actions
  const handleLockObject = () => {
    if (!selectedObject || !fabricCanvasRef.current) return
    const lockedNow = toggleObjectLock(selectedObject)
    setIsLockedState(lockedNow)
    fabricCanvasRef.current.renderAll()
    console.log("object lock was clicked", isObjectLocked(selectedObject))
  }

  const handleDuplicateObject = () => {
    if (!selectedObject || !fabricCanvasRef.current) return

    const newObject = duplicateObject(selectedObject)
    if (newObject) {
      // Apply custom anchor styles to the duplicated object
      applyCustomAnchorStyles(newObject)
      addObjectToCanvas(fabricCanvasRef.current, newObject)
    }
  }

  const handleDeleteObject = () => {
    if (!selectedObject || !fabricCanvasRef.current) return
    removeObjectFromCanvas(fabricCanvasRef.current, selectedObject)
    setSelectedObject(null)
    onObjectDeselect?.()
    setShowFloatingMenu(false)
  }

  const handleBringToFront = () => {
    if (!selectedObject || !fabricCanvasRef.current) return
    bringObjectToFront(fabricCanvasRef.current, selectedObject)
  }

  const handleSendToBack = () => {
    if (!selectedObject || !fabricCanvasRef.current) return
    sendObjectToBack(fabricCanvasRef.current, selectedObject)
  }

  // Background change handlers
  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color)
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.backgroundColor = color
      fabricCanvasRef.current.renderAll()
    }
  }

  const handleBackgroundImageChange = (imageUrl: string, size?: 'cover' | 'contain' | 'stretch' | 'original') => {
    setBackgroundImage(imageUrl)
    if (size) setBackgroundImageSize(size)
    if (fabricCanvasRef.current) {
      if (imageUrl) {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = fabricCanvasRef.current!
          const fabricImage = new fabric.Image(img)
          let scaleX = 1, scaleY = 1, left = 0, top = 0
          switch (size || backgroundImageSize) {
            case 'cover': {
              scaleX = canvas.width! / img.width
              scaleY = canvas.height! / img.height
              const scale = Math.max(scaleX, scaleY)
              fabricImage.scale(scale)
              left = (canvas.width! - img.width * scale) / 2
              top = (canvas.height! - img.height * scale) / 2
              break
            }
            case 'contain': {
              scaleX = canvas.width! / img.width
              scaleY = canvas.height! / img.height
              const scale = Math.min(scaleX, scaleY)
              fabricImage.scale(scale)
              left = (canvas.width! - img.width * scale) / 2
              top = (canvas.height! - img.height * scale) / 2
              break
            }
            case 'stretch': {
              fabricImage.set({
                scaleX: canvas.width! / img.width,
                scaleY: canvas.height! / img.height
              })
              left = 0
              top = 0
              break
            }
            case 'original':
            default: {
              fabricImage.scale(1)
              left = (canvas.width! - img.width) / 2
              top = (canvas.height! - img.height) / 2
              break
            }
          }
          fabricImage.set({
            left,
            top,
            selectable: false,
            evented: false
          })
          canvas.backgroundImage = fabricImage
          canvas.renderAll()
        }
        img.onerror = () => {
          // If crossOrigin fails, try without it
          console.warn('Failed to load background image with crossOrigin, trying without...')
          const img2 = new window.Image()
          img2.onload = () => {
            const canvas = fabricCanvasRef.current!
            const fabricImage = new fabric.Image(img2)
            let scaleX = 1, scaleY = 1, left = 0, top = 0
            switch (size || backgroundImageSize) {
              case 'cover': {
                scaleX = canvas.width! / img2.width
                scaleY = canvas.height! / img2.height
                const scale = Math.max(scaleX, scaleY)
                fabricImage.scale(scale)
                left = (canvas.width! - img2.width * scale) / 2
                top = (canvas.height! - img2.height * scale) / 2
                break
              }
              case 'contain': {
                scaleX = canvas.width! / img2.width
                scaleY = canvas.height! / img2.height
                const scale = Math.min(scaleX, scaleY)
                fabricImage.scale(scale)
                left = (canvas.width! - img2.width * scale) / 2
                top = (canvas.height! - img2.height * scale) / 2
                break
              }
              case 'stretch': {
                fabricImage.set({
                  scaleX: canvas.width! / img2.width,
                  scaleY: canvas.height! / img2.height
                })
                left = 0
                top = 0
                break
              }
              case 'original':
              default: {
                fabricImage.scale(1)
                left = (canvas.width! - img2.width) / 2
                top = (canvas.height! - img2.height) / 2
                break
              }
            }
            fabricImage.set({
              left,
              top,
              selectable: false,
              evented: false
            })
            canvas.backgroundImage = fabricImage
            canvas.renderAll()
          }
          img2.onerror = () => {
            console.error('Failed to load background image with or without crossOrigin')
          }
          img2.src = imageUrl
        }
        img.src = imageUrl
      } else {
        fabricCanvasRef.current.backgroundImage = undefined
        fabricCanvasRef.current.renderAll()
      }
    }
  }

  const handleBackgroundImageSizeChange = (size: 'cover' | 'contain' | 'stretch' | 'original') => {
    setBackgroundImageSize(size)
    if (backgroundImage) {
      handleBackgroundImageChange(backgroundImage, size)
    }
  }

  // Use the onAddText prop if provided, otherwise use internal function
  const addTextFunction = onAddText || handleAddText

  // Function to add image to canvas
  const handleAddImage = async (imageUrl: string) => {
    if (fabricCanvasRef.current) {
      try {
        await addImageToCanvas(fabricCanvasRef.current, imageUrl)
      } catch (error) {
        console.error('Failed to add image to canvas:', error)
      }
    }
  }

  // Expose the addShape, addText, and addImage functions to parent component
  useEffect(() => {
    if (fabricCanvasRef.current) {
      // Store the functions globally (legacy access)
      ; (window as unknown as Record<string, unknown>).addShapeToCanvas = addShapeToCanvas
        ; (window as unknown as Record<string, unknown>).addTextToCanvas = addTextFunction
        ; (window as unknown as Record<string, unknown>).addImageToCanvas = handleAddImage
    }
  }, [fabricCanvasRef.current, addTextFunction, handleAddImage])

  // Properly expose imperative API via ref
  useImperativeHandle(ref, () => ({
    addShapeToCanvas,
    addTextToCanvas: addTextFunction,
    addImageToCanvas: handleAddImage,
  }), [addTextFunction])

  return (
    <div className="flex-1 flex flex-col gap-3 items-start p-5 justify-start relative overflow-auto">

      {/* Main Canvas */}
      <div
        className="flex-col gap-3 border-red-500 inline-flex !w-fit !h-fit">

        <div className=" self-start">
          <CanvasSettingsMenu
            onBackgroundColorChange={handleBackgroundColorChange}
            onBackgroundImageChange={imageUrl => handleBackgroundImageChange(imageUrl, backgroundImageSize)}
            currentBackgroundColor={backgroundColor}
            currentBackgroundImage={backgroundImage}
            onBackgroundImageSizeChange={handleBackgroundImageSizeChange}
            currentBackgroundImageSize={backgroundImageSize}
          />
        </div>
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease-in-out'
          }}
          className="relative bg-white overflow-visible border hover:border-indigo-500">
          <canvas
            ref={canvasRef}
            width={canvasSize?.width}
            height={canvasSize?.height}
            className=""
          />

          {/* Floating Menu */}
          {showFloatingMenu && selectedObject && (
            <ObjectFloatingMenu
              position={menuPosition}
              onLock={handleLockObject}
              onDuplicate={handleDuplicateObject}
              onDelete={handleDeleteObject}
              isLocked={isLockedState}
              onBringToFront={handleBringToFront}
              onSendToBack={handleSendToBack}
            />
          )}
        </div>
      </div>
    </div>
  )
})