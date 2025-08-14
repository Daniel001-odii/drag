"use client"

import { useState, useRef, useCallback } from "react"
import * as fabric from 'fabric'
import { AppHeader } from "../components/app-header"
import { AppSidebar } from "../components/app-sidebar"
import { AppStatusBar } from "../components/app-status-bar"
import { SidebarContentPanel } from "../components/sidebar-content-panel"
import { CanvasArea } from "../components/canvas-area"
import type { CanvasAreaHandle } from "../components/canvas-area"
import { Toaster } from "../components/ui/sonner"
import { AiButton } from "../components/ai-button"


export default function CanvaClone() {
  const [activeTab, setActiveTab] = useState('design')
  const [showDetailsPanel, setShowDetailsPanel] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 650, height: 650 })
  const [canvasInstance, setCanvasInstance] = useState<fabric.Canvas | null>(null)
  
  // Refs for canvas operations
  const canvasRef = useRef<fabric.Canvas | null>(null)
  const canvasAreaHandleRef = useRef<CanvasAreaHandle | null>(null)
  const undoStackRef = useRef<string[]>([])
  const redoStackRef = useRef<string[]>([])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setShowDetailsPanel(true)
  }

  const handleClosePanel = () => {
    setShowDetailsPanel(false)
  }

  const handleZoomChange = (level: number) => {
    setZoomLevel(level)
  }

  // Handle object selection from canvas
  const handleObjectSelect = useCallback((object: fabric.Object) => {
    setSelectedObject(object)
  }, [])

  // Handle object deselection
  const handleObjectDeselect = useCallback(() => {
    setSelectedObject(null)
  }, [])

/*   const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isUndoingRedoing, setIsUndoingRedoing] = useState(false);
 */

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length > 0 && canvasRef.current) {
      const lastState = undoStackRef.current.pop()
      if (lastState) {
        // Save current state to redo stack
        const currentState = canvasRef.current.toJSON()
        redoStackRef.current.push(JSON.stringify(currentState))
        setCanRedo(true)
        
        // Restore previous state
        const parsedState = JSON.parse(lastState)
        canvasRef.current.loadFromJSON(parsedState, () => {
          canvasRef.current?.renderAll()
          
          // Update canvas size if dimensions are available
          if (parsedState.width && parsedState.height) {
            setCanvasSize({ width: parsedState.width, height: parsedState.height })
          }
        })
        
        setCanUndo(undoStackRef.current.length > 0)
      }
    }
  }, [])

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length > 0 && canvasRef.current) {
      const nextState = redoStackRef.current.pop()
      if (nextState) {
        // Save current state to undo stack
        const currentState = canvasRef.current.toJSON()
        undoStackRef.current.push(JSON.stringify(currentState))
        setCanUndo(true)
        
        // Restore next state
        canvasRef.current.loadFromJSON(JSON.parse(nextState), () => {
          canvasRef.current?.renderAll()
        })
        
        setCanRedo(redoStackRef.current.length > 0)
      }
    }
  }, [])

  // Handle object actions from header
  const handleObjectAction = useCallback((action: string, value?: unknown) => {
    if (!canvasRef.current || !selectedObject) return

    // Save current state for undo
    const currentState = canvasRef.current.toJSON()
    undoStackRef.current.push(JSON.stringify(currentState))
    setCanUndo(true)
    
    // Clear redo stack when new action is performed
    redoStackRef.current = []
    setCanRedo(false)

    switch (action) {
      case 'textStyle':
        if (selectedObject.type === 'i-text' || selectedObject.type === 'text' || selectedObject.type === 'textbox') {
          const textObject = selectedObject as fabric.Textbox
          switch (value) {
            case 'bold':
              textObject.set('fontWeight', textObject.fontWeight === 'bold' ? 'normal' : 'bold')
              break
            case 'italic':
              textObject.set('fontStyle', textObject.fontStyle === 'italic' ? 'normal' : 'italic')
              break
            case 'underline':
              textObject.set('underline', !textObject.underline)
              break
            case 'strikethrough':
              textObject.set('linethrough', !textObject.linethrough)
              break
          }
        }
        break

      case 'textAlign':
        if (selectedObject.type === 'i-text' || selectedObject.type === 'text' || selectedObject.type === 'textbox') {
          const textObject = selectedObject as fabric.Textbox
          textObject.set('textAlign', value as string)
        }
        break

      case 'fontSize':
        if (selectedObject.type === 'i-text' || selectedObject.type === 'text' || selectedObject.type === 'textbox') {
          const textObject = selectedObject as fabric.Textbox
          textObject.set('fontSize', value as number)
        }
        break

      case 'fontFamily':
        if (selectedObject.type === 'i-text' || selectedObject.type === 'text' || selectedObject.type === 'textbox') {
          const textObject = selectedObject as fabric.Textbox
          textObject.set('fontFamily', value as string)
        }
        break

      case 'color':
        if (value && typeof value === 'object' && 'type' in value && 'color' in value) {
          const colorValue = value as { type: string; color: string }
          if (colorValue.type === 'text') {
            selectedObject.set('fill', colorValue.color)
          } else if (colorValue.type === 'fill') {
            selectedObject.set('fill', colorValue.color)
          } else if (colorValue.type === 'stroke') {
            selectedObject.set('stroke', colorValue.color)
          }
        }
        break

      case 'strokeWidth':
        selectedObject.set('strokeWidth', value as number)
        break

      case 'opacity':
        selectedObject.set('opacity', value as number)
        break

      case 'rotate':
        selectedObject.rotate((selectedObject.angle || 0) + (value as number))
        break

      case 'flip':
        if (value === 'horizontal') {
          selectedObject.set('flipX', !selectedObject.flipX)
        } else if (value === 'vertical') {
          selectedObject.set('flipY', !selectedObject.flipY)
        }
        break

      case 'duplicate':
        // This will be handled by the canvas area's existing duplicate functionality
        break

      case 'lock': {
        selectedObject.set('selectable', selectedObject.selectable)
        selectedObject.set('evented', selectedObject.evented)
        // Toggle the locked state using a custom property
        const currentLocked = selectedObject.get('locked') as boolean || false
        selectedObject.set('locked', !currentLocked)
        break
      }

      case 'charSpacing':
        if (selectedObject.type === 'i-text' || selectedObject.type === 'text' || selectedObject.type === 'textbox') {
          const textObject = selectedObject as fabric.Textbox
          textObject.set('charSpacing', value as number)
        }
        break

      case 'lineHeight':
        if (selectedObject.type === 'i-text' || selectedObject.type === 'text' || selectedObject.type === 'textbox') {
          const textObject = selectedObject as fabric.Textbox
          textObject.set('lineHeight', value as number)
        }
        break



      case 'letterCase':
        if (selectedObject.type === 'i-text' || selectedObject.type === 'text' || selectedObject.type === 'textbox') {
          const textObject = selectedObject as fabric.Textbox
          const currentText = textObject.text || ''
          let transformedText = currentText
          
          switch (value as string) {
            case 'uppercase':
              transformedText = currentText.toUpperCase()
              break
            case 'lowercase':
              transformedText = currentText.toLowerCase()
              break
            case 'capitalize':
              transformedText = currentText.replace(/\b\w/g, l => l.toUpperCase())
              break
            case 'none':
            default:
              // Keep original text - no transformation
              break
          }
          
          if (value !== 'none') {
            textObject.set('text', transformedText)
          }
        }
        break

      case 'resetSpacing':
        if (selectedObject.type === 'i-text' || selectedObject.type === 'text' || selectedObject.type === 'textbox') {
          const textObject = selectedObject as fabric.Textbox
          textObject.set({
            charSpacing: 0,
            lineHeight: 1.2
          })
        }
        break

      case 'delete':
        canvasRef.current.remove(selectedObject)
        setSelectedObject(null)
        break
    }

    canvasRef.current.renderAll()
  }, [selectedObject])

  // Set canvas reference
  const handleCanvasRef = useCallback((canvas: fabric.Canvas) => {
    canvasRef.current = canvas
    setCanvasInstance(canvas)
  }, [])

  // Handle canvas size changes
  const handleCanvasSizeChange = useCallback((size: { width: number; height: number }) => {
    setCanvasSize(size)
    if (canvasRef.current) {
      canvasRef.current.setDimensions({ width: size.width, height: size.height })
      canvasRef.current.renderAll()
    }
  }, [])

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Toolbar */}
      <AppHeader 
        selectedObject={selectedObject}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onObjectAction={handleObjectAction}
        canvasRef={canvasInstance ?? undefined}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <AppSidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />

        {/* Sidebar Content Panel */}
        <SidebarContentPanel 
          activeTab={activeTab}
          showDetailsPanel={showDetailsPanel}
          onClosePanel={handleClosePanel}
          canvasRef={canvasInstance}
          canvasSize={canvasSize}
          onCanvasSizeChange={handleCanvasSizeChange}
          onAddText={(style?: 'heading' | 'subheading' | 'body') => {
            canvasAreaHandleRef.current?.addTextToCanvas?.(style)
          }}
        />

        {/* Main Canvas Area */}
        <CanvasArea 
          zoomLevel={zoomLevel}
          canvasSize={canvasSize}
          onObjectSelect={handleObjectSelect}
          onObjectDeselect={handleObjectDeselect}
          onCanvasRef={handleCanvasRef}
          ref={canvasAreaHandleRef}
        />
      </div>

      {/* Bottom Bar */}
      <AppStatusBar 
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
      />

      {/* AI GENERATE BUTTON */}
      <div className=" absolute bottom-14 right-10">
        <AiButton canvasRef={canvasInstance ?? undefined}/>
      </div>
      
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
