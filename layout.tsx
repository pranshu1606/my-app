import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthCheck } from "@/components/auth-check"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI-Driven Education Platform",
  description: "An adaptive learning platform powered by AI",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthCheck>{children}</AuthCheck>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'