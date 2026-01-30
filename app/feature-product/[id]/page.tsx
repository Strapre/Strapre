// app/feature-product/[id]/page.tsx (Server Component)
import { notFound } from 'next/navigation'
import FeatureProductDetailClient from './FeatureProductDetailClient'

interface SubscriptionPlan {
  id: string
  name: string
  price: string
  description: string
  duration_days: number
  max_products: number
  refresh_interval: number
}

interface ProductImage {
  id: string
  url: string
}

interface FeaturedProduct {
  id: string
  name: string
  price: string
  images: ProductImage[]
  is_featured: number
  featured_at?: string
  category_id?: string
  slug?: string
  description?: string
  specifications?: string[]
  brand?: string
  wholesale_price?: string
  created_at?: string
}

interface UserSubscription {
  id: string
  starts_at: string
  ends_at: string
  is_active: boolean
  plan: SubscriptionPlan
  products: FeaturedProduct[]
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function FeatureProductDetailPage({ params }: PageProps) {
  const { id } = params
  
  // Since auth token is in localStorage (client-side only), 
  // we'll let the client component handle the data fetching
  // and just pass the subscription ID
  
  return <FeatureProductDetailClient subscriptionId={id} />
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { id } = params
  
  return {
    title: 'Subscription Details - Feature Products',
    description: 'Manage your subscription and featured products.',
  }
}