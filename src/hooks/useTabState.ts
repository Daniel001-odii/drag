import { useContext } from 'react'
import { TabStateContext } from '../contexts/TabStateContext.ts'

export function useTabState() {
  const context = useContext(TabStateContext)
  if (context === undefined) {
    throw new Error('useTabState must be used within a TabStateProvider')
  }
  return context
}
