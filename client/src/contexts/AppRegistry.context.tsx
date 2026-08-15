import { createContext, useContext } from 'react'
import type { AppDefinition } from '../types'

interface AppRegistryContextType {
  apps: AppDefinition[]
}

export const AppRegistryContext = createContext<AppRegistryContextType>({ apps: [] })

export function AppRegistryProvider({ value, children }: { value: AppRegistryContextType; children: React.ReactNode }) {
  return (
    <AppRegistryContext.Provider value={value}>
      {children}
    </AppRegistryContext.Provider>
  )
}

export function useAppRegistry() {
  return useContext(AppRegistryContext)
}
