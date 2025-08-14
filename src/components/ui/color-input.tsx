import React, { useState, useRef, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Input } from './input'
import { Check } from 'lucide-react'

interface ColorInputProps {
  value: string
  onChange: (color: string) => void
  className?: string
  title?: string
  disabled?: boolean
}

const ColorInput = ({ value, onChange, className = '', title = 'Color', disabled = false }: ColorInputProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Predefined color palette
  const colorPalette = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#82E0AA', '#F8C471', '#F1948A', '#85C1E9', '#82E0AA', '#F8C471',
    '#E74C3C', '#2ECC71', '#3498DB', '#F1C40F', '#9B59B6', '#1ABC9C', '#E67E22', '#34495E',
    '#8E44AD', '#16A085', '#27AE60', '#2980B9', '#F39C12', '#D35400', '#C0392B', '#7F8C8D'
  ]

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleColorSelect = (color: string) => {
    onChange(color)
    setInputValue(color)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Validate hex color format
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue)
    }
  }

  const handleInputBlur = () => {
    // Reset to valid color if input is invalid
    if (!/^#[0-9A-F]{6}$/i.test(inputValue)) {
      setInputValue(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (/^#[0-9A-F]{6}$/i.test(inputValue)) {
        onChange(inputValue)
      }
      setIsOpen(false)
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="size-6 p-0 border-2 border-gray-300 hover:border-gray-400 transition-colors"
            style={{ backgroundColor: value }}
            disabled={disabled}
            title={title}
          >
            <div className="w-full h-full relative">
              {/* Checkerboard pattern for transparency */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #ccc 25%, transparent 25%), 
                    linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #ccc 75%), 
                    linear-gradient(-45deg, transparent 75%, #ccc 75%)
                  `,
                  backgroundSize: '4px 4px',
                  backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                }}
              />
              {/* Color overlay */}
              <div 
                className="absolute inset-0"
                style={{ backgroundColor: value }}
              />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Color Picker</h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">HEX:</span>
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  className="h-6 w-20 text-xs font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-8 gap-1">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-gray-300 hover:border-gray-400 transition-colors relative"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                >
                  {value.toUpperCase() === color.toUpperCase() && (
                    <Check className="w-3 h-3 text-white absolute inset-0 m-auto drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Custom:</span>
              <input
                type="color"
                value={value}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { ColorInput } 