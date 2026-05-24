// app/feature-product/[id]/FeatureProductDetailClient.tsx (Client Component)
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Crown, 
  Calendar,
  Package,
  RefreshCw,
  AlertCircle,
  Plus,
  Eye,
  Trash2,
  Check,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import Header from "@/components/header"
import Footer from '@/components/footer'

interface SubscriptionPlan {
  id: string
  name: string
  price: string
  description: string
  duration_days: number
  max_products: number
  refresh_interval: number
}

interface UserSubscription {
  id: string
  starts_at: string
  ends_at: string
  is_active: boolean
  plan: SubscriptionPlan
  products: FeaturedProduct[]
}

interface FeaturedProduct {
  id: string
  name: string
  price: string
  images: ProductImage[]
  is_featured: number
  featured_at?: string
}

interface ProductImage {
  id: string
  url: string
}

interface UserProduct {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  price: string
  wholesale_price: string
  is_featured: boolean
  featured_expires_at: string | null
  average_rating: number
  images: ProductImage[]
  created_at: string
  updated_at: string
}

interface ApiResponse<T> {
  data: T[]
  links?: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta?: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

interface FeatureProductDetailClientProps {
  subscriptionId: string
}

export default function FeatureProductDetailClient({ subscriptionId }: FeatureProductDetailClientProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [userProducts, setUserProducts] = useState<UserProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddProductsDialog, setShowAddProductsDialog] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [addingProducts, setAddingProducts] = useState(false)
  const [removingProductId, setRemovingProductId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchSubscriptionData()
    fetchUserProducts()
  }, [subscriptionId])

  const fetchSubscriptionData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("auth_token")
      
      const response = await fetch(`https://api.strapre.com/api/v1/featured-subscriptions/${subscriptionId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError("Subscription not found")
          return
        }
        if (response.status === 403) {
          setError("You don't have access to this subscription")
          return
        }
        throw new Error(`Failed to fetch subscription: ${response.status}`)
      }

      const data = await response.json()
      setSubscription(data.data)
      setFeaturedProducts(data.data.products || [])
    } catch (error) {
      console.error("Error fetching subscription details:", error)
      setError("Failed to load subscription details")
    } finally {
      setLoading(false)
    }
  }

  const refreshSubscriptionData = async () => {
    setRefreshing(true)
    try {
      const token = localStorage.getItem("auth_token")
      
      const response = await fetch(`https://api.strapre.com/api/v1/featured-subscriptions/${subscriptionId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSubscription(data.data)
        setFeaturedProducts(data.data.products || [])
      }
    } catch (error) {
      console.error("Error refreshing subscription data:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const fetchUserProducts = async () => {
    setLoadingProducts(true)
    try {
      const token = localStorage.getItem("auth_token")
      
      const response = await fetch("https://api.strapre.com/api/v1/my-products", {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data: ApiResponse<UserProduct> = await response.json()
        setUserProducts(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching user products:", error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleAddProducts = async () => {
    if (selectedProductIds.length === 0) return

    setAddingProducts(true)
    try {
      const token = localStorage.getItem("auth_token")
      
      const response = await fetch("https://api.strapre.com/api/v1/featured-subscriptions/add-products", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          product_ids: selectedProductIds,
        }),
      })

      if (response.ok) {
        // Refresh subscription data to get updated products list
        await refreshSubscriptionData()
        setShowAddProductsDialog(false)
        setSelectedProductIds([])
      } else {
        console.error("Failed to add products to subscription")
      }
    } catch (error) {
      console.error("Error adding products to subscription:", error)
    } finally {
      setAddingProducts(false)
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    setRemovingProductId(productId)
    try {
      const token = localStorage.getItem("auth_token")
      
      const response = await fetch("https://api.strapre.com/api/v1/featured-subscriptions/remove-products", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          product_ids: [productId],
        }),
      })

      if (response.ok) {
        // Remove product from local state immediately for better UX
        setFeaturedProducts(prev => prev.filter(p => p.id !== productId))
        // Optionally refresh data from server
        await refreshSubscriptionData()
      } else {
        console.error("Failed to remove product from subscription")
      }
    } catch (error) {
      console.error("Error removing product from subscription:", error)
    } finally {
      setRemovingProductId(null)
    }
  }

  const getAvailableProducts = () => {
    const featuredProductIds = featuredProducts.map(p => p.id)
    return userProducts.filter(product => !featuredProductIds.includes(product.id))
  }

  const handleProductSelection = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds(prev => [...prev, productId])
    } else {
      setSelectedProductIds(prev => prev.filter(id => id !== productId))
    }
  }

  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price)
    return `₦${numPrice.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysRemaining = () => {
    if (!subscription) return 0
    const endDate = new Date(subscription.ends_at)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getProgressPercentage = () => {
    if (!subscription) return 0
    const startDate = new Date(subscription.starts_at)
    const endDate = new Date(subscription.ends_at)
    const now = new Date()
    
    const totalDuration = endDate.getTime() - startDate.getTime()
    const elapsed = now.getTime() - startDate.getTime()
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
  }

  const handleSearch = () => {
    console.log("Searching for:", searchQuery)
  }

  const handleStateChange = () => {}
  const handleLGAChange = () => {}

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          showStateSelectors={false}
          selectedState={null}
          selectedLGA={null}
          onStateChange={handleStateChange}
          onLGAChange={handleLGAChange}
        />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB0207] border-t-transparent"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !subscription) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          showStateSelectors={false}
          selectedState={null}
          selectedLGA={null}
          onStateChange={handleStateChange}
          onLGAChange={handleLGAChange}
        />
        <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/feature-product" className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subscriptions
          </Link>
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {error || "Subscription Not Found"}
              </h1>
              <p className="text-gray-600 mb-6">
                {error === "Subscription not found" 
                  ? "The subscription you're looking for doesn't exist."
                  : error === "You don't have access to this subscription"
                  ? "You don't have permission to view this subscription."
                  : "Unable to load subscription details. Please try again."}
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={fetchSubscriptionData}
                  className="w-full bg-[#CB0207] hover:bg-[#A50206] text-white py-3 rounded-xl"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Link href="/feature-product" className="block">
                  <Button variant="outline" className="w-full py-3 rounded-xl">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Subscriptions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isExpired = new Date(subscription.ends_at) < new Date()
  const isActive = subscription.is_active && !isExpired
  const daysRemaining = getDaysRemaining()
  const progressPercentage = getProgressPercentage()
  const usedSlots = featuredProducts.length
  const remainingSlots = Math.max(0, subscription.plan.max_products - usedSlots)
  const availableProducts = getAvailableProducts()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        showStateSelectors={false}
        selectedState={null}
        selectedLGA={null}
        onStateChange={handleStateChange}
        onLGAChange={handleLGAChange}
      />

      {/* Main Content */}
      <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Link href="/feature-product" className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subscriptions
        </Link>

        {/* Subscription Overview */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <Crown className="h-8 w-8 text-yellow-500" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{subscription.plan.name}</h1>
                  <p className="text-gray-600 text-lg">{subscription.plan.description}</p>
                </div>
                <Badge 
                  className={`text-sm px-3 py-1 font-medium ${
                    isActive 
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}
                >
                  {isActive ? 'Active' : 'Expired'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Max Products</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-800">
                    {subscription.plan.max_products}
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Used Slots</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800">
                    {usedSlots}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Refresh Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-800">
                    {subscription.plan.refresh_interval}h
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Days Left</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-800">
                    {daysRemaining}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subscription Progress</span>
                  <span className="text-gray-600">{Math.round(progressPercentage)}% completed</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Started: {formatDate(subscription.starts_at)}</span>
                  <span>Expires: {formatDate(subscription.ends_at)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#CB0207]/10 to-[#CB0207]/5 rounded-2xl p-6 min-w-[250px]">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#CB0207] mb-2">
                  {formatPrice(subscription.plan.price)}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  for {subscription.plan.duration_days} days
                </div>
                <div className="text-lg font-semibold text-gray-800">
                  {remainingSlots} slots remaining
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {!isActive && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              This subscription has expired. You can no longer feature products with this plan.
              <Link href="/feature-product" className="ml-2 text-red-700 underline hover:text-red-900">
                Subscribe to a new plan
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Featured Products */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Star className="h-7 w-7 text-[#CB0207] mr-3" />
              Featured Products ({featuredProducts.length})
            </h2>
            <div className="flex gap-3">
              <Button
                onClick={refreshSubscriptionData}
                disabled={refreshing}
                variant="outline"
                className="px-4 py-2 rounded-xl"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              {isActive && remainingSlots > 0 && availableProducts.length > 0 && (
                <Button
                  onClick={() => setShowAddProductsDialog(true)}
                  className="bg-[#CB0207] hover:bg-[#A50206] text-white px-6 py-3 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Products ({availableProducts.length} available)
                </Button>
              )}
            </div>
          </div>

          {loading || refreshing ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB0207] border-t-transparent"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0].url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=200&width=200"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-[#CB0207] text-white">
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-800">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg text-[#CB0207]">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    {product.featured_at && (
                      <div className="text-xs text-gray-500 mb-3">
                        Featured: {formatDate(product.featured_at)}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link href={`/products/${product.slug || product.id}`} className="flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full rounded-lg"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                      {isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveProduct(product.id)}
                          disabled={removingProductId === product.id}
                          className="flex-1 rounded-lg text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {removingProductId === product.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3 mr-1" />
                          )}
                          {removingProductId === product.id ? 'Removing...' : 'Remove'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Featured Products Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start featuring your products to boost their visibility and increase sales.
              </p>
              {isActive && (
                <Button
                  onClick={() => setShowAddProductsDialog(true)}
                  className="bg-[#CB0207] hover:bg-[#A50206] text-white px-6 py-3 rounded-xl"
                  disabled={availableProducts.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {availableProducts.length === 0 ? 'No Products Available' : 'Add Products'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Products Dialog */}
      <Dialog open={showAddProductsDialog} onOpenChange={setShowAddProductsDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 text-[#CB0207] mr-2" />
              Add Products to Subscription
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Available Slots: {remainingSlots} of {subscription?.plan.max_products}
                  </p>
                  <p className="text-xs text-blue-600">
                    You can add up to {Math.min(remainingSlots, availableProducts.length)} more products
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-800">
                    Selected: {selectedProductIds.length}
                  </p>
                </div>
              </div>
            </div>

            {loadingProducts ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#CB0207] border-t-transparent"></div>
              </div>
            ) : availableProducts.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`border rounded-xl p-4 transition-all cursor-pointer ${
                        selectedProductIds.includes(product.id)
                          ? 'border-[#CB0207] bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        const isSelected = selectedProductIds.includes(product.id)
                        const canSelect = selectedProductIds.length < remainingSlots
                        
                        if (isSelected || canSelect) {
                          handleProductSelection(product.id, !isSelected)
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          disabled={!selectedProductIds.includes(product.id) && selectedProductIds.length >= remainingSlots}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {product.images.length > 0 && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image
                                  src={product.images[0].url}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=48&width=48"
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-800 line-clamp-2">
                                {product.name}
                              </h4>
                              <p className="text-sm font-bold text-[#CB0207]">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Available Products
                </h3>
                <p className="text-gray-600">
                  All your products are already featured in this subscription or you don't have any products yet.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                onClick={() => {
                  setShowAddProductsDialog(false)
                  setSelectedProductIds([])
                }}
                variant="outline"
                className="px-6 py-2 rounded-xl"
                disabled={addingProducts}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddProducts}
                disabled={selectedProductIds.length === 0 || addingProducts}
                className="bg-[#CB0207] hover:bg-[#A50206] text-white px-6 py-2 rounded-xl"
              >
                {addingProducts ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Products...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Add {selectedProductIds.length} Product{selectedProductIds.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}