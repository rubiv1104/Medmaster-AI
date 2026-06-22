import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s — MedMaster AI',
    default: 'MedMaster AI',
  },
  description: 'A revision-first academic operating system for MD Ayurveda postgraduate students.',
  keywords: ['Ayurveda', 'MD', 'postgraduate', 'revision', 'medical education', 'spaced repetition'],
  openGraph: {
    title: 'MedMaster AI',
    description: 'Retain more. Revise smarter. Master your syllabus.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
