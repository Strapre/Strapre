import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Strapre - Multi-Vendor Marketplace | B2B & B2C Platform",
  description: "Strapre connects vendors to vendors and customers worldwide. Join our online marketplace to buy, sell, network, and grow your business today.",
  formatDetection: {
    telephone: false,
  },
  // openGraph: {
  //   type: "website",
  //   siteName: "Strapre",
  //   title: "Strapre - Online Marketplace",
  //   description: "Best Online store to connect vendors to vendors and vendors to customers",
  // },
  // twitter: {
  //   card: "summary",
  //   title: "Strapre - Online Marketplace",
  //   description: "Best Online store to connect vendors to vendors and vendors to customers",
  // },
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
}

export const viewport = {
  themeColor: "#dc2626",
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var registration of registrations) {
                    registration.unregister();
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

