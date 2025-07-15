import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Strapre - Online Marketplace",
  description: "Best Online store to connect vendors to vendors and vendors to customers",
  manifest: "/manifest.json",
  themeColor: "#dc2626",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Strapre",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Strapre",
    title: "Strapre - Online Marketplace",
    description: "Best Online store to connect vendors to vendors and vendors to customers",
  },
  twitter: {
    card: "summary",
    title: "Strapre - Online Marketplace",
    description: "Best Online store to connect vendors to vendors and vendors to customers",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/android/android-launchericon-192-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Strapre" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#dc2626" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
