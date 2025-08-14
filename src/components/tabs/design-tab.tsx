import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Search, X, Monitor, Smartphone, Image, FileText, CreditCard, Instagram, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react'
import { useState } from 'react'
import type { StageSize } from '../../lib/types'

interface DesignTabProps {
  onClosePanel: () => void
  onCanvasSizeChange?: (size: { width: number; height: number }) => void
  currentCanvasSize?: { width: number; height: number }
}

export function DesignTab({ onClosePanel, onCanvasSizeChange, currentCanvasSize={width:0, height: 0} }: DesignTabProps) {
  const [customWidth, setCustomWidth] = useState((currentCanvasSize.width).toString())
  const [customHeight, setCustomHeight] = useState((currentCanvasSize.height).toString())
  const [selectedSize, setSelectedSize] = useState<string>('')

  // Predefined canvas sizes commonly used in design applications
  const predefinedSizes: StageSize[] = [
    // Social Media
    { width: 1080, height: 1080, name: "Instagram Post", description: "Square format for Instagram" },
    { width: 1080, height: 1920, name: "Instagram Story", description: "Vertical format for Instagram Stories" },
    { width: 1200, height: 630, name: "Facebook Post", description: "Optimal for Facebook feed" },
    { width: 1200, height: 675, name: "Twitter Post", description: "Twitter optimized format" },
    { width: 1200, height: 628, name: "LinkedIn Post", description: "LinkedIn professional format" },
    { width: 1280, height: 720, name: "YouTube Thumbnail", description: "16:9 format for YouTube" },
    
    // Print & Business
    { width: 2480, height: 3508, name: "A4 Portrait", description: "Standard A4 paper size" },
    { width: 3508, height: 2480, name: "A4 Landscape", description: "A4 landscape orientation" },
    { width: 2551, height: 3508, name: "US Letter", description: "Standard US letter size" },
    { width: 1050, height: 600, name: "Business Card", description: "Standard business card size" },
    { width: 2480, height: 1754, name: "A5 Portrait", description: "A5 portrait format" },
    
    // Web & Digital
    { width: 1920, height: 1080, name: "HD Desktop", description: "Standard desktop resolution" },
    { width: 1366, height: 768, name: "Laptop", description: "Common laptop resolution" },
    { width: 375, height: 812, name: "iPhone", description: "iPhone screen size" },
    { width: 414, height: 896, name: "iPhone Plus", description: "iPhone Plus screen size" },
    { width: 768, height: 1024, name: "iPad", description: "iPad portrait format" },
    { width: 1024, height: 768, name: "iPad Landscape", description: "iPad landscape format" },
    
    // Custom sizes
    { width: 800, height: 600, name: "Custom Small", description: "Small custom size" },
    { width: 1200, height: 800, name: "Custom Medium", description: "Medium custom size" },
    { width: 1600, height: 1200, name: "Custom Large", description: "Large custom size" },
  ]

  const handleSizeSelect = (sizeName: string) => {
    setSelectedSize(sizeName)
    const size = predefinedSizes.find(s => s.name === sizeName)
    if (size && onCanvasSizeChange) {
      onCanvasSizeChange({ width: size.width, height: size.height })
    }
  }

  const handleCustomSizeApply = () => {
    const width = parseInt(customWidth)
    const height = parseInt(customHeight)
    if (width > 0 && height > 0 && onCanvasSizeChange) {
      onCanvasSizeChange({ width, height })
    }
  }

  const getSizeIcon = (name: string) => {
    if (name.includes('Instagram')) return <Instagram className="w-4 h-4" />
    if (name.includes('Facebook')) return <Facebook className="w-4 h-4" />
    if (name.includes('Twitter')) return <Twitter className="w-4 h-4" />
    if (name.includes('LinkedIn')) return <Linkedin className="w-4 h-4" />
    if (name.includes('YouTube')) return <Youtube className="w-4 h-4" />
    if (name.includes('iPhone') || name.includes('iPad')) return <Smartphone className="w-4 h-4" />
    if (name.includes('Laptop') || name.includes('Desktop')) return <Monitor className="w-4 h-4" />
    if (name.includes('Business Card')) return <CreditCard className="w-4 h-4" />
    if (name.includes('A4') || name.includes('Letter')) return <FileText className="w-4 h-4" />
    return <Image className="w-4 h-4" />
  }

  const getSizeCategory = (name: string) => {
    if (name.includes('Instagram') || name.includes('Facebook') || name.includes('Twitter') || name.includes('LinkedIn') || name.includes('YouTube')) {
      return 'Social Media'
    }
    if (name.includes('iPhone') || name.includes('iPad') || name.includes('Laptop') || name.includes('Desktop')) {
      return 'Digital'
    }
    if (name.includes('A4') || name.includes('Letter') || name.includes('Business Card')) {
      return 'Print'
    }
    if (name.includes('Custom')) {
      return 'Custom'
    }
    return 'Other'
  }

  const categories = ['Social Media', 'Digital', 'Print', 'Custom']

  return (
    <div className="w-[280px] bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Design</h2>
          <button
            onClick={onClosePanel}
            className="h-6 w-6 p-0 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Search sizes..."
            className="w-full pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4 space-y-6">
          {/* Canvas Size Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Canvas Size</h3>
            
            {/* Custom Size Input */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Custom Size</h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <Label htmlFor="custom-width" className="text-xs text-gray-500">Width (px)</Label>
                  <Input
                    id="custom-width"
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="h-8 text-sm"
                    placeholder="800"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-height" className="text-xs text-gray-500">Height (px)</Label>
                  <Input
                    id="custom-height"
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="h-8 text-sm"
                    placeholder="600"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCustomSizeApply}
                size="sm"
                className="w-full h-8 text-xs"
              >
                Apply Custom Size
              </Button>
            </div>

            {/* Predefined Sizes */}
            <div className="space-y-3">
              {categories.map(category => {
                const categorySizes = predefinedSizes.filter(size => getSizeCategory(size.name) === category)
                if (categorySizes.length === 0) return null
                
                return (
                  <div key={category}>
                    <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {categorySizes.map((size) => (
                        <div
                          key={size.name}
                          onClick={() => handleSizeSelect(size.name)}
                          className={`group cursor-pointer rounded-lg border p-3 transition-all hover:border-blue-300 hover:bg-blue-50 ${
                            selectedSize === size.name 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getSizeIcon(size.name)}
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {size.name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-1">
                            {size.width} × {size.height} px
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {size.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start h-9"
                onClick={() => handleSizeSelect('Instagram Post')}
              >
                <Instagram className="w-4 h-4 mr-2" />
                Create Instagram Post
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start h-9"
                onClick={() => handleSizeSelect('Business Card')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Design Business Card
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start h-9"
                onClick={() => handleSizeSelect('A4 Portrait')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Document
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
} 