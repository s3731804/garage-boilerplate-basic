import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'

// Everything under /preview is a synthetic QA harness, not a product page. It is
// served on local builds and on Vercel Preview deployments (so design QA can
// review a branch remotely) but never on the production deployment.
//
// VERCEL_ENV rather than NODE_ENV: a local `next start` is also a production
// build, and the S2-3 QA workflow depends on it.
export default function PreviewLayout({ children }: { children: ReactNode }) {
  if (process.env.VERCEL_ENV === 'production') notFound()
  return children
}
