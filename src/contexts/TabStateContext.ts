import { createContext } from 'react'

// Define the state structure for each tab
export interface TabStates {
  generate: {
    messages: Array<{
      id: number
      text: string
      sender: "user" | "ai"
      reasoning?: string
      designPreview?: {
        fabricJSON: unknown
        status: 'pending' | 'accepted' | 'declined'
      }
    }>
    inputValue: string
    expandedReasoning: Set<number>
    showScrollButton: boolean
    designHistory: Array<{
      id: string
      fabricJSON: unknown
      prompt: string
      timestamp: number
      preview?: string
    }>
  }
  design: {
    customWidth: string
    customHeight: string
    selectedSize: string
  }
  text: {
    searchValue: string
  }
  elements: {
    searchValue: string
  }
  uploads: {
    searchValue: string
    selectedFiles: File[]
  }
  tools: {
    searchValue: string
    selectedTool: string
  }
  projects: {
    searchValue: string
    selectedProject: string
  }
}

export interface TabStateContextType {
  tabStates: TabStates
  updateTabState: <K extends keyof TabStates>(
    tabName: K,
    updates: Partial<TabStates[K]>
  ) => void
  resetTabState: (tabName: keyof TabStates) => void
  resetAllTabStates: () => void
}

export const TabStateContext = createContext<TabStateContextType | undefined>(undefined)
