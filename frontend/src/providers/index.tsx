'use client'

import type { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { Toaster } from 'sonner'
import { usePathname } from 'next/navigation'

/**
 * Compose all client-side providers here.
 * Import this in the root layout only.
 */
export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  // This exact route contains synthetic QA fixtures only. It must work without
  // Firebase credentials; authenticated routes keep the existing provider.
  if (pathname === '/preview/s2-3') return <>{children}</>

  return (
    <AuthProvider>
      {children}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  )
}
