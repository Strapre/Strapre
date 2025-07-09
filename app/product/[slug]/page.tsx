"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, Phone, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Header from "@/components/header"

interface ProductImage {
  id: string
  url: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface State {
  id: string
  name: string
  slug: string
}

interface LGA {
  id: string
  name: string
  slug: string
  state_id: string
}

interface ProductStore {
  id: string
  name: string
  slug: string
  store_lga: string
  store_state: string
  phone_number: string
}

interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  specifications: string[]
  brand: string
  price: string
  wholesale_price: string
  images: ProductImage[]
  store: ProductStore
  created_at: string
}

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  profile_picture: string | null
}

interface UserStore {
  id: string
  user_id: string
  store_name: string
  slug: string
  store_description: string
  store_image: string
  phone: string
  email: string
  state_id: string
  lga_id: string
  address: string
  subscription_expires_at: string
  is_active: number
  created_at: string
  updated_at: string
}

interface ApiResponse<T = any> {
  data: T
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [states, setStates] = useState<State[]>([])
  const [lgas, setLgas] = useState<LGA[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStore, setUserStore] = useState<UserStore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMerchant, setIsMerchant] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [selectedLGA, setSelectedLGA] = useState<LGA | null>(null)
  
  // Touch/swipe related states
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  
  // Wishlist states
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [wishlistLoading, setWishlistLoading] = useState<string[]>([])

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Check authentication and fetch initial data
  useEffect(() => {
    // Check authentication
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    const userStoreData = typeof window !== "undefined" ? localStorage.getItem("userStore") : null

    setIsAuthenticated(!!token)
    setIsMerchant(!!userStoreData)

    // Fetch initial data
    fetchCategories()
    fetchStates()

    // Fetch user data if authenticated
    if (token) {
      fetchUserProfile(token)
      fetchUserStore(token)
      fetchWishlist(token)
    }

    // Fetch product data
    if (params.slug) {
      fetchProduct(params.slug as string)
    }
  }, [params.slug])

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/categories")
      if (response.ok) {
        const data: ApiResponse<Category[]> = await response.json()
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchUserStore = async (token: string) => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/mystore", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUserStore(data)
        setIsMerchant(true)

        // Store in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("userStore", JSON.stringify(data))
        }
      }
    } catch (error) {
      console.error("Error fetching user store:", error)
    }
  }

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/auth/get-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setUserProfile(data.data)

        // Store in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("userDetails", JSON.stringify(data.data))
        }

        // Check if profile is incomplete (first_name is null)
        if (!data.data.first_name) {
          router.push("/complete-profile")
          return
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchStates = async () => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/states")
      if (response.ok) {
        const data: ApiResponse<State[]> = await response.json()
        // Sort states alphabetically by name
        const sortedStates = data.data.sort((a, b) => a.name.localeCompare(b.name))
        setStates(sortedStates)
      }
    } catch (error) {
      console.error("Error fetching states:", error)
    }
  }

  const fetchLGAs = async (stateSlug: string) => {
    try {
      const response = await fetch(`https://ga.vplaza.com.ng/api/v1/states/${stateSlug}/lgas`)
      if (response.ok) {
        const data: ApiResponse<LGA[]> = await response.json()
        // Sort LGAs alphabetically by name
        const sortedLGAs = data.data.sort((a, b) => a.name.localeCompare(b.name))
        setLgas(sortedLGAs)
      }
    } catch (error) {
      console.error("Error fetching LGAs:", error)
    }
  }

  const fetchProduct = async (slug: string) => {
    setLoading(true)
    try {
      const response = await fetch(`https://ga.vplaza.com.ng/api/v1/products/${slug}`)
      if (response.ok) {
        const data: ApiResponse<Product> = await response.json()
        setProduct(data.data)
      } else {
        setError("Product not found")
      }
    } catch (error) {
      setError("Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlist = async (token: string) => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Assuming the API returns an array of wishlist items with product_id
        const productIds = data.data?.map((item: any) => item.product_id) || []
        setWishlistItems(productIds)
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    }
  }

  const addToWishlist = async (productId: string) => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      setShowLoginDialog(true)
      return
    }

    setWishlistLoading((prev) => [...prev, productId])
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/wishlist", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: productId }),
      })
      if (response.ok) {
        setWishlistItems((prev) => [...prev, productId])
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
    } finally {
      setWishlistLoading((prev) => prev.filter((id) => id !== productId))
    }
  }

  const removeFromWishlist = async (productId: string) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    setWishlistLoading((prev) => [...prev, productId])
    try {
      const response = await fetch(`https://ga.vplaza.com.ng/api/v1/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        setWishlistItems((prev) => prev.filter((id) => id !== productId))
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    } finally {
      setWishlistLoading((prev) => prev.filter((id) => id !== productId))
    }
  }

  const toggleWishlist = () => {
    if (!product) return
    
    const isInWishlist = wishlistItems.includes(product.id)
    if (isInWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product.id)
    }
  }

  const handleStateChange = (stateId: string) => {
    if (stateId === "defaultState") {
      setSelectedState(null)
      setSelectedLGA(null)
      setLgas([])
      return
    }

    const state = states.find((s) => s.id === stateId)
    if (state) {
      setSelectedState(state)
      setSelectedLGA(null)
      fetchLGAs(state.slug)
    }
  }

  const handleLGAChange = (lgaId: string) => {
    if (lgaId === "defaultLGA") {
      setSelectedLGA(null)
      return
    }

    const lga = lgas.find((l) => l.id === lgaId)
    setSelectedLGA(lga || null)
  }

  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price)
    return `₦${numPrice.toLocaleString()}`
  }

  const handleContactAction = (action: "whatsapp" | "call") => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    if (!product) return

    if (action === "whatsapp") {
      const message = `Hi, I'm interested in your ${product.name} listed for ${formatPrice(product.price)}`
      const whatsappUrl = `https://wa.me/${product.store.phone_number}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")
    } else if (action === "call") {
      window.location.href = `tel:${product.store.phone_number}`
    }
  }

  const handleLoginRedirect = () => {
    // Store current URL to return after login
    if (typeof window !== "undefined") {
      localStorage.setItem("redirect_after_login", window.location.pathname)
    }
    router.push("/login")
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Handle search functionality
      console.log("Searching for:", searchQuery)
      // You can implement search navigation here
    }
  }

  // Image navigation functions
  const goToPreviousImage = () => {
    if (!product || product.images.length <= 1) return
    setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
  }

  const goToNextImage = () => {
    if (!product || product.images.length <= 1) return
    setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
  }

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNextImage()
    } else if (isRightSwipe) {
      goToPreviousImage()
    }
  }

  // Mouse event handlers for desktop dragging
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientX)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return
    
    const distance = dragStart - e.clientX
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        goToNextImage()
      } else {
        goToPreviousImage()
      }
      setIsDragging(false)
      setDragStart(null)
    }
  }

  const onMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const onMouseLeave = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPreviousImage()
      } else if (e.key === "ArrowRight") {
        goToNextImage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [product])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700 text-white">Back to Home</Button>
          </Link>
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
        showStateSelectors={true}
        selectedState={selectedState}
        selectedLGA={selectedLGA}
        onStateChange={handleStateChange}
        onLGAChange={handleLGAChange}
      />

      {/* Main Content */}
      <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image with Slider */}
            <div 
              ref={imageContainerRef}
              className="relative aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg overflow-hidden group cursor-grab active:cursor-grabbing"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
            >
              <Image
                src={product.images[selectedImageIndex]?.url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 ease-in-out select-none"
                sizes="(max-width: 768px) 100vw, 50vw"
                draggable={false}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=400&width=400"
                }}
              />
              
              {/* Heart Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className={`absolute top-4 right-4 z-10 transition-all duration-200 ${
                  product && wishlistItems.includes(product.id)
                    ? "bg-red-100 hover:bg-red-200 text-red-600"
                    : "bg-white/80 hover:bg-white text-gray-600"
                }`}
                onClick={toggleWishlist}
                disabled={product && wishlistLoading.includes(product.id)}
              >
                {product && wishlistLoading.includes(product.id) ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : (
                  <Heart 
                    className={`h-5 w-5 transition-all duration-200 ${
                      product && wishlistItems.includes(product.id) ? "fill-current" : ""
                    }`} 
                  />
                )}
              </Button>

              {/* Navigation Arrows - Only show if more than 1 image */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                    onClick={goToPreviousImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                    onClick={goToNextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Image Counter */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-10">
                  {selectedImageIndex + 1} / {product.images.length}
                </div>
              )}

              {/* Slide Indicator Dots */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        selectedImageIndex === index 
                          ? "bg-white" 
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                      selectedImageIndex === index ? "border-red-600 scale-105" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=80&width=80"
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Swipe Instruction */}
            {product.images.length > 1 && (
              <p className="text-sm text-gray-500 text-center">
                Swipe, drag, or use arrow keys to navigate images
              </p>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium uppercase tracking-wide">
                    {product.brand || "Location"}
                  </span>
                  <span>•</span>
                  <span>
                    {product.store.store_lga}, {product.store.store_state}
                  </span>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Retail Price</p>
                    <p className="text-2xl md:text-4xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                  </div>
                  {isMerchant && product.wholesale_price && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-red-500 uppercase tracking-wide mb-1">Merchant Price</p>
                      <p className="text-2xl font-bold text-red-600">{formatPrice(product.wholesale_price)}</p>
                      <p className="text-xs text-red-500 mt-1">Vendor to Vendor price</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Store Information */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <Avatar className="h-14 w-14 ring-2 ring-gray-100">
                  <AvatarFallback className="bg-red-100 text-red-600 text-lg font-semibold">
                    {product.store.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{product.store.name}</h3>
                    <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    📍 {product.store.store_lga}, {product.store.store_state}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleContactAction("whatsapp")}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 flex items-center justify-center space-x-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Message on WhatsApp</span>
              </Button>
              <Button
                onClick={() => handleContactAction("call")}
                variant="outline"
                className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 py-2 flex items-center justify-center space-x-3 rounded-xl font-semibold text-base hover:border-red-700 hover:text-red-700 transition-all duration-200"
              >
                <Phone className="h-5 w-5" />
                <span>Call Seller</span>
              </Button>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span>📋</span>
                <span>Product Details</span>
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-base">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              You need to be logged in to contact the seller. Please login or create an account to continue.
            </p>
            <div className="flex space-x-3">
              <Button onClick={handleLoginRedirect} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                Login / Register
              </Button>
              <Button onClick={() => setShowLoginDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-red-900 text-white mt-12">
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