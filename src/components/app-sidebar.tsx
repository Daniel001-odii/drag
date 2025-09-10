import { Button } from "./ui/button"
import { Type, Upload, Wrench, FolderOpen, LucideTable2, LucideShapes, LucideSparkles } from 'lucide-react'

const sidebarItems = [
  { id: 'generate', icon: LucideSparkles, label: "Generate" },
  { id: 'design', icon: LucideTable2, label: "Design" },
  { id: 'elements', icon: LucideShapes, label: "Elements" },
  { id: 'text', icon: Type, label: "Text" },
  { id: 'uploads', icon: Upload, label: "Imports" },
  { id: 'tools', icon: Wrench, label: "Tools" },
  { id: 'projects', icon: FolderOpen, label: "Projects" }
]

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col py-4">
      {sidebarItems.map((item, index) => (
        <div key={index} className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(item.id)}
            className={`w-full h-16 flex flex-col items-center justify-center gap-1 rounded-none hover:bg-gray-100 ${
              activeTab === item.id ? 'bg-blue-50 text-green-600 border-r-2 border-green-600' : 'text-gray-600'
            }`}
          >
            <item.icon className="size-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        </div>
      ))}
    </div>
  )
} 