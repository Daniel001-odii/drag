import React, { useState, useRef } from 'react'
import { Image, Palette, Settings } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu'
import { ColorInput } from './ui/color-input'
import { Label } from './ui/label'

interface CanvasSettingsMenuProps {
    onBackgroundColorChange: (color: string) => void
    onBackgroundImageChange: (imageUrl: string) => void
    currentBackgroundColor: string
    currentBackgroundImage?: string
    onBackgroundImageSizeChange: (size: 'cover' | 'contain' | 'stretch' | 'original') => void
    currentBackgroundImageSize: 'cover' | 'contain' | 'stretch' | 'original'
}

export function CanvasSettingsMenu({
    onBackgroundColorChange,
    onBackgroundImageChange,
    currentBackgroundColor,
    currentBackgroundImage,
    onBackgroundImageSizeChange,
    currentBackgroundImageSize
}: CanvasSettingsMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const imageSizeOptions = [
        { value: 'cover', label: 'Cover' },
        { value: 'contain', label: 'Contain' },
        { value: 'stretch', label: 'Stretch' },
        { value: 'original', label: 'Original' }
    ]

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string
                onBackgroundImageChange(imageUrl)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveBackground = () => {
        onBackgroundImageChange('')
        onBackgroundColorChange('#ffffff')
    }

    const presetColors = [
        '#ffffff', '#e9ecef', '#dee2e6', '#ced4da',
        '#adb5bd', '#6c757d', '#495057', '#343a40', '#212529',
        '#f8f9fa', '#e3f2fd', '#e8f5e8', '#fff3e0', '#fce4ec'
    ]

    return (
        <div className="">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white shadow-lg"
                        title="Canvas Settings"
                    >
                        <Settings className="size-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-80 p-4 space-y-4"
                    sideOffset={8}
                >
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-900">Canvas Background</h3>

                        {/* Background Color Section */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                                <Palette className="h-3 w-3" />
                                Colors
                            </Label>

                          

                            {/* Preset Colors */}
                            <div className="grid grid-cols-8 gap-1">
                                {presetColors.map((color) => (
                                    <button
                                        key={color}
                                        className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        onClick={() => onBackgroundColorChange(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                       
                        <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">Custom</span>
                                <ColorInput
                                    value={currentBackgroundColor}
                                    onChange={onBackgroundColorChange}
                                    className="flex-1"
                                    title="Background Color"
                                />
                               
                            </div>

                        <DropdownMenuSeparator />

                        {/* Background Image Section */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                                <Image className="h-3 w-3" />
                                Background Image
                            </Label>

                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Image className="h-4 w-4 mr-2" />
                                    Upload Image
                                </Button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                {currentBackgroundImage && (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <img
                                                src={currentBackgroundImage}
                                                alt="Background"
                                                className="w-full h-20 object-cover rounded border"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor="background-image-size" className="text-xs text-gray-700">Image Size</label>
                                            <select
                                                id="background-image-size"
                                                className="text-xs border rounded px-2 py-1"
                                                value={currentBackgroundImageSize}
                                                onChange={e => onBackgroundImageSizeChange(e.target.value as any)}
                                            >
                                                {imageSizeOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-red-600 hover:text-red-700"
                                            onClick={handleRemoveBackground}
                                        >
                                            Remove Background Image
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
} 