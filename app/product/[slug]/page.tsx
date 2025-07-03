"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, Menu, Search, Phone, MessageCircle, ChevronRight, User, ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

  // Check authentication and fetch initial data
  useEffect(() => {
    // Check authentication
    const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null
    const userStoreData = typeof window !== 'undefined' ? localStorage.getItem("userStore") : null
    
    setIsAuthenticated(!!token)
    setIsMerchant(!!userStoreData)

    // Fetch initial data
    fetchCategories()
    fetchStates()

    // Fetch user data if authenticated
    if (token) {
      fetchUserProfile(token)
      fetchUserStore(token)
    }

    // Fetch product data
    if (params.slug) {
      fetchProduct(params.slug as string)
    }
  }, [params.slug])

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://gadget.vplaza.com.ng/api/v1/categories")
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
      const response = await fetch("https://gadget.vplaza.com.ng/api/v1/mystore", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUserStore(data)
        setIsMerchant(true)
        
        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('userStore', JSON.stringify(data))
        }
      }
    } catch (error) {
      console.error("Error fetching user store:", error)
    }
  }

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("https://gadget.vplaza.com.ng/api/v1/auth/get-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setUserProfile(data.data)
      
        // Store in localStorage
        if (typeof window !== 'undefined') {
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
      const response = await fetch("https://gadget.vplaza.com.ng/api/v1/states")
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
      const response = await fetch(`https://gadget.vplaza.com.ng/api/v1/states/${stateSlug}/lgas`)
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
      const response = await fetch(`https://gadget.vplaza.com.ng/api/v1/products/${slug}`)
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

  const getUserInitials = () => {
    if (!userProfile || !userProfile.first_name || !userProfile.last_name) return "U"
    return `${userProfile.first_name[0]}${userProfile.last_name[0]}`
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
    if (typeof window !== 'undefined') {
      localStorage.setItem("redirect_after_login", window.location.pathname)
    }
    router.push("/login")
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("userStore")
      localStorage.removeItem("userDetails")
    }
    setIsAuthenticated(false)
    setUserProfile(null)
    setUserStore(null)
    setIsMerchant(false)
    router.push("/")
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Handle search functionality
      console.log("Searching for:", searchQuery)
      // You can implement search navigation here
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

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

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8">
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

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto">
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
                    </div>

                    {/* Fixed bottom button */}
                    <div className="flex-shrink-0 pt-4 border-t border-gray-200">
                      <Button
                        className={`w-full ${
                          userStore ? "bg-green-600 hover:bg-green-700" : "bg-[#CB0207] hover:bg-[#A50206]"
                        } text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        {userStore ? "View My Store" : "Become a Merchant"}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <div className="hidden md:flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
                  <img src="/strapre-logo.jpg" alt="Strapre Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-[#CB0207] font-bold text-xl">Strapre</span>
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full pr-12 rounded-2xl border-2 border-gray-200 focus:border-[#CB0207] focus:ring-2 focus:ring-[#CB0207]/20 transition-all duration-300 h-12"
                />
                <Button
                  size="icon"
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl bg-[#CB0207] hover:bg-[#A50206] text-white h-8 w-8"
                  variant="ghost"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* State/LGA Selectors - Desktop */}
            <div className="hidden  items-center space-x-3">
              <Select onValueChange={handleStateChange} value={selectedState?.id || "defaultState"}>
                <SelectTrigger className="w-36 rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="defaultState">All States</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={handleLGAChange}
                value={selectedLGA?.id || "defaultLGA"}
                disabled={!selectedState}
              >
                <SelectTrigger className="w-36 rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12">
                  <SelectValue placeholder="LGA" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="defaultLGA">All LGAs</SelectItem>
                  {lgas.map((lga) => (
                    <SelectItem key={lga.id} value={lga.id}>
                      {lga.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Login/Register Button or User Dropdown */}
            {!isAuthenticated ? (
              <Link href="/login">
                <Button className="bg-[#CB0207] hover:bg-[#A50206] text-white text-[10px] md:text-[12px] px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  LOGIN / REGISTER
                </Button>
              </Link>
            ) : (
              userProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-3 hover:bg-gray-100 rounded-xl px-3 h-14"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-[#CB0207]/20">
                        <AvatarImage src={userProfile.profile_picture || ""} />
                        <AvatarFallback className="bg-[#CB0207] text-white font-bold text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left hidden md:block">
                        <p className="text-sm font-semibold text-gray-800">{`${userProfile.first_name} ${userProfile.last_name}`}</p>
                        <p className="text-xs text-gray-500">{userProfile.email}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
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
              )
            )}
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full pr-12 rounded-2xl border-2 border-gray-200 focus:border-[#CB0207] focus:ring-2 focus:ring-[#CB0207]/20 transition-all duration-300"
              />
              <Button
                size="icon"
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl bg-[#CB0207] hover:bg-[#A50206] text-white h-8 w-8"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

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
            {/* Main Image */}
            <div className="relative aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImageIndex]?.url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=400&width=400"
                }}
              />
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/80 hover:bg-white">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? "border-red-600" : "border-gray-200"
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
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">{product.name}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium uppercase tracking-wide">
                    {product.brand || 'Location'}
                  </span>
                  <span>•</span>
                  <span>{product.store.store_lga}, {product.store.store_state}</span>
                </div>
              </div>
              
              {/* Pricing Section */}
              <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Retail Price</p>
                    <p className="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</p>
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
                  <AvatarFallback className="bg-red-100 text-red-600 text-lg font-semibold">{product.store.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{product.store.name}</h3>
                    <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    📍 {product.store.store_lga}, {product.store.store_state}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span className="flex items-center space-x-1">
                      <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div>
                      <span>Active seller</span>
                    </span>
                  </div>
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