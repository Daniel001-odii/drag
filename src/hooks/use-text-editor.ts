import { useRef, useCallback } from 'react'
import { fabric } from 'fabric'

interface TextEditorOptions {
  onTextChange: (newText: string) => void
  onCancel: () => void
}

export const useTextEditor = () => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const startEditing = useCallback((
    textObject: fabric.Textbox,
    canvas: fabric.Canvas,
    options: TextEditorOptions
  ) => {
    // Enter editing mode
    textObject.enterEditing()
    textObject.selectAll()
    
    // Get the textarea element that fabric.js creates
    const fabricTextarea = canvas.getActiveObject() as fabric.Textbox
    if (!fabricTextarea || !fabricTextarea.hiddenTextarea) {
      return
    }

    const textarea = fabricTextarea.hiddenTextarea
    textareaRef.current = textarea

    // Set up event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        options.onTextChange(textarea.value)
        textObject.exitEditing()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        options.onCancel()
        textObject.exitEditing()
      }
    }

    const handleBlur = () => {
      options.onTextChange(textarea.value)
      textObject.exitEditing()
    }

    // Add event listeners
    textarea.addEventListener('keydown', handleKeyDown)
    textarea.addEventListener('blur', handleBlur)

    // Focus the textarea
    textarea.focus()

    // Cleanup function
    return () => {
      textarea.removeEventListener('keydown', handleKeyDown)
      textarea.removeEventListener('blur', handleBlur)
    }
  }, [])

  const stopEditing = useCallback(() => {
    // This will be handled by fabric.js automatically
    textareaRef.current = null
  }, [])

  return {
    startEditing,
    stopEditing,
    isEditing: !!textareaRef.current
  }
} 