import { useState } from 'react'
import { Lock, Copy, Trash2, MoreHorizontal, LockOpen } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'

interface ObjectFloatingMenuProps {
  position: { x: number; y: number }
  onLock: () => void
  onDuplicate: () => void
  onDelete: () => void
  isLocked?: boolean
  onBringToFront?: () => void
  onSendToBack?: () => void
  onCopy?: () => void
  onPaste?: () => void
}

export function ObjectFloatingMenu({
  position,
  onLock,
  onDuplicate,
  onDelete,
  isLocked,
  onBringToFront,
  onSendToBack,
  onCopy,
  onPaste
}: ObjectFloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

    return (
          <div
        className="absolute z-50 flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 scale-150"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -100%)',
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
      {/* Lock Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onLock}
        className={`h-8 w-8 p-0 ${isLocked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800'}`}
        title={isLocked ? 'Unlock object' : 'Lock object'}
      >
        {
          isLocked ?  <Lock className="h-4 w-4" /> :  <LockOpen className="h-4 w-4"/>
        }
       
       
      </Button>
      

      {/* Duplicate Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDuplicate}
        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
        title="Duplicate object"
      >
        <Copy className="h-4 w-4" />
      </Button>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
        title="Delete object"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* More Options Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
            title="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onBringToFront && (
            <DropdownMenuItem onClick={onBringToFront}>
              Bring to Front
            </DropdownMenuItem>
          )}
          {onSendToBack && (
            <DropdownMenuItem onClick={onSendToBack}>
              Send to Back
            </DropdownMenuItem>
          )}
          {onCopy && (
            <DropdownMenuItem onClick={onCopy}>
              Copy
            </DropdownMenuItem>
          )}
          {onPaste && (
            <DropdownMenuItem onClick={onPaste}>
              Paste
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onDuplicate}>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onLock}
            className={isLocked ? 'text-blue-600' : ''}
          >
            {isLocked ? 'Unlock' : 'Lock'}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onDelete}
            className="text-red-600 focus:text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 