import { Button } from "./ui/button"
import { StickyNote, ZoomIn, ZoomOut, HelpCircle, LucideBookOpen, LucideMaximize } from 'lucide-react'
import { Slider } from "./ui/slider"


interface AppStatusBarProps {
  zoomLevel: number
  onZoomChange: (level: number) => void
}

export function AppStatusBar({ zoomLevel, onZoomChange }: AppStatusBarProps) {
  return (
    <div className="h-12 bg-white border-t border-gray-200 flex items-center justify-between px-4">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-gray-600" disabled>
          <StickyNote className="w-4 h-4 mr-2" />
          Notes
        </Button>
      </div>



      {/* Right Side */}
      <div className="flex items-center gap-4">

        {/* Center - Zoom Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onZoomChange(Math.max(10, zoomLevel - 10))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="w-32 h-1 bg-gray-200 rounded-full relative">
              <Slider
                value={[zoomLevel]}
                onValueChange={(value: number[]) => onZoomChange(value[0])}
                max={200}
                min={10}
                step={1}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onZoomChange(Math.min(200, zoomLevel + 10))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-gray-600 min-w-[3rem]">{zoomLevel}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onZoomChange(100)}
              className="text-xs"
            >
              <LucideMaximize/>
            </Button>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="text-gray-600" disabled>
          <LucideBookOpen className="w-4 h-4 mr-2" />
          Pages
        </Button>
        <span className="text-sm font-medium text-gray-300">1 / 1</span>
        {/* <Button variant="ghost" size="sm">
          <Maximize2 className="w-4 h-4" />
        </Button> */}
        <Button variant="ghost" size="sm">
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
} 