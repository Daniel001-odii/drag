import { useState, useEffect, useRef } from 'react'
import * as fabric from 'fabric'
import { loadFont } from '../lib/font-utils'
import { FontSelector } from './ui/font-selector'
import { 
  Undo2, 
  Redo2, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Minus,
  Plus,
  Share2,
  Settings,
  RotateCcw,
  Ellipsis,
  DownloadIcon,
  UploadIcon,
  Palette,
  X,
  Type
} from 'lucide-react'
import { downloadCanvasAsPNG, downloadCanvasAsJSON, importCanvasFromJSON } from '../lib/fabric-canvas-utils'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from './ui/dropdown-menu'
import { Slider } from './ui/slider'
import { ColorInput } from './ui/color-input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { toast } from 'sonner'

interface AppHeaderProps {
  selectedObject?: fabric.Object | null
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onObjectAction?: (action: string, value?: unknown) => void
  canvasRef?: fabric.Canvas
}

export function AppHeader({ 
  selectedObject, 
  onUndo, 
  onRedo, 
  canUndo = false, 
  canRedo = false,
  onObjectAction,
  canvasRef
}: AppHeaderProps) {
  const [fontSize, setFontSize] = useState(16)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [textColor, setTextColor] = useState('#000000')
  const [fillColor, setFillColor] = useState('#ffffff')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(1)
  const [opacity, setOpacity] = useState(100)
  const [textStyles, setTextStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false
  })
  
  // Text spacing states
  const [charSpacing, setCharSpacing] = useState(0)
  const [lineHeight, setLineHeight] = useState(1.2)
  const [letterCase, setLetterCase] = useState('none')
  
  // Gradient state
  const [gradientColors, setGradientColors] = useState(['#6366f1', '#ec4899'])
  const [gradientDirection, setGradientDirection] = useState('horizontal')

  // Update local state when selected object changes
  useEffect(() => {
    if (selectedObject) {
      if (selectedObject.type === 'i-text' || selectedObject.type === 'text' || selectedObject.type === 'textbox') {
        const textObject = selectedObject as fabric.Textbox
        setFontSize(textObject.fontSize || 16)
        setFontFamily(textObject.fontFamily || 'Arial')
        setTextColor(typeof textObject.fill === 'string' ? textObject.fill : '#000000')
        
        // Update text styles from the selected object
        setTextStyles({
          bold: textObject.fontWeight === 'bold',
          italic: textObject.fontStyle === 'italic',
          underline: textObject.underline === true,
          strikethrough: textObject.linethrough === true
        })
        
        // Update text spacing from the selected object
        setCharSpacing(textObject.charSpacing || 0)
        setLineHeight(textObject.lineHeight || 1.2)
      }
      if (selectedObject.fill && typeof selectedObject.fill === 'string') setFillColor(selectedObject.fill)
      if (selectedObject.stroke && typeof selectedObject.stroke === 'string') setStrokeColor(selectedObject.stroke)
      if (selectedObject.strokeWidth) setStrokeWidth(selectedObject.strokeWidth)
      if (selectedObject.opacity !== undefined) setOpacity(selectedObject.opacity * 100)
    }
  }, [selectedObject])

  const handleTextStyle = (style: string) => {
    setTextStyles(prev => ({
      ...prev,
      [style]: !prev[style as keyof typeof prev]
    }))
    onObjectAction?.('textStyle', style)
  }

  const handleTextAlign = (align: string) => {
    onObjectAction?.('textAlign', align)
  }

  const handleColorChange = (type: string, color: string) => {
    onObjectAction?.('color', { type, color })
  }

  const handleTextGradient = () => {
    if (!selectedObject || !isTextObject || !canvasRef) return
    
    const textObject = selectedObject as fabric.Textbox
    
    // Calculate gradient coordinates based on direction
    const getGradientCoords = (direction: string, width: number, height: number) => {
      switch (direction) {
        case 'horizontal':
          return { x1: 0, y1: 0, x2: width, y2: 0 }
        case 'vertical':
          return { x1: 0, y1: 0, x2: 0, y2: height }
        case 'diagonal':
          return { x1: 0, y1: 0, x2: width, y2: height }
        case 'diagonal-reverse':
          return { x1: width, y1: 0, x2: 0, y2: height }
        default:
          return { x1: 0, y1: 0, x2: width, y2: 0 }
      }
    }
    
    const coords = getGradientCoords(
      gradientDirection, 
      textObject.width || 100, 
      textObject.height || 50
    )
    
    // Create color stops from gradient colors
    const colorStops = gradientColors.map((color, index) => ({
      offset: index / (gradientColors.length - 1),
      color: color
    }))
    
    // Create a linear gradient for the text
    const gradient = new fabric.Gradient({
      type: 'linear',
      coords,
      colorStops
    })
    
    // Apply gradient to text
    textObject.set('fill', gradient)
    canvasRef.requestRenderAll()
  }
  
  const addGradientColor = () => {
    setGradientColors([...gradientColors, '#000000'])
  }
  
  const removeGradientColor = (index: number) => {
    if (gradientColors.length > 2) {
      setGradientColors(gradientColors.filter((_, i) => i !== index))
    }
  }
  
  const updateGradientColor = (index: number, color: string) => {
    const newColors = [...gradientColors]
    newColors[index] = color
    setGradientColors(newColors)
  }

  const handleFontSizeChange = (size: number) => {
    setFontSize(size)
    onObjectAction?.('fontSize', size)
  }

  const handleFontFamilyChange = async (family: string) => {
    try {
      await loadFont(family);
      setFontFamily(family)
      onObjectAction?.('fontFamily', family)
    } catch (error) {
      console.error('Failed to load font:', error);
      // Fallback to Arial if font loading fails
      setFontFamily('Arial')
      onObjectAction?.('fontFamily', 'Arial')
    }
  }

  const handleOpacityChange = (value: number[]) => {
    const opacityValue = value[0] / 100
    setOpacity(value[0])
    onObjectAction?.('opacity', opacityValue)
  }

  // Text spacing handlers
  const handleCharSpacingChange = (value: number[]) => {
    const spacing = value[0]
    setCharSpacing(spacing)
    console.log("current spacing:", spacing)
    // Increase effectiveness by multiplying the spacing value
    onObjectAction?.('charSpacing', spacing) // 10x multiplier for more visible effect
  }

  const handleLineHeightChange = (value: number[]) => {
    const height = value[0] / 100 // Convert percentage to decimal
    setLineHeight(height)
    onObjectAction?.('lineHeight', height)
  }

  const handleLetterCaseChange = (caseType: string) => {
    setLetterCase(caseType)
    onObjectAction?.('letterCase', caseType)
  }

  const handleStrokeWidthChange = (value: number[]) => {
    const width = value[0]
    setStrokeWidth(width)
    onObjectAction?.('strokeWidth', width)
  }

  const isTextObject = selectedObject?.type === 'i-text' || selectedObject?.type === 'text' || selectedObject?.type === 'textbox'
  const isShapeObject = selectedObject?.type === 'rect' || selectedObject?.type === 'circle' || selectedObject?.type === 'triangle' || selectedObject?.type === 'polygon'
  // Utility to check if selected object is an image
  const isImageObject = selectedObject?.type === 'image';
 

  const [alignment, setAlignment] = useState("");

  // Image filter states
  const [imageBrightness, setImageBrightness] = useState(0);
  const [imageContrast, setImageContrast] = useState(0);
  const [imageSaturation, setImageSaturation] = useState(0);
  const [imageGrayscale, setImageGrayscale] = useState(false);

  // Helper to apply all filters to the selected image
  const applyImageFilters = () => {
    if (isImageObject && selectedObject) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filters: any[] = [];
      
      // Brightness
      if (imageBrightness !== 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const BrightnessFilter = (fabric as any).filters?.Brightness;
        if (BrightnessFilter) {
          filters.push(new BrightnessFilter({ brightness: imageBrightness }));
        }
      }
      
      // Contrast
      if (imageContrast !== 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ContrastFilter = (fabric as any).filters?.Contrast;
        if (ContrastFilter) {
          filters.push(new ContrastFilter({ contrast: imageContrast }));
        }
      }
      
      // Saturation
      if (imageSaturation !== 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SaturationFilter = (fabric as any).filters?.Saturation;
        if (SaturationFilter) {
          filters.push(new SaturationFilter({ saturation: imageSaturation }));
        }
      }
      
      // Grayscale
      if (imageGrayscale) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const GrayscaleFilter = (fabric as any).filters?.Grayscale;
        if (GrayscaleFilter) {
          filters.push(new GrayscaleFilter());
        }
      }
      
      // Apply filters to the image object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (selectedObject as any).filters = filters;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((selectedObject as any).applyFilters) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (selectedObject as any).applyFilters();
      }
      
      // Refresh the canvas
      canvasRef?.requestRenderAll?.();
    }
  };

  // Handlers for each filter
  const handleImageBrightness = (value: number[]) => {
    setImageBrightness(value[0]);
  };
  const handleImageContrast = (value: number[]) => {
    setImageContrast(value[0]);
  };
  const handleImageSaturation = (value: number[]) => {
    setImageSaturation(value[0]);
  };
  const toggleImageGrayscale = () => {
    setImageGrayscale((prev) => !prev);
  };

  // Sync filter state with selected image
  useEffect(() => {
    if (isImageObject && selectedObject) {
      setImageBrightness(0);
      setImageContrast(0);
      setImageSaturation(0);
      setImageGrayscale(false);
    }
  }, [selectedObject, isImageObject]);

  // Apply filters when any filter state changes
  useEffect(() => {
    applyImageFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageBrightness, imageContrast, imageSaturation, imageGrayscale, selectedObject]);

  // Handle PNG export
  const handlePNGExport = async (quality: 'high' | 'standard' = 'high') => {
    console.log("found canvas: ", canvasRef)
    if (!canvasRef) {
      toast.error('Canvas not available for export')
      return
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading(`Exporting PNG (${quality} quality)...`)
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `drag-design-${timestamp}.png`
      
      await downloadCanvasAsPNG(canvasRef, filename, {
        format: 'png',
        quality: 1,
        multiplier: quality === 'high' ? 2 : 1 // Higher quality export
      })
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success(`PNG exported successfully! (${quality} quality)`)
    } catch (error) {
      console.error('Error exporting PNG:', error)
      toast.error('Failed to export PNG')
    }
  }

  // Handle JPEG export
  const handleJPEGExport = async (quality: 'high' | 'standard' = 'high') => {
    if (!canvasRef) {
      toast.error('Canvas not available for export')
      return
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading(`Exporting JPEG (${quality} quality)...`)
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `drag-design-${timestamp}.jpg`
      
      await downloadCanvasAsPNG(canvasRef, filename, {
        format: 'jpeg',
        quality: quality === 'high' ? 0.9 : 0.7,
        multiplier: quality === 'high' ? 2 : 1
      })
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success(`JPEG exported successfully! (${quality} quality)`)
    } catch (error) {
      console.error('Error exporting JPEG:', error)
      toast.error('Failed to export JPEG')
    }
  }

  // Handle JSON export
  const handleJSONExport = async (type: 'full' | 'minimal' = 'full') => {
    if (!canvasRef) {
      toast.error('Canvas not available for export')
      return
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading(`Exporting JSON (${type} export)...`)
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `drag-design-${timestamp}.json`
      
      await downloadCanvasAsJSON(canvasRef, filename, {
        includeBackground: type === 'full',
        includeBackgroundImage: type === 'full',
        includeCustomProperties: type === 'full'
      })
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success(`JSON exported successfully! (${type} export)`)
    } catch (error) {
      console.error('Error exporting JSON:', error)
      toast.error('Failed to export JSON')
    }
  }

  // Handle JSON import
  const handleJSONImport = () => {
    fileInputRef.current?.click()
  }

  // Handle file input change
  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !canvasRef) {
      return
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading('Importing project...')
      
      const text = await file.text()
      await importCanvasFromJSON(canvasRef, text, {
        clearCanvas: true
      })
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success('Project imported successfully!')
      
      // Reset file input
      event.target.value = ''
    } catch (error) {
      console.error('Error importing JSON:', error)
      toast.error('Failed to import project file')
      event.target.value = ''
    }
  }



  return (
    <TooltipProvider>
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        {/* Left Section - File Operations */}
        <div className="flex items-center gap-2">
        <span 
          className="font-bold text-2xl px-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          style={{
            background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Drag!
        </span>
          {/* Undo/Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3" 
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3" 
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>

        {/* Center Section - Dynamic Edit Menu */}
        <div className="flex items-center gap-2">
          {selectedObject && (
            <>
              {/* Object Type Badge */}
              {/* <Badge variant="secondary" className="text-xs">
                {isTextObject ? 'Text' : isShapeObject ? 'Shape' : isImageObject ? 'Image' : 'Object'}
              </Badge>
 */}

              {/* Text Editing Tools */}
              {isTextObject && (
                <>
                  {/* Font Family */}
                  <FontSelector
                    value={fontFamily}
                    onValueChange={handleFontFamilyChange}
                    className="w-40 h-8"
                    placeholder="Font"
                  />

                  {/* Font Size */}
                  <div className="flex items-center gap-2 border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleFontSizeChange(Math.max(1, fontSize - 1))}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{fontSize}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleFontSizeChange(fontSize + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                   {/* Text Color */}
                   <div className="flex items-center gap-1">
                    <ColorInput
                      value={textColor}
                      onChange={(color) => {
                        setTextColor(color)
                        handleColorChange('text', color)
                      }}
                      className="w-8 h-8"
                    />
                    
                    {/* Advanced Gradient Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Palette className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-80">
                        <DropdownMenuLabel>Text Gradient</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {/* Gradient Direction */}
                        <div className="px-3 py-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Direction</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: 'horizontal', label: 'Horizontal →' },
                              { value: 'vertical', label: 'Vertical ↓' },
                              { value: 'diagonal', label: 'Diagonal ↘' },
                              { value: 'diagonal-reverse', label: 'Diagonal ↙' }
                            ].map((direction) => (
                              <Button
                                key={direction.value}
                                variant={gradientDirection === direction.value ? 'default' : 'outline'}
                                size="sm"
                                className="text-xs"
                                onClick={() => setGradientDirection(direction.value)}
                              >
                                {direction.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        <DropdownMenuSeparator />
                        
                        {/* Gradient Colors */}
                        <div className="px-3 py-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Colors</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={addGradientColor}
                            >
                              + Add
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {gradientColors.map((color, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <ColorInput
                                  value={color}
                                  onChange={(newColor) => updateGradientColor(index, newColor)}
                                  className="w-8 h-8"
                                />
                                <span className="text-xs text-gray-500 flex-1">
                                  Color {index + 1}
                                </span>
                                {gradientColors.length > 2 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => removeGradientColor(index)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <DropdownMenuSeparator />
                        
                        {/* Apply Button */}
                        <div className="px-3 py-2">
                          <Button
                            className="w-full"
                            onClick={handleTextGradient}
                          >
                            Apply Gradient
                          </Button>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Text Style Buttons */}
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${textStyles.bold ? 'bg-indigo-100 hover:bg-indigo-200' : ''}`}
                          onClick={() => handleTextStyle('bold')}
                        >
                          <Bold className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold (Ctrl+B)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${textStyles.italic ? 'bg-indigo-100 hover:bg-indigo-200' : ''}`}
                          onClick={() => handleTextStyle('italic')}
                        >
                          <Italic className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic (Ctrl+I)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${textStyles.underline ? 'bg-indigo-100 hover:bg-indigo-200' : ''}`}
                          onClick={() => handleTextStyle('underline')}
                        >
                          <Underline className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Underline (Ctrl+U)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${textStyles.strikethrough ? 'bg-indigo-100 hover:bg-indigo-200' : ''}`}
                          onClick={() => handleTextStyle('strikethrough')}
                        >
                          <Strikethrough className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Strikethrough</TooltipContent>
                    </Tooltip>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Text Alignment */}
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3"
                          onClick={() => {
                            const textObject = selectedObject as fabric.Textbox
                            const currentAlign = textObject?.get('textAlign')
                            const alignments = ['left', 'center', 'right', 'justify']
                            const currentIndex = alignments.indexOf(currentAlign)
                            const nextIndex = (currentIndex + 1) % alignments.length
                            console.log("current align: ", alignments[nextIndex])
                            setAlignment(alignments[nextIndex]);
                            handleTextAlign(alignments[nextIndex])
                          }}
                        >
                          {(() => {
                            switch (alignment) {
                              case 'left':
                                return <AlignLeft className="w-4 h-4" />
                              case 'center':
                                return <AlignCenter className="w-4 h-4" />
                              case 'right':
                                return <AlignRight className="w-4 h-4" />
                              case 'justify':
                                return <AlignJustify className="w-4 h-4" />
                              default:
                                return <AlignLeft className="w-4 h-4" />
                            }
                          })()}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {(() => {
                          const textObject = selectedObject as fabric.Textbox
                          const currentAlign = textObject?.get('textAlign') || 'left'
                          switch (currentAlign) {
                            case 'left':
                              return 'Align Left (click for center)'
                            case 'center':
                              return 'Align Center (click for right)'
                            case 'right':
                              return 'Align Right (click for justify)'
                            case 'justify':
                              return 'Justify (click for left)'
                            default:
                              return 'Align Left (click for center)'
                          }
                        })()}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Text Spacing Controls */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-3">
                        <Type className="w-4 h-4 mr-1" />
                        <span className="text-xs">Spacing</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-80">
                      <DropdownMenuLabel>Text Spacing & Formatting</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* Character Spacing */}
                      <div className="px-3 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Character Spacing</span>
                          <span className="text-xs text-gray-500">{charSpacing}</span>
                        </div>
                        <Slider
                          value={[charSpacing]}
                          onValueChange={handleCharSpacingChange}
                          max={100}
                          min={-5}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <DropdownMenuSeparator />
                      
                      {/* Line Height */}
                      <div className="px-3 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Line Height</span>
                          <span className="text-xs text-gray-500">{Math.round(lineHeight * 100)}%</span>
                        </div>
                        <Slider
                          value={[lineHeight * 100]}
                          onValueChange={handleLineHeightChange}
                          max={300}
                          min={50}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      
                      <DropdownMenuSeparator />
                      
                      {/* Letter Case */}
                      <div className="px-3 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Letter Case</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'none', label: 'Normal' },
                            { value: 'uppercase', label: 'UPPER' },
                            { value: 'lowercase', label: 'lower' },
                            { value: 'capitalize', label: 'Title' }
                          ].map((caseOption) => (
                            <Button
                              key={caseOption.value}
                              variant={letterCase === caseOption.value ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs"
                              onClick={() => handleLetterCaseChange(caseOption.value)}
                            >
                              {caseOption.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <DropdownMenuSeparator />
                      
                      {/* Quick Reset */}
                      <div className="px-3 py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setCharSpacing(0)
                            setLineHeight(1.2)
                            setLetterCase('none')
                            onObjectAction?.('resetSpacing')
                          }}
                        >
                          Reset to Default
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Opacity and Transform Options Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-3">
                        <Ellipsis/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                      <DropdownMenuLabel>Opacity & Transform</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* Opacity Slider */}
                      <div className="px-3 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Opacity: {opacity}%</span>
                        </div>
                        <Slider
                          value={[opacity]}
                          onValueChange={handleOpacityChange}
                          max={100}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <DropdownMenuSeparator />
                      
                      {/* Transform Options */}
                      <DropdownMenuLabel>Transform</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onObjectAction?.('rotate', 90)}>
                        <RotateCw className="w-4 h-4 mr-2" />
                        Rotate 90°
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onObjectAction?.('rotate', -90)}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Rotate -90°
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onObjectAction?.('flip', 'horizontal')}>
                        <FlipHorizontal className="w-4 h-4 mr-2" />
                        Flip Horizontal
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onObjectAction?.('flip', 'vertical')}>
                        <FlipVertical className="w-4 h-4 mr-2" />
                        Flip Vertical
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {/* Shape Editing Tools */}
              {isShapeObject && (
                <>
                  {/* Fill Color */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Fill:</span>
                    <ColorInput
                      value={fillColor}
                      onChange={(color) => {
                        setFillColor(color)
                        handleColorChange('fill', color)
                      }}
                      className="w-8 h-8"
                    />
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Stroke Color */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Stroke:</span>
                    <ColorInput
                      value={strokeColor}
                      onChange={(color) => {
                        setStrokeColor(color)
                        handleColorChange('stroke', color)
                      }}
                      className="w-8 h-8"
                    />
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Stroke Width */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Width:</span>
                    <div className="w-20">
                      <Slider
                        value={[strokeWidth]}
                        onValueChange={handleStrokeWidthChange}
                        max={20}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <span className="text-xs w-4">{strokeWidth}</span>
                  </div>
                </>
              )}

              {/* Common Object Properties - Only for non-text objects */}
              {!isTextObject && (
                <>
                  <Separator orientation="vertical" className="h-6" />

                  {/* Opacity */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Opacity:</span>
                    <div className="w-20">
                      <Slider
                        value={[opacity]}
                        onValueChange={handleOpacityChange}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <span className="text-xs w-8">{opacity}%</span>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Transform Tools */}
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onObjectAction?.('rotate', 90)}
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Rotate 90°</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onObjectAction?.('flip', 'horizontal')}
                        >
                          <FlipHorizontal className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Flip Horizontal</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onObjectAction?.('flip', 'vertical')}
                        >
                          <FlipVertical className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Flip Vertical</TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}

              {/* Image Editing Tools */}
              {isImageObject && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-3">
                      <Ellipsis />
                      <span className="ml-1">Advanced Image Editing</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-64">
                    <DropdownMenuLabel>Image Filters</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Brightness */}
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Brightness</span>
                        <span className="text-xs">{imageBrightness ?? 0}</span>
                      </div>
                      <Slider
                        value={[imageBrightness]}
                        onValueChange={handleImageBrightness}
                        min={-1}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                    </div>
                    {/* Contrast */}
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Contrast</span>
                        <span className="text-xs">{imageContrast ?? 0}</span>
                      </div>
                      <Slider
                        value={[imageContrast]}
                        onValueChange={handleImageContrast}
                        min={-1}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                    </div>
                    {/* Saturation */}
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Saturation</span>
                        <span className="text-xs">{imageSaturation ?? 0}</span>
                      </div>
                      <Slider
                        value={[imageSaturation]}
                        onValueChange={handleImageSaturation}
                        min={-1}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                    </div>
                    {/* Grayscale */}
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Grayscale</span>
                        <span className="text-xs">{imageGrayscale ? 'On' : 'Off'}</span>
                      </div>
                      <Button
                        variant={imageGrayscale ? 'default' : 'outline'}
                        size="sm"
                        className="w-full"
                        onClick={toggleImageGrayscale}
                      >
                        {imageGrayscale ? 'Disable' : 'Enable'} Grayscale
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>

        {/* Right Section - Settings */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3">
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3">
                <UploadIcon className="w-4 h-4 mr-2" />
                <span>Share</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export As</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handlePNGExport('high')}>
                <DownloadIcon className="w-4 h-4 mr-2" />
                PNG (High Quality)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePNGExport('standard')}>
                <DownloadIcon className="w-4 h-4 mr-2" />
                PNG (Standard)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleJPEGExport('high')}>
                <DownloadIcon className="w-4 h-4 mr-2" />
                JPEG (High Quality)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleJPEGExport('standard')}>
                <DownloadIcon className="w-4 h-4 mr-2" />
                JPEG (Standard)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleJSONExport('full')}>
                <DownloadIcon className="w-4 h-4 mr-2" />
                JSON (Full Project)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleJSONExport('minimal')}>
                <DownloadIcon className="w-4 h-4 mr-2" />
                JSON (Minimal)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleJSONImport}>
                <UploadIcon className="w-4 h-4 mr-2" />
                Import Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <DownloadIcon className="w-4 h-4 mr-2" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
      

          {/* Hidden file input for JSON import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </TooltipProvider>
  )
} 