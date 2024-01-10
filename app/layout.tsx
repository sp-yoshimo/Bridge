import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from "@clerk/nextjs"
import { jaJP } from "@clerk/localizations"
import { ThemeProvider } from '@/components/provider/theme-provider'
import { ModalProvider } from '@/components/provider/modal-provider'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Bridge',
  description: 'オンライン授業に、より双方向性を求めるウェブアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      localization={jaJP}
    >
      <html lang="ja" suppressHydrationWarning>
        <body>
          <ThemeProvider
            defaultTheme='light'
            attribute='class'
          >
            <ModalProvider />
            <Toaster />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
