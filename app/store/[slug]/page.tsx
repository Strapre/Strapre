import type { Metadata } from "next"
import StorePageClient from "./StorePageClient"
import { BASE_URL } from "@/lib/api"

interface Props {
  params: Promise<{ slug: string }>
}

// Generate dynamic metadata for each store page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const response = await fetch(`${BASE_URL}/stores/${slug}`, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      return {
        title: "Seller Profile | Strapre",
        description: "View seller profile and their available products on Strapre.",
      }
    }

    const data = await response.json()
    const store = data.data

    const storeName = store?.store_name || store?.name || "Seller Profile"
    const description = store?.store_description || `Check out ${storeName} on Strapre. Connect directly via WhatsApp to shop.`
    const storeImage = store?.store_image || "/placeholder.svg"

    return {
      title: `${storeName} | Strapre`,
      description: description,
      openGraph: {
        type: "website",
        siteName: "Strapre",
        title: `${storeName} on Strapre`,
        description: description,
        images: [
          {
            url: storeImage,
            width: 800,
            height: 600,
            alt: storeName,
          }
        ],
        locale: "en_NG",
      },
      twitter: {
        card: "summary",
        title: `${storeName} on Strapre`,
        description: description,
        images: [storeImage],
      },
    }
  } catch (error) {
    console.error("Error generating metadata for store:", error)
    return {
      title: "Seller Profile | Strapre",
      description: "Strapre - Online Marketplace",
    }
  }
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params
  return <StorePageClient slug={slug} />
}
