import { 
  DesignTab, 
  ElementsTab, 
  TextTab, 
  UploadsTab, 
  ToolsTab, 
  ProjectsTab 
} from './tabs'
import * as fabric from 'fabric'

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



  // Render the appropriate tab component based on activeTab
  switch (activeTab) {
    case 'design':
      return <DesignTab currentCanvasSize={canvasSize} onClosePanel={onClosePanel} onCanvasSizeChange={onCanvasSizeChange} />
    case 'elements':
      return <ElementsTab onClosePanel={onClosePanel} />
    case 'text':
      return <TextTab onClosePanel={onClosePanel} onAddText={onAddText} />
    case 'uploads':
      return <UploadsTab onClosePanel={onClosePanel} canvasRef={canvasRef} />
    case 'tools':
      return <ToolsTab onClosePanel={onClosePanel} canvasRef={canvasRef} onCanvasSizeChange={onCanvasSizeChange} />
    case 'projects':
      return <ProjectsTab onClosePanel={onClosePanel} />
    default:
      return null
  }
} 