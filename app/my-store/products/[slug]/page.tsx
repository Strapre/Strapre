"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Edit, Trash2, Calendar, Package, Tag, DollarSign, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Header from "@/components/header"
import Footer from '@/components/footer'

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string
  profile_picture?: string
  state_id?: string
  lga_id?: string
}

interface ProductImage {
  id: string
  url: string
}

interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  price: string
  wholesale_price: string
  is_featured: number
  images: ProductImage[]
  created_at: string
}

interface ProductResponse {
  data: Product
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    // Check if user has auth token
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load existing profile data from userDetails
    loadProfileData()

    // Fetch product data
    if (slug) {
      fetchProduct(slug)
    }
  }, [router, slug])

  const loadProfileData = () => {
    try {
      const userDetailsStr = localStorage.getItem("userDetails")
      if (userDetailsStr) {
        const userDetails: UserProfile = JSON.parse(userDetailsStr)
        setUserProfile(userDetails)
      }
    } catch (error) {
      console.error("Error loading user details:", error)
    }
  }

  const fetchProduct = async (productSlug: string) => {
    setLoading(true)
    const token = localStorage.getItem("auth_token")

    try {
      console.log("=== FETCHING PRODUCT DATA ===")
      console.log("Token:", token)
      console.log("Endpoint:", `https://api.strapre.com/api/v1/products/${productSlug}`)

      const response = await fetch(`https://api.strapre.com/api/v1/products/${productSlug}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const responseData: ProductResponse = await response.json()

      console.log("=== PRODUCT DATA RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response Data:", responseData)

      if (response.ok) {
        setProduct(responseData.data)
      } else {
        setError(responseData.message || "Failed to load product data")
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!product) return

    setDeleting(true)
    const token = localStorage.getItem("auth_token")

    try {
      console.log("=== DELETING PRODUCT ===")
      console.log("Token:", token)
      console.log("Endpoint:", `https://api.strapre.com/api/v1/products/${product.slug}`)

      const response = await fetch(`https://api.strapre.com/api/v1/products/${product.slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      console.log("=== DELETE PRODUCT RESPONSE ===")
      console.log("Status:", response.status)

      if (response.ok) {
        setSuccess("Product deleted successfully!")
        // Redirect after success
        setTimeout(() => {
          router.push("/my-store/products")
        }, 1500)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete product")
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Network error. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(Number.parseFloat(price))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleBackToProducts = () => {
    router.push("/my-store/products")
  }

  const handleEditProduct = () => {
    router.push(`/my-store/products/${product?.slug}/edit`)
  }

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const handleStateChange = () => {
    // Not needed for this page
  }

  const handleLGAChange = () => {
    // Not needed for this page
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CB0207] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={handleBackToProducts} className="bg-[#CB0207] hover:bg-[#A50206] text-white">
            Back to Products
          </Button>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={handleBackToProducts}
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Products</span>
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6 rounded-lg">
            <AlertDescription className="text-red-600 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 mb-6 rounded-lg">
            <AlertDescription className="text-green-600 font-medium">{success}</AlertDescription>
          </Alert>
        )}

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImageIndex]?.url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-[#CB0207] ring-2 ring-[#CB0207]/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                {product.is_featured === 1 && (
                  <Badge className="bg-[#CB0207] text-white font-bold px-3 py-1">Featured</Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <span className="text-lg text-blue-600 font-semibold">
                    Vendor: {formatPrice(product.wholesale_price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(product.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleEditProduct}
                className="flex-1 bg-[#CB0207] hover:bg-[#A50206] text-white flex items-center justify-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Product</span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 bg-transparent flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Product</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{product.name}"? This action cannot be undone and will
                      permanently remove the product from your store.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteProduct}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deleting ? "Deleting..." : "Delete Product"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
