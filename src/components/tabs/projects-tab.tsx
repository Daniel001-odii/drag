import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Search, X } from 'lucide-react'

interface ProjectsTabProps {
  onClosePanel: () => void
}

export function ProjectsTab({ onClosePanel }: ProjectsTabProps) {
  const projects = [
    { name: "Social Media Campaign", preview: "/placeholder.svg?height=120&width=120", modified: "2 hours ago" },
    { name: "Business Presentation", preview: "/placeholder.svg?height=120&width=120", modified: "1 day ago" },
    { name: "Marketing Flyer", preview: "/placeholder.svg?height=120&width=120", modified: "3 days ago" },
    { name: "Logo Design", preview: "/placeholder.svg?height=120&width=120", modified: "1 week ago" }
  ]

  return (
    <div className="w-[250px] bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
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
            placeholder="Search projects..."
            className="w-full pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Projects</h3>
            <div className="grid grid-cols-2 gap-3">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="group cursor-pointer rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="aspect-square bg-gray-50 rounded-t-lg overflow-hidden">
                    <img
                      src={project.preview}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                    <p className="text-xs text-gray-500">Modified {project.modified}</p>
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