"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, BarChart3, Eye, Heart, Star, Clock, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import Footer from '@/components/footer'
import { useRouter } from "next/navigation"

interface ProductImage {
  id: string
  url: string
}

interface FeaturedProduct {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  price: string
  wholesale_price: string
  is_featured: number
  featured_expires_at: string
  average_rating: number
  images: ProductImage[]
  created_at: string
  updated_at: string
  view_count: number
  wishlist_count: number
}

export default function AdInsightsPage() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("https://api.strapre.com/api/v1/my-featured", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data: { data: FeaturedProduct[] } = await response.json()
        setFeaturedProducts(data.data)
      }
    } catch (error) {
      console.error("Error fetching featured products:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price)
    return `₦${numPrice.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (expiryDate: string) => {
    const daysRemaining = getDaysRemaining(expiryDate)
    if (daysRemaining <= 0) return "bg-red-100 text-red-800"
    if (daysRemaining <= 3) return "bg-orange-100 text-orange-800"
    if (daysRemaining <= 7) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusText = (expiryDate: string) => {
    const daysRemaining = getDaysRemaining(expiryDate)
    if (daysRemaining <= 0) return "Expired"
    if (daysRemaining === 1) return "1 day left"
    return `${daysRemaining} days left`
  }

  const handleSearch = () => {
    console.log("Searching for:", searchQuery)
  }

  const handleStateChange = () => {
    // Placeholder function
  }

  const handleLGAChange = () => {
    // Placeholder function
  }

  const filteredProducts = featuredProducts.filter((product) =>
    searchQuery === "" ? true : product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalViews = featuredProducts.reduce((sum, product) => sum + product.view_count, 0)
  const totalWishlists = featuredProducts.reduce((sum, product) => sum + product.wishlist_count, 0)
  const averageRating = featuredProducts.length > 0 
    ? featuredProducts.reduce((sum, product) => sum + product.average_rating, 0) / featuredProducts.length 
    : 0

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
        <Link href="/my-store" className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Store
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <BarChart3 className="h-8 w-8 text-[#CB0207] mr-3" />
                Ad Insights
              </h1>
              <p className="text-gray-600">
                Monitor the performance of your featured products and track engagement metrics
              </p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        {featuredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-[#CB0207]" />
                  Featured Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{featuredProducts.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-blue-600" />
                  Total Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{totalViews.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  Total Wishlists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{totalWishlists.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{averageRating.toFixed(1)}/5</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Featured Products Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {featuredProducts.length === 0 ? "No featured products" : "No products found"}
              </h3>
              <p className="text-gray-600 mb-6">
                {featuredProducts.length === 0
                  ? "You don't have any featured products yet. Feature some products to see insights here."
                  : "Try searching with different keywords to find your featured products."}
              </p>
              {featuredProducts.length === 0 && (
                <Link href="/feature-product">
                  <Button className="bg-[#CB0207] hover:bg-[#A50206] text-white px-6 py-3 rounded-xl">
                    Feature Products
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md"
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                    {product.images.length > 0 ? (
                      <Image
                        src={product.images[0].url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                    <Badge className="absolute top-2 left-2 bg-[#CB0207] text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                    <Badge className={`absolute top-2 right-2 ${getStatusColor(product.featured_expires_at)}`}>
                      {getStatusText(product.featured_expires_at)}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-gray-800">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-xl text-[#CB0207]">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">{product.average_rating}/5</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Eye className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-gray-800">{product.view_count}</div>
                        <div className="text-xs text-gray-600">Views</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
                        <div className="text-lg font-bold text-gray-800">{product.wishlist_count}</div>
                        <div className="text-xs text-gray-600">Wishlists</div>
                      </div>
                    </div>

                    {/* Expiry Info */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Featured until: {formatDate(product.featured_expires_at)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Created: {formatDateTime(product.created_at)}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link href={`/product/${product.slug}`}>
                      <Button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-xl font-semibold transition-all duration-200">
                        View Product
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}