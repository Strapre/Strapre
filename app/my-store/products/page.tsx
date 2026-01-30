<<<<<<< HEAD
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit, Trash2, Calendar, ChevronLeft, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import Footer from '@/components/footer'
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  featured_expires_at: string | null
  images: ProductImage[]
  created_at: string
  updated_at: string
}

interface ProductsResponse {
  data: Product[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

interface Category {
  id: string
  name: string
}

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<ProductsResponse["meta"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [categories] = useState<Category[]>([
    { id: "1", name: "Electronics" },
    { id: "2", name: "Fashion" },
    { id: "3", name: "Home & Garden" },
    { id: "4", name: "Sports" },
    { id: "5", name: "Books" },
  ])
  const [userStore] = useState(true)
  const router = useRouter()
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    product: Product | null
  }>({
    isOpen: false,
    product: null,
  })

  useEffect(() => {
    // Check if user has auth token
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load existing profile data from userDetails
    loadProfileData()
    // Fetch products data
    fetchProducts(currentPage)
  }, [router, currentPage])

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

  const fetchProducts = async (page = 1) => {
    setLoading(true)
    const token = localStorage.getItem("auth_token")

    try {
      console.log("=== FETCHING PRODUCTS DATA ===")
      console.log("Token:", token)
      console.log("Endpoint:", `https://api.strapre.com/api/v1/my-products?page=${page}`)

      const response = await fetch(`https://api.strapre.com/api/v1/my-products?page=${page}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const responseData: ProductsResponse = await response.json()

      console.log("=== PRODUCTS DATA RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response Data:", responseData)

      if (response.ok) {
        setProducts(responseData.data)
        setPagination(responseData.meta)
      } else {
        setError(responseData.message || "Failed to load products data")
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
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
      month: "short",
      day: "numeric",
    })
  }

  const handleBackToStore = () => {
    router.push("/my-store")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRunAd = (productId: string) => {
    // TODO: Implement run ad functionality
    router.push(`/feature-product`)    
    console.log("Running ad for product:", productId)
  }

  const handleEditProduct = (productId: string, productSlug: string) => {
    router.push(`/my-store/products/${productSlug}/edit`)
  }

  const handleDeleteProduct = async (product: Product) => {
    const token = localStorage.getItem("auth_token")
    try {
      const response = await fetch(`https://api.strapre.com/api/v1/products/${product.slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        // Remove the product from the local state
        setProducts(products.filter((p) => p.id !== product.id))
        // Update pagination if needed
        if (pagination) {
          setPagination({
            ...pagination,
            total: pagination.total - 1,
          })
        }
        // Close the dialog
        setDeleteDialog({ isOpen: false, product: null })
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete product")
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Network error. Please try again.")
    }
  }

  const openDeleteDialog = (product: Product) => {
    setDeleteDialog({ isOpen: true, product })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, product: null })
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery)
    }
  }

  const handleStateChange = (stateId: string) => {
    // This page doesn't need state selection functionality
    console.log("State changed:", stateId)
  }

  const handleLGAChange = (lgaId: string) => {
    // This page doesn't need LGA selection functionality
    console.log("LGA changed:", lgaId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CB0207] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Header */}
        <div className="mb-8">
          <Button
            onClick={handleBackToStore}
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-0 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Store</span>
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Products</h1>
              <p className="text-gray-600">
                {pagination ? `${pagination.total} products found` : "Loading products..."}
              </p>
            </div>
            <Button
              className="mt-4 sm:mt-0 bg-[#CB0207] hover:bg-[#A50206] text-white flex items-center space-x-2"
              onClick={() => router.push('/my-store/products/create')}
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6 rounded-lg">
            <AlertDescription className="text-red-600 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-8">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0].url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    {/* Featured Badge */}
                    {product.is_featured === 1 && (
                      <Badge className="absolute top-2 right-2 bg-[#CB0207] text-white font-bold px-2 py-1 text-xs">
                        Ad
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="mb-2 sm:mb-3">
                      <Link href={`/my-store/products/${product.slug}`}>
                        <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 mb-1 line-clamp-2 leading-tight hover:text-[#CB0207] transition-colors cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="truncate">Posted {formatDate(product.created_at)}</span>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        size="sm"
                        className="bg-[#CB0207] hover:bg-[#A50206] text-white flex-1 text-xs sm:text-sm py-2"
                        onClick={() => handleEditProduct(product.id, product.slug)}
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Edit
                      </Button>
                      {product.is_featured === 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 flex-1 bg-transparent text-xs sm:text-sm py-2"
                          onClick={() => handleRunAd(product.id)}
                        >
                          Run Ad
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-700 hover:bg-green-50 flex-1 bg-transparent text-xs sm:text-sm py-2"
                          disabled
                        >
                          Ad Running
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent sm:flex-none"
                        onClick={() => openDeleteDialog(product)}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-transparent w-full sm:w-auto"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1 overflow-x-auto max-w-full">
                  {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => {
                    let page
                    if (pagination.last_page <= 5) {
                      page = i + 1
                    } else if (currentPage <= 3) {
                      page = i + 1
                    } else if (currentPage >= pagination.last_page - 2) {
                      page = pagination.last_page - 4 + i
                    } else {
                      page = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={
                          currentPage === page
                            ? "bg-[#CB0207] hover:bg-[#A50206] text-white min-w-[2.5rem]"
                            : "bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 min-w-[2.5rem]"
                        }
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                  className="bg-transparent w-full sm:w-auto"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                Start by adding your first product to your store
              </p>

            </div>
          )
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.product?.name}"? This action cannot be undone and will
              permanently remove the product from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.product && handleDeleteProduct(deleteDialog.product)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <Footer />
    </div>
  )
}
=======
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit, Trash2, Calendar, ChevronLeft, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import Footer from '@/components/footer'
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  featured_expires_at: string | null
  images: ProductImage[]
  created_at: string
  updated_at: string
}

interface ProductsResponse {
  data: Product[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

interface Category {
  id: string
  name: string
}

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<ProductsResponse["meta"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [categories] = useState<Category[]>([
    { id: "1", name: "Electronics" },
    { id: "2", name: "Fashion" },
    { id: "3", name: "Home & Garden" },
    { id: "4", name: "Sports" },
    { id: "5", name: "Books" },
  ])
  const [userStore] = useState(true)
  const router = useRouter()
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    product: Product | null
  }>({
    isOpen: false,
    product: null,
  })

  useEffect(() => {
    // Check if user has auth token
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load existing profile data from userDetails
    loadProfileData()
    // Fetch products data
    fetchProducts(currentPage)
  }, [router, currentPage])

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

  const fetchProducts = async (page = 1) => {
    setLoading(true)
    const token = localStorage.getItem("auth_token")

    try {
      console.log("=== FETCHING PRODUCTS DATA ===")
      console.log("Token:", token)
      console.log("Endpoint:", `https://api.strapre.com/api/v1/my-products?page=${page}`)

      const response = await fetch(`https://api.strapre.com/api/v1/my-products?page=${page}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const responseData: ProductsResponse = await response.json()

      console.log("=== PRODUCTS DATA RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response Data:", responseData)

      if (response.ok) {
        setProducts(responseData.data)
        setPagination(responseData.meta)
      } else {
        setError(responseData.message || "Failed to load products data")
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
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
      month: "short",
      day: "numeric",
    })
  }

  const handleBackToStore = () => {
    router.push("/my-store")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRunAd = (productId: string) => {
    // TODO: Implement run ad functionality
    router.push(`/feature-product`)    
    console.log("Running ad for product:", productId)
  }

  const handleEditProduct = (productId: string, productSlug: string) => {
    router.push(`/my-store/products/${productSlug}/edit`)
  }

  const handleDeleteProduct = async (product: Product) => {
    const token = localStorage.getItem("auth_token")
    try {
      const response = await fetch(`https://api.strapre.com/api/v1/products/${product.slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        // Remove the product from the local state
        setProducts(products.filter((p) => p.id !== product.id))
        // Update pagination if needed
        if (pagination) {
          setPagination({
            ...pagination,
            total: pagination.total - 1,
          })
        }
        // Close the dialog
        setDeleteDialog({ isOpen: false, product: null })
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete product")
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Network error. Please try again.")
    }
  }

  const openDeleteDialog = (product: Product) => {
    setDeleteDialog({ isOpen: true, product })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, product: null })
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery)
    }
  }

  const handleStateChange = (stateId: string) => {
    // This page doesn't need state selection functionality
    console.log("State changed:", stateId)
  }

  const handleLGAChange = (lgaId: string) => {
    // This page doesn't need LGA selection functionality
    console.log("LGA changed:", lgaId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CB0207] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Header */}
        <div className="mb-8">
          <Button
            onClick={handleBackToStore}
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-0 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Store</span>
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Products</h1>
              <p className="text-gray-600">
                {pagination ? `${pagination.total} products found` : "Loading products..."}
              </p>
            </div>
            <Button
              className="mt-4 sm:mt-0 bg-[#CB0207] hover:bg-[#A50206] text-white flex items-center space-x-2"
              onClick={() => router.push('/my-store/products/create')}
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6 rounded-lg">
            <AlertDescription className="text-red-600 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-8">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0].url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    {/* Featured Badge */}
                    {product.is_featured === 1 && (
                      <Badge className="absolute top-2 right-2 bg-[#CB0207] text-white font-bold px-2 py-1 text-xs">
                        Ad
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="mb-2 sm:mb-3">
                      <Link href={`/my-store/products/${product.slug}`}>
                        <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 mb-1 line-clamp-2 leading-tight hover:text-[#CB0207] transition-colors cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="truncate">Posted {formatDate(product.created_at)}</span>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        size="sm"
                        className="bg-[#CB0207] hover:bg-[#A50206] text-white flex-1 text-xs sm:text-sm py-2"
                        onClick={() => handleEditProduct(product.id, product.slug)}
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Edit
                      </Button>
                      {product.is_featured === 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 flex-1 bg-transparent text-xs sm:text-sm py-2"
                          onClick={() => handleRunAd(product.id)}
                        >
                          Run Ad
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-700 hover:bg-green-50 flex-1 bg-transparent text-xs sm:text-sm py-2"
                          disabled
                        >
                          Ad Running
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent sm:flex-none"
                        onClick={() => openDeleteDialog(product)}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-transparent w-full sm:w-auto"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1 overflow-x-auto max-w-full">
                  {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => {
                    let page
                    if (pagination.last_page <= 5) {
                      page = i + 1
                    } else if (currentPage <= 3) {
                      page = i + 1
                    } else if (currentPage >= pagination.last_page - 2) {
                      page = pagination.last_page - 4 + i
                    } else {
                      page = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={
                          currentPage === page
                            ? "bg-[#CB0207] hover:bg-[#A50206] text-white min-w-[2.5rem]"
                            : "bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 min-w-[2.5rem]"
                        }
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                  className="bg-transparent w-full sm:w-auto"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                Start by adding your first product to your store
              </p>

            </div>
          )
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.product?.name}"? This action cannot be undone and will
              permanently remove the product from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.product && handleDeleteProduct(deleteDialog.product)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <Footer />
    </div>
  )
}
>>>>>>> 533c22393c774a56ed1968293eb2ddaf3c4ec728
