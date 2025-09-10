import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Search, X, Wand2, Sparkles, Palette, Play, FileJson, Download } from 'lucide-react'
import * as fabric from 'fabric'
import { downloadPureFabricJSON, importCanvasFromJSON } from '../../lib/fabric-canvas-utils'
import { toast } from 'sonner'
import { useTabState } from '../../hooks/useTabState'

interface ToolsTabProps {
  onClosePanel: () => void
  canvasRef?: fabric.Canvas | null
  onCanvasSizeChange?: (size: { width: number; height: number }) => void
}

export function ToolsTab({ onClosePanel, canvasRef, onCanvasSizeChange }: ToolsTabProps) {
  const { tabStates, updateTabState } = useTabState();
  const { searchValue } = tabStates.tools;
  // Handle JSON export
  const handleExportJSON = async () => {
    if (!canvasRef) {
      toast.error('Canvas not available')
      return
    }

    try {
      await downloadPureFabricJSON(canvasRef, 'fabric-canvas.json')
      toast.success('Design exported as pure Fabric JSON successfully!')
    } catch (error) {
      console.error('Error exporting JSON:', error)
      toast.error('Failed to export design')
    }
  }

  // Handle JSON import
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !canvasRef) {
      toast.error('Please select a valid JSON file')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const jsonContent = e.target?.result as string
        const jsonData = JSON.parse(jsonContent)
        
        // Check if it's a wrapped project file or pure Fabric JSON
        if (jsonData.canvas && jsonData.canvas.objects) {
          // It's a wrapped project file
          await importCanvasFromJSON(canvasRef, jsonData, { 
            clearCanvas: true,
            onCanvasSizeChange: onCanvasSizeChange
          })
        } else if (jsonData.objects) {
          // It's pure Fabric JSON
          canvasRef.clear()
          canvasRef.loadFromJSON(jsonData).then((canvas) => {
            canvas.requestRenderAll()
            
            // Update canvas size in UI if dimensions are available
            if (jsonData.width && jsonData.height && onCanvasSizeChange) {
              onCanvasSizeChange({ width: jsonData.width, height: jsonData.height })
            }
          });
         /*  canvasRef.loadFromJSON(jsonData, () => {
            canvasRef.renderAll()
          }) */
        } else {
          throw new Error('Invalid JSON format')
        }
        
        toast.success('Design imported successfully!')
      } catch (error) {
        console.error('Error importing JSON:', error)
        toast.error('Failed to import design file')
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    event.target.value = ''
  }

  const tools = [
    { name: "Background Remover", icon: Wand2, description: "Remove backgrounds instantly" },
    { name: "Magic Resize", icon: Sparkles, description: "Resize designs automatically" },
    { name: "Brand Kit", icon: Palette, description: "Apply your brand colors" },
    { name: "Animator", icon: Play, description: "Add animations to designs" }
  ]

  const jsonTools = [
    { name: "Load File via JSON", icon: FileJson, description: "Import design from JSON file", action: () => document.getElementById('json-import')?.click() },
    { name: "Export JSON", icon: Download, description: "Export design as pure Fabric JSON", action: handleExportJSON }
  ]

  return (
    <div className="w-[250px] bg-white border-r border-gray-200 flex flex-col">
      {/* Hidden file input for JSON import */}
      <input
        id="json-import"
        type="file"
        accept=".json"
        onChange={handleImportJSON}
        className="hidden"
      />
      
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Tools</h2>
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
            placeholder="Search tools..."
            className="w-full pl-10"
            value={searchValue}
            onChange={(e) => updateTabState('tools', { searchValue: e.target.value })}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4 space-y-6">
          {/* JSON Tools Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">File Operations</h3>
            <div className="grid grid-cols-2 gap-3">
              {jsonTools.map((tool, index) => (
                <div
                  key={index}
                  className="group cursor-pointer rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                  onClick={tool.action}
                >
                  <div className="aspect-square bg-gray-50 rounded-t-lg flex items-center justify-center">
                    <tool.icon className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{tool.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Design Tools Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Design Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {tools.map((tool, index) => (
                <div
                  key={index}
                  className="group cursor-pointer rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="aspect-square bg-gray-50 rounded-t-lg flex items-center justify-center">
                    <tool.icon className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{tool.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
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