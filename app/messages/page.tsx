import type { Metadata } from "next"
import { Suspense } from "react"
import MessagesClient from "./MessagesClient"

export const metadata: Metadata = {
  title: "Messages | Strapre",
  robots: { index: false, follow: false },
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesClient />
    </Suspense>
  )
}
