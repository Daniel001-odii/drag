import { 
  DesignTab, 
  ElementsTab, 
  TextTab, 
  UploadsTab, 
  ToolsTab, 
  ProjectsTab, 
} from './tabs'
import * as fabric from 'fabric'
import { GenerateTab } from './tabs/generate-tab'
import { importCanvasFromJSON } from '../lib/fabric-canvas-utils'

interface SidebarContentPanelProps {
  activeTab: string
  showDetailsPanel: boolean
  onClosePanel: () => void
  canvasRef?: fabric.Canvas | null
  onCanvasSizeChange?: (size: { width: number; height: number }) => void
  onAddText?: (style?: 'heading' | 'subheading' | 'body') => void
  canvasSize: { width: number, height: number}
}

export function SidebarContentPanel({ canvasSize, activeTab, showDetailsPanel, onClosePanel, canvasRef, onCanvasSizeChange, onAddText }: SidebarContentPanelProps) {
  if (!showDetailsPanel) return null

  // Handle fabric JSON updates from AI generation
  const handleFabricJSONUpdate = async (fabricJSON: unknown) => {
    if (!canvasRef || !fabricJSON) return;
    
    try {
      // Check if the JSON is in the expected format (has canvas property)
      // If not, wrap it in the expected format
      const fabricData = fabricJSON as Record<string, unknown>;
      const jsonToImport = fabricData.canvas ? fabricJSON : {
        version: '1.0.0',
        name: 'AI Generated Design',
        createdAt: new Date().toISOString(),
        canvas: fabricJSON,
        metadata: {
          totalObjects: Array.isArray(fabricData.objects) ? fabricData.objects.length : 0,
          exportDate: new Date().toISOString(),
          app: 'Fizzle AI'
        }
      };

      await importCanvasFromJSON(canvasRef, jsonToImport, {
        clearCanvas: true,
        onCanvasSizeChange: onCanvasSizeChange
      });
    } catch (error) {
      console.error('Error updating canvas with fabric JSON:', error);
    }
  };

  // Render all tabs but only show the active one to preserve state
  return (
    <div className="relative">
      {/* Generate Tab */}
      <div className={activeTab === 'generate' ? 'flex h-full' : 'hidden'}>
        <GenerateTab onClosePanel={onClosePanel} onCanvasSizeChange={onCanvasSizeChange} onFabricJSONUpdate={handleFabricJSONUpdate} canvasRef={canvasRef} />
      </div>

      {/* Design Tab */}
      <div className={activeTab === 'design' ? 'flex h-full' : 'hidden'}>
        <DesignTab currentCanvasSize={canvasSize} onClosePanel={onClosePanel} onCanvasSizeChange={onCanvasSizeChange} />
      </div>

      {/* Elements Tab */}
      <div className={activeTab === 'elements' ? 'flex h-full' : 'hidden'}>
        <ElementsTab onClosePanel={onClosePanel} />
      </div>

      {/* Text Tab */}
      <div className={activeTab === 'text' ? 'flex h-full' : 'hidden'}>
        <TextTab onClosePanel={onClosePanel} onAddText={onAddText} />
      </div>

      {/* Uploads Tab */}
      <div className={activeTab === 'uploads' ? 'flex h-full' : 'hidden'}>
        <UploadsTab onClosePanel={onClosePanel} canvasRef={canvasRef} />
      </div>

      {/* Tools Tab */}
      <div className={activeTab === 'tools' ? 'flex h-full' : 'hidden'}>
        <ToolsTab onClosePanel={onClosePanel} canvasRef={canvasRef} onCanvasSizeChange={onCanvasSizeChange} />
      </div>

      {/* Projects Tab */}
      <div className={activeTab === 'projects' ? 'flex h-full' : 'hidden'}>
        <ProjectsTab onClosePanel={onClosePanel} />
      </div>
    </div>
  )
} 