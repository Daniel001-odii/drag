import React from 'react'
import type { CanvasElement } from '../lib/types'

interface CustomShape {
  id: string
  name: string
  icon: string
  description: string
  type: 'custom'
  properties: Partial<CanvasElement>
}

interface CustomShapesProps {
    onAddElement: (elementType: 'rect' | 'circle' | 'text' | 'rounded-rectangle', properties?: Partial<CanvasElement>) => void
}

const CustomShapes = ({ onAddElement }: CustomShapesProps) => {
  const customShapes: CustomShape[] = [
    {
      id: 'arrow-right',
      name: 'Arrow Right',
      icon: '→',
      description: 'Right-pointing arrow',
      type: 'custom',
      properties: {
        type: 'rect',
        fill: '#3b82f6',
        width: 80,
        height: 20,
        borderRadius: 10
      }
    },
    {
      id: 'arrow-left',
      name: 'Arrow Left',
      icon: '←',
      description: 'Left-pointing arrow',
      type: 'custom',
      properties: {
        type: 'rect',
        fill: '#3b82f6',
        width: 80,
        height: 20,
        borderRadius: 10
      }
    },
    {
      id: 'star',
      name: 'Star',
      icon: '★',
      description: 'Five-pointed star',
      type: 'custom',
      properties: {
        type: 'rect',
        fill: '#3b82f6',
        width: 60,
        height: 60,
        borderRadius: 30
      }
    },
    {
      id: 'heart',
      name: 'Heart',
      icon: '♥',
      description: 'Heart shape',
      type: 'custom',
      properties: {
        type: 'rect',
        fill: '#3b82f6',
        width: 50,
        height: 50,
        borderRadius: 25
      }
    },
    {
      id: 'diamond',
      name: 'Diamond',
      icon: '◆',
      description: 'Diamond shape',
      type: 'custom',
      properties: {
        type: 'rect',
        fill: '#3b82f6',
        width: 60,
        height: 60,
        rotation: 45
      }
    },
    {
      id: 'triangle',
      name: 'Triangle',
      icon: '▲',
      description: 'Triangle shape',
      type: 'custom',
      properties: {
        type: 'rect',
        fill: '#3b82f6',
        width: 60,
        height: 60,
        rotation: 45
      }
    },
    {
      id: 'hexagon',
      name: 'Hexagon',
      icon: '⬡',
      description: 'Hexagonal shape',
      type: 'custom',
      properties: {
        type: 'rect',
        fill: '#3b82f6',
        width: 60,
        height: 60,
        borderRadius: 30
      }
    },
    {
      id: 'speech-bubble',
      name: 'Speech Bubble',
      icon: '💬',
      description: 'Speech bubble with tail',
      type: 'custom',
      properties: {
        type: 'rect',
        fill: '#3b82f6',
        width: 100,
        height: 60,
        borderRadius: 20
      }
    },
    {
      id: 'badge',
      name: 'Badge',
      icon: '🏷️',
      description: 'Rounded badge',
      type: 'custom',
      properties: {
        type: 'rect',
        fill: '#3b82f6',
        width: 80,
        height: 30,
        borderRadius: 15
      }
    },
    {
      id: 'pill',
      name: 'Pill',
      icon: '💊',
      description: 'Pill-shaped element',
      type: 'custom',
      properties: {
        type: 'rect',
        fill: '#3b82f6',
        width: 100,
        height: 30,
        borderRadius: 15
      }
    },
    {
      id: 'frame',
      name: 'Frame',
      icon: '🖼️',
      description: 'Picture frame',
      type: 'custom',
      properties: {
        type: 'rect',
        fill: '#3b82f6',
        width: 120,
        height: 80,
        borderRadius: 10
      }
    },
    {
      id: 'button',
      name: 'Button',
      icon: '🔘',
      description: 'Clickable button',
      type: 'custom',
      properties: {
        type: 'rect',
        fill: '#3b82f6',
        width: 100,
        height: 40,
        borderRadius: 20
      }
    }
  ]

  const handleShapeClick = (shape: CustomShape) => {
    // For now, we'll use rect as the base type and apply custom properties
    // In a full implementation, you'd want to create actual custom fabric.js objects
    onAddElement('rect', shape.properties)
  }

  return (
    <div className="space-y-4">
      <div className="mb-3">
        <h4 className="text-sm font-medium mb-2">Custom Shapes</h4>
        <p className="text-xs text-gray-600 mb-3">Commonly used graphic design elements</p>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {customShapes.map((shape) => (
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

export { CustomShapes } 