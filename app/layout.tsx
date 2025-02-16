import type { Metadata } from 'next'
import './globals.css'
import { Providers } from "./providers"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: 'Klug - Manage your LLM agents in one place.',
  description: 'Manage your LLM agents in one place.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
