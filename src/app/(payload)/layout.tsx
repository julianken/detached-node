import '@payloadcms/next/css'
import React from 'react'

export const metadata = {
  title: 'Admin | Mind-Controlled',
}

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
