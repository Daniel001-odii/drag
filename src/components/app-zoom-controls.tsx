import { ZoomIn, ZoomOut } from 'lucide-react'

interface AppZoomControlsProps {
  zoomLevel: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}

const AppZoomControls = ({ zoomLevel, onZoomIn, onZoomOut, onResetZoom }: AppZoomControlsProps) => {
  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg flex items-center space-x-1 p-1">
        <button 
          onClick={onZoomOut}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-gray-600" />
        </button>
        
        <button 
          onClick={onResetZoom}
          className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors min-w-[60px]"
          title="Reset Zoom"
        >
          {Math.round(zoomLevel * 100)}%
        </button>
        
        <button 
          onClick={onZoomIn}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  )
}

export { AppZoomControls } 