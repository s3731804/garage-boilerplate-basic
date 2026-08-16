import type { Metadata } from 'next'
import { Geist, Geist_Mono, Sigmar } from 'next/font/google'
import { Providers } from '@/providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const sigmar = Sigmar({
  variable: '--font-sigmar',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME ?? 'App'}`,
    default: process.env.NEXT_PUBLIC_APP_NAME ?? 'App',
  },
  description: 'Built on garage-boilerplate',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${sigmar.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/*large logo in top right, "Team34." Sigmar font, with the 34 in blue */}
        <h1 className="text-7xl p-3" style={{fontFamily: 'var(--font-sigmar)'}}>
          Team<span className="text-blue-500">34</span>.
        </h1>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
