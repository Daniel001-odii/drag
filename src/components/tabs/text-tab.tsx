import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { LucideType, Search, X } from 'lucide-react'

interface TextTabProps {
  onClosePanel: () => void
  onAddText?: (style?: 'heading' | 'subheading' | 'body') => void
}

// Augment window typing locally for the fallback
declare global {
  interface Window {
    addTextToCanvas?: (style?: 'heading' | 'subheading' | 'body') => void
  }
}

export function TextTab({ onClosePanel, onAddText }: TextTabProps) {
  const headings = [
    { name: "Add a heading", style: "text-3xl font-extrabold", sample: "Heading", type: "heading" as const },
    { name: "Add a subheading", style: "text-xl font-bold", sample: "Subheading", type: "subheading" as const },
    { name: "Add body text", style: "text-base", sample: "Body text", type: "body" as const },
  ]

  const handleAddText = (textStyle?: 'heading' | 'subheading' | 'body') => {
    if (onAddText) {
      onAddText(textStyle)
      return
    }
    // Fallback to global for backward compatibility
    const addTextToCanvas = window.addTextToCanvas
    if (typeof addTextToCanvas === 'function') addTextToCanvas(textStyle)
  }


  return (
    <div className="w-[250px] bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Text</h2>
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
            placeholder="Search text..."
            className="w-full pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4 space-y-6">

            <Button 
              className=" w-full p-3 bg-indigo-500 hover:bg-indigo-600"
              onClick={() => handleAddText()}
            >
                <LucideType/>
                <span>Add a text box</span>
            </Button>
          {/* Headings Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 text-left">Default text styles</h3>
            <div className="flex flex-col gap-3">
              {headings.map((heading, index) => (
                <div
                  key={index}
                  className="cursor-pointer hover:bg-gray-50 flex-1 transition-colors"
                  onClick={() => handleAddText(heading.type)}
                >
                  <div className="p-3 text-left bg-gray-100 rounded-xl border border-gray-200 hover:bg-gray-200 transition-colors">
                    <span className={heading.style}>{heading.sample}</span>
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