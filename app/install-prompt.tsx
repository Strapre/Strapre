"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent | null
  }
}

export default function InstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // Check if the prompt is already deferred globally
    if (window.deferredPrompt) {
      setShowInstallPrompt(true)
    }

    const handler = () => {
      setShowInstallPrompt(true)
    }

    // Listen to the custom event dispatched by the head script
    window.addEventListener("pwa-install-prompt-available", handler)

    return () => {
      window.removeEventListener("pwa-install-prompt-available", handler)
    }
  }, [])

  const handleInstall = async () => {
    const promptEvent = window.deferredPrompt
    if (!promptEvent) return

    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice

    if (outcome === "accepted") {
      console.log("User accepted the install prompt")
    } else {
      console.log("User dismissed the install prompt")
    }

    window.deferredPrompt = null
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
            <img src="/strapreicon.png" alt="User" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Install Strapre</h3>
            <p className="text-xs text-gray-600">Add to your home screen for quick access</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex space-x-2">
        <Button onClick={handleInstall} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Install
        </Button>
        <Button variant="outline" onClick={handleDismiss} className="flex-1 text-sm" size="sm">
          Not now
        </Button>
      </div>
    </div>
  )
}
