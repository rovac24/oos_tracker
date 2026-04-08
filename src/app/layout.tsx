import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OOS Tracker',
  description: 'Out-of-stock order note builder',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
