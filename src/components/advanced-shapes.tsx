
import type { CanvasElement } from '../lib/types'

interface AdvancedShape {
  id: string
  name: string
  icon: string
  description: string
  type: 'polygon' | 'path' | 'custom'
  properties: {
    fill: string
    stroke?: string
    strokeWidth?: number
    width?: number
    height?: number
    points?: number[][]
    path?: string
    customType?: string
  }
}

interface AdvancedShapesProps {
  onAddElement: (elementType: 'rect' | 'circle' | 'text', properties?: Partial<CanvasElement>) => void
  onAddCustomShape?: (shape: AdvancedShape) => void
}

const AdvancedShapes = ({ onAddElement, onAddCustomShape }: AdvancedShapesProps) => {
  const advancedShapes: AdvancedShape[] = [
    {
      id: 'arrow-right-advanced',
      name: 'Arrow Right',
      icon: '→',
      description: 'Pointed arrow',
      type: 'polygon',
      properties: {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 2,
        points: [
          [0, 10], [60, 10], [60, 0], [80, 15], [60, 30], [60, 20], [0, 20]
        ]
      }
    },
    {
      id: 'arrow-left-advanced',
      name: 'Arrow Left',
      icon: '←',
      description: 'Pointed arrow',
      type: 'polygon',
      properties: {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 2,
        points: [
          [80, 10], [20, 10], [20, 0], [0, 15], [20, 30], [20, 20], [80, 20]
        ]
      }
    },
    {
      id: 'star-5-point',
      name: '5-Point Star',
      icon: '★',
      description: 'Five-pointed star',
      type: 'polygon',
      properties: {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 1,
        points: [
          [30, 0], [36, 20], [60, 20], [40, 32], [48, 56], [30, 40], [12, 56], [20, 32], [0, 20], [24, 20]
        ]
      }
    },
    {
      id: 'heart-shape',
      name: 'Heart',
      icon: '♥',
      description: 'Heart shape',
      type: 'path',
      properties: {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 1,
        path: 'M30,15 C30,15 25,5 15,5 C5,5 0,15 0,25 C0,35 15,45 30,55 C45,45 60,35 60,25 C60,15 55,5 45,5 C35,5 30,15 30,15 Z'
      }
    },
    {
      id: 'diamond-shape',
      name: 'Diamond',
      icon: '◆',
      description: 'Diamond shape',
      type: 'polygon',
      properties: {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 2,
        points: [
          [30, 0], [60, 30], [30, 60], [0, 30]
        ]
      }
    },
    {
      id: 'triangle-up',
      name: 'Triangle Up',
      icon: '▲',
      description: 'Upward triangle',
      type: 'polygon',
      properties: {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 2,
        points: [
          [30, 0], [60, 60], [0, 60]
        ]
      }
    },
    {
      id: 'triangle-down',
      name: 'Triangle Down',
      icon: '▼',
      description: 'Downward triangle',
      type: 'polygon',
      properties: {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 2,
        points: [
          [0, 0], [60, 0], [30, 60]
        ]
      }
    },
    {
      id: 'hexagon-shape',
      name: 'Hexagon',
      icon: '⬡',
      description: 'Hexagonal shape',
      type: 'polygon',
      properties: {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 2,
        points: [
          [20, 0], [40, 0], [50, 17], [40, 34], [20, 34], [10, 17]
        ]
      }
    },
    {
      id: 'octagon-shape',
      name: 'Octagon',
      icon: '⬢',
      description: 'Eight-sided shape',
      type: 'polygon',
      properties: {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 2,
        points: [
          [15, 0], [35, 0], [50, 15], [50, 35], [35, 50], [15, 50], [0, 35], [0, 15]
        ]
      }
    },
    {
      id: 'speech-bubble-advanced',
      name: 'Speech Bubble',
      icon: '💬',
      description: 'Speech bubble with tail',
      type: 'path',
      properties: {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 2,
        path: 'M10,10 C10,5 15,0 25,0 L75,0 C85,0 90,5 90,15 L90,35 C90,45 85,50 75,50 L25,50 C15,50 10,45 10,35 L10,10 Z M10,35 L25,50 L15,60 L10,35 Z'
      }
    },
    {
      id: 'burst-shape',
      name: 'Burst',
      icon: '✨',
      description: 'Burst/explosion shape',
      type: 'polygon',
      properties: {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 1,
        points: [
          [30, 0], [35, 20], [50, 20], [40, 30], [50, 50], [30, 40], [10, 50], [20, 30], [10, 20], [25, 20]
        ]
      }
    },
    {
      id: 'cloud-shape',
      name: 'Cloud',
      icon: '☁️',
      description: 'Cloud shape',
      type: 'path',
      properties: {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 1,
        path: 'M20,30 C20,20 30,15 40,15 C45,10 55,10 60,15 C70,15 80,25 80,35 C80,45 70,50 60,50 L20,50 C10,50 0,40 0,30 C0,20 10,15 20,15 C20,20 20,25 20,30 Z'
      }
    }
  ]

  const handleShapeClick = (shape: AdvancedShape) => {
    if (onAddCustomShape) {
      onAddCustomShape(shape)
    } else {
      // Fallback to basic rectangle with custom properties
      onAddElement('rect', {
        fill: shape.properties.fill,
        width: shape.properties.width || 60,
        height: shape.properties.height || 60,
        borderRadius: 10
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="mb-3">
        <h4 className="text-sm font-medium mb-2">Advanced Shapes</h4>
        <p className="text-xs text-gray-600 mb-3">Complex geometric shapes and paths</p>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {advancedShapes.map((shape) => (
          <button
            key={shape.id}
            onClick={() => handleShapeClick(shape)}
            className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors text-center group"
          >
            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center text-2xl text-blue-600 group-hover:scale-110 transition-transform">
              {shape.icon}
            </div>
            <p className="text-xs font-medium text-gray-700">{shape.name}</p>
            <p className="text-xs text-gray-500 mt-1">{shape.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export { AdvancedShapes } 