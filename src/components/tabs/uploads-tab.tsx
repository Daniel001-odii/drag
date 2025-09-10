import { useState, useRef, useCallback } from 'react'
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Search, X, Upload, Image, File, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import * as fabric from 'fabric'
import { addImageToCanvas } from '../../lib/fabric-object-utils'
import { useTabState } from '../../hooks/useTabState'

interface UploadsTabProps {
  onClosePanel: () => void
  canvasRef?: fabric.Canvas | null
}

interface UploadItem {
  id: string
  name: string
  type: 'image' | 'document' | 'other'
  url: string
  preview?: string
  size: string
  date: string
}

export function UploadsTab({ onClosePanel, canvasRef }: UploadsTabProps) {
  const { tabStates, updateTabState } = useTabState();
  const [uploads, setUploads] = useState<UploadItem[]>([
 /*    {
      id: '1',
      name: 'sample-image.jpg',
      type: 'image',
      url: '/placeholder.svg?height=120&width=120',
      preview: '/placeholder.svg?height=120&width=120',
      size: '2.4 MB',
      date: '2 days ago'
    },
    {
      id: '2',
      name: 'logo.svg',
      type: 'image',
      url: '/placeholder.svg?height=120&width=120',
      preview: '/placeholder.svg?height=120&width=120',
      size: '45 KB',
      date: '1 week ago'
    },
    {
      id: '3',
      name: 'document.pdf',
      type: 'document',
      url: '#',
      size: '1.2 MB',
      date: '3 days ago'
    } */
  ])
  const { searchValue: searchQuery, selectedFiles } = tabStates.uploads;
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredUploads = uploads.filter(upload =>
    upload.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsUploading(true)
    
    try {
      const newUploads: UploadItem[] = []
      
      for (const file of Array.from(files)) {
        // Check file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`)
          continue
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 10MB`)
          continue
        }

        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file)
        
        const newUpload: UploadItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: 'image',
          url: objectUrl,
          preview: objectUrl,
          size: formatFileSize(file.size),
          date: 'Just now'
        }
        
        newUploads.push(newUpload)
      }

      setUploads(prev => [...newUploads, ...prev])
      
      if (newUploads.length > 0) {
        toast.success(`Successfully uploaded ${newUploads.length} image${newUploads.length > 1 ? 's' : ''}`)
      }
    } catch (error) {
      toast.error('Failed to upload files')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileUpload])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const handleAddToCanvas = useCallback(async (upload: UploadItem) => {
    if (upload.type === 'image' && upload.url && canvasRef) {
      try {
        await addImageToCanvas(canvasRef, upload.url)
        toast.success(`Added ${upload.name} to canvas`)
      } catch (error) {
        toast.error('Failed to add image to canvas')
        console.error('Add image error:', error)
      }
    } else if (!canvasRef) {
      toast.error('Canvas not available')
    }
  }, [canvasRef])

  const handleDeleteUpload = useCallback((uploadId: string) => {
    setUploads(prev => {
      const upload = prev.find(u => u.id === uploadId)
      if (upload && upload.url.startsWith('blob:')) {
        URL.revokeObjectURL(upload.url)
      }
      return prev.filter(u => u.id !== uploadId)
    })
    toast.success('File deleted')
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  return (
    <div className="w-[280px] bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Uploads</h2>
          <button
            onClick={onClosePanel}
            className="h-6 w-6 p-0 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Search uploads..."
            value={searchQuery}
            onChange={(e) => updateTabState('uploads', { searchValue: e.target.value })}
            className="w-full pl-10"
          />
        </div>

        {/* Upload Button */}
       {/*  <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
          variant="outline"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Images'}
        </Button> */}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Area */}
      <div
        className="mx-4 mt-3 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Drag & drop images here</p>
        <p className="text-xs text-gray-500 mt-1">or click to browse</p>
      </div>
      <span> {isUploading ? 'Uploading...' : 'Upload Images'}</span>
      {/* Uploads List */}
      <ScrollArea className="flex-1 overflow-hidden border-t mt-4">
        <div className="p-4">
          <h1 className="text-left mb-4 font-bold">Your imports</h1>
          {filteredUploads.length === 0 ? (
            <div className="text-center py-8">
              <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No uploads found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUploads.map((upload) => (
                <div
                  key={upload.id}
                  className="group relative bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between space-x-3">
                    {/* Preview/Icon with hover overlay */}
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                      {upload.preview ? (
                        <>
                          <img
                            src={upload.preview}
                            alt={upload.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Add icon overlay - visible on hover */}
                          {upload.type === 'image' && (
                            <div className="absolute inset-0 bg-[#00000050] bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => handleAddToCanvas(upload)}
                                className="p-1 bg-white rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Add to canvas"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getFileIcon(upload.type)}
                        </div>
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 max-w-[100px]">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {upload.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {upload.size} • {upload.date}
                      </p>
                    </div>

                    {/* Delete button - positioned at far right */}
                    <button
                      onClick={() => handleDeleteUpload(upload.id)}
                      className="p-1 hover:bg-red-100 rounded-full text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 