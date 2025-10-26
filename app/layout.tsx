import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gluta-nator - Contador de Rodízio',
  description: 'Contador de pedaços de pizza/sushi em competições',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
