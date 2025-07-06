"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Search,
  Heart,
  User,
  Menu,
  ChevronDown,
  ChevronRight,
  LogOut,
  Edit,
  Trash2,
  Calendar,
  Package,
  Tag,
  DollarSign,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import Link from "next/link"

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

interface Category {
  id: string
  name: string
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
  const [categories] = useState<Category[]>([
    { id: "1", name: "Electronics" },
    { id: "2", name: "Fashion" },
    { id: "3", name: "Home & Garden" },
    { id: "4", name: "Sports" },
    { id: "5", name: "Books" },
  ])
  const [userStore] = useState(true)
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
      console.log("Endpoint:", `https://ga.vplaza.com.ng/api/v1/products/${productSlug}`)

      const response = await fetch(`https://ga.vplaza.com.ng/api/v1/products/${productSlug}`, {
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
      console.log("Endpoint:", `https://ga.vplaza.com.ng/api/v1/products/${product.slug}`)

      const response = await fetch(`https://ga.vplaza.com.ng/api/v1/products/${product.slug}`, {
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

  const getUserInitials = () => {
    if (!userProfile) return "U"
    return `${userProfile.first_name?.[0] || ""}${userProfile.last_name?.[0] || ""}`.toUpperCase()
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

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("userDetails")
    localStorage.removeItem("userStore")
    router.push("/login")
  }

  const handleBackToProducts = () => {
    router.push("/my-store/products")
  }

  const handleEditProduct = () => {
    router.push(`/my-store/products/${product?.slug}/edit`)
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-xl">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-white overflow-y-auto">
                  <div className="py-6 h-full flex flex-col">
                    {/* User Profile Section */}
                    {userProfile && (
                      <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200 flex-shrink-0">
                        <Avatar className="h-14 w-14 ring-2 ring-[#CB0207]/20">
                          <AvatarImage
                            src={userProfile.profile_picture || ""}
                            alt={`${userProfile.first_name} ${userProfile.last_name}`}
                          />
                          <AvatarFallback className="bg-[#CB0207] text-white font-bold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-gray-800">{`${userProfile.first_name} ${userProfile.last_name}`}</h3>
                          <p className="text-sm text-gray-500">{userProfile.email}</p>
                        </div>
                      </div>
                    )}
                    <h3 className="font-bold text-xl mb-6 text-gray-800">All Categories</h3>
                    <div className="space-y-1 mb-8">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.id}`}
                          className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200 group"
                        >
                          <span className="text-sm font-medium truncate pr-2 flex-1 group-hover:text-[#CB0207]">
                            {category.name}
                          </span>
                          <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-[#CB0207]" />
                        </Link>
                      ))}
                    </div>
                    <div className="space-y-3 mb-8">
                      <div className="py-3 px-4 text-sm cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium">
                        🔔 Notifications
                      </div>
                      <div className="py-3 px-4 text-sm cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium">
                        💬 Message Support
                      </div>
                      <div className="py-3 px-4 text-sm cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-200 flex items-center font-medium">
                        <User className="h-4 w-4 mr-2" />
                        Settings
                      </div>
                    </div>
                    <Button
                      className={`w-full ${
                        userStore ? "bg-green-600 hover:bg-green-700" : "bg-[#CB0207] hover:bg-[#A50206]"
                      } text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      {userStore ? "View My Store" : "Become a Merchant"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            {/* Logo */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
                  <img src="/strapre-logo.jpg" alt="Strapre Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-[#CB0207] font-bold text-xl">Strapre</span>
              </div>
            </div>
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 rounded-2xl border-2 border-gray-200 focus:border-[#CB0207] focus:ring-2 focus:ring-[#CB0207]/20 transition-all duration-300 h-12"
                />
                <Button
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl bg-[#CB0207] hover:bg-[#A50206] text-white h-8 w-8"
                  variant="ghost"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-xl">
                <Heart className="h-5 w-5" />
              </Button>
              {userProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-3 hover:bg-gray-100 rounded-xl px-3 py-2"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-[#CB0207]/20">
                        <AvatarImage src={userProfile.profile_picture || ""} />
                        <AvatarFallback className="bg-[#CB0207] text-white font-bold text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">{`${userProfile.first_name} ${userProfile.last_name}`}</p>
                        <p className="text-xs text-gray-500">{userProfile.email}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-0">
                    <DropdownMenuItem className="rounded-lg">
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span className="h-4 w-4 mr-2">S</span>
                      {userStore ? "View My Store" : "Become a Merchant"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {/* Mobile User Avatar */}
            <div className="md:hidden">
              {userProfile && (
                <Avatar className="h-8 w-8 ring-2 ring-[#CB0207]/20">
                  <AvatarImage src={userProfile.profile_picture || ""} />
                  <AvatarFallback className="bg-[#CB0207] text-white font-bold text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 rounded-2xl border-2 border-gray-200 focus:border-[#CB0207] focus:ring-2 focus:ring-[#CB0207]/20 transition-all duration-300"
              />
              <Button
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl bg-[#CB0207] hover:bg-[#A50206] text-white h-8 w-8"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

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
      <footer className="bg-red-900 text-white mt-16 hidden lg:block w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Buy</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Create account
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Bid
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Gift cards
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Sell</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Become a seller
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Auction
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Store
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Logistics</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Local
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Cross boarder
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Customer Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Contact us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-red-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-300">© 2025 Strapre. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
