import type { Metadata } from "next"
import ProductPageClient from "./ProductPageClient"

interface Props {
  params: { slug: string }
}

// Generate dynamic metadata for each product page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Fetch product data
    const response = await fetch(`https://api.strapre.com/api/v1/products/${params.slug}`)
    
    if (!response.ok) {
      return {
        title: "Product Not Found | Strapre",
        description: "The product you're looking for could not be found.",
      }
    }

    const data = await response.json()
    const product = data.data

    const formatPrice = (price: string) => {
      const numPrice = Number.parseFloat(price)
      return `₦${numPrice.toLocaleString()}`
    }

    const productPrice = formatPrice(product.price)
    const productImage = product.images[0]?.url || "/placeholder.svg"
    const storeLocation = `${product.store.store_lga}, ${product.store.store_state}`
    const description = `${product.description.substring(0, 200)}... Available in ${storeLocation}`

    return {
      title: `${product.name} - ${productPrice} | Strapre`,
      description: description,
      openGraph: {
        type: "website",
        siteName: "Strapre",
        title: `${product.name} - ${productPrice}`,
        description: description,
        images: [
          {
            url: productImage,
            width: 800,
            height: 600,
            alt: product.name,
          }
        ],
        locale: "en_NG",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} - ${productPrice}`,
        description: description,
        images: [productImage],
      },
      other: {
        // Product specific meta tags
        "product:price:amount": product.price,
        "product:price:currency": "NGN",
        "product:availability": "in stock",
        "product:condition": "new",
        "product:brand": product.brand || "Strapre",
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Product | Strapre",
      description: "Strapre - Online Marketplace",
    }
  }
}

// Server component that renders the client component
export default function ProductPage({ params }: Props) {
  return <ProductPageClient slug={params.slug} />
}