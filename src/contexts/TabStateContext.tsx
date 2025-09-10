import { useState, useCallback, type ReactNode } from 'react'
import { TabStateContext, type TabStates } from './TabStateContext'

// Default states for each tab
const defaultTabStates: TabStates = {
  generate: {
    messages: [],
    inputValue: "",
    expandedReasoning: new Set(),
    showScrollButton: false,
    designHistory: []
  },
  design: {
    customWidth: "650",
    customHeight: "650",
    selectedSize: ""
  },
  text: {
    searchValue: ""
  },
  elements: {
    searchValue: ""
  },
  uploads: {
    searchValue: "",
    selectedFiles: []
  },
  tools: {
    searchValue: "",
    selectedTool: ""
  },
  projects: {
    searchValue: "",
    selectedProject: ""
  }
}


interface TabStateProviderProps {
  children: ReactNode
}

export function TabStateProvider({ children }: TabStateProviderProps) {
  const [tabStates, setTabStates] = useState<TabStates>(defaultTabStates)

  const updateTabState = useCallback(<K extends keyof TabStates>(
    tabName: K,
    updates: Partial<TabStates[K]>
  ) => {
    setTabStates(prev => ({
      ...prev,
      [tabName]: {
        ...prev[tabName],
        ...updates
      }
    }))
  }, [])

  const resetTabState = useCallback((tabName: keyof TabStates) => {
    setTabStates(prev => ({
      ...prev,
      [tabName]: defaultTabStates[tabName]
    }))
  }, [])

  const resetAllTabStates = useCallback(() => {
    setTabStates(defaultTabStates)
  }, [])

  return (
    <TabStateContext.Provider value={{
      tabStates,
      updateTabState,
      resetTabState,
      resetAllTabStates
    }}>
      {children}
    </TabStateContext.Provider>
  )
}

