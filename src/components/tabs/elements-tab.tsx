import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Search, X, Circle, Square, Triangle, Star, RectangleHorizontal } from 'lucide-react'
import type { ShapeType, ShapeProperties } from '../../lib/fabric-shape-utils'

interface ElementsTabProps {
  onClosePanel: () => void
}

interface WindowWithCanvas extends Window {
  addShapeToCanvas?: (shapeType: ShapeType, properties?: ShapeProperties) => void
}

export function ElementsTab({ onClosePanel }: ElementsTabProps) {
  const shapes = [
    { name: "Circle", icon: Circle, color: "#3B82F6", type: "circle" },
    { name: "Square", icon: Square, color: "#EF4444", type: "rect" },
    { name: "Rounded Rectangle", icon: RectangleHorizontal, color: "#8B5CF6", type: "rounded-rectangle" },
    { name: "Triangle", icon: Triangle, color: "#10B981", type: "triangle" },
    { name: "Star", icon: Star, color: "#F59E0B", type: "star" }
  ]

  const linesAndArrows = [
    { name: "Straight Line", preview: "/placeholder.svg?height=60&width=120" },
    { name: "Arrow Right", preview: "/placeholder.svg?height=60&width=120" },
    { name: "Curved Line", preview: "/placeholder.svg?height=60&width=120" },
    { name: "Double Arrow", preview: "/placeholder.svg?height=60&width=120" }
  ]

  const handleShapeClick = (shapeType: string) => {
    // Access the addShapeToCanvas function from the global window object
    const windowWithCanvas = window as WindowWithCanvas
    const addShapeToCanvas = windowWithCanvas.addShapeToCanvas
    if (addShapeToCanvas && typeof addShapeToCanvas === 'function') {
      addShapeToCanvas(shapeType as ShapeType, {
        fill: shapes.find(s => s.type === shapeType)?.color || '#3B82F6'
      })
    } else {
      console.warn('addShapeToCanvas function not available')
    }
  }

  return (
    <div className="w-[250px] bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Elements</h2>
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
            placeholder="Search elements..."
            className="w-full pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4 space-y-6">
          {/* Shapes Section */}
          <div>
            <h3 className="text-sm text-left font-medium text-gray-700 mb-3">Shapes</h3>
            <div className="flex flex-wrap gap-3">
              {shapes.map((shape, index) => (
                <div
                  key={index}
                  className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors border"
                  onClick={() => handleShapeClick(shape.type)}
                >
                  <div className="p-3 bg-gray-100 rounded-lg flex items-center justify-center">
                    <shape.icon
                      fill={shape.color}
                      className="size-8"
                      style={{ color: shape.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lines & Arrows Section */}
          <div>
            <h3 className="text-sm text-left font-medium text-gray-700 mb-3">Lines & Arrows</h3>
            <div className="flex flex-wrap gap-3">
              {linesAndArrows.map((item, index) => (
                <div
                  key={index}
                  className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className="p-3 bg-gray-100 rounded-lg flex items-center justify-center">
                      <img
                        src={item.preview}
                        alt={item.name}
                        className="size-8 object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
} 