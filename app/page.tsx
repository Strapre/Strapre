"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Search,
  Menu,
  Filter,
  ChevronDown,
  ChevronRight,
  Heart,
  User,
  X,
  LogOut,
  MapPin,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import RegisterSW from "./register-sw"
import InstallPrompt from "./install-prompt"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
}

interface ProductImage {
  id: string
  url: string
}

interface ProductStore {
  id: string
  name: string
  slug: string
  store_state?: string
  store_lga?: string
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
  is_featured: number // Added is_featured field
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
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
  }
}

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [states, setStates] = useState<State[]>([])
  const [lgas, setLgas] = useState<LGA[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [selectedLGA, setSelectedLGA] = useState<LGA | null>(null)
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStore, setUserStore] = useState<UserStore | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [filterState, setFilterState] = useState("")
  const [filterLGA, setFilterLGA] = useState("")
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [paginationLinks, setPaginationLinks] = useState<
    Array<{
      url: string | null
      label: string
      active: boolean
    }>
  >([])

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [wishlistLoading, setWishlistLoading] = useState<string[]>([])

  const slides = [
    "/strapre-hero.png",
    "/strapre-hero1.jpg",
    "/strapre-hero2.jpg",
    "/strapre-hero3.jpg",
    "/strapre-hero4.jpg",
  ]

  // Check authentication and fetch user data
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      setIsAuthenticated(true)
      fetchUserProfile(token)
      fetchUserStore(token)
      fetchWishlist(token)
    }
  }, [])

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
    fetchStates()
    fetchProducts()
  }, [])

  // Fetch LGAs when state changes
  useEffect(() => {
    if (selectedState) {
      fetchLGAs(selectedState.slug)
      setSelectedLGA(null)
    } else {
      setLgas([])
      setSelectedLGA(null)
    }
  }, [selectedState])

  // Add this useEffect after the existing ones
  useEffect(() => {
    fetchProducts(1) // Reset to page 1 when filters change
  }, [selectedState, selectedLGA])

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

        // ✅ Store in localStorage
        localStorage.setItem("userDetails", JSON.stringify(data.data))

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000) // every 4 seconds
    return () => clearInterval(interval) // cleanup
  }, [])

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

        // Store in localStorage
        localStorage.setItem("userStore", JSON.stringify(data))
      }
    } catch (error) {
      console.error("Error fetching user store:", error)
    }
  }

  // Wishlist functions
  const fetchWishlist = async (token: string) => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Extract product IDs from wishlist data
        const productIds = data.data?.map((item: any) => item.product_id) || []
        setWishlistItems(productIds)
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    }
  }

  const addToWishlist = async (productId: string) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

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

  const toggleWishlist = (productId: string) => {
    if (wishlistItems.includes(productId)) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/categories")
      const data: ApiResponse<Category> = await response.json()
      setCategories(data.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchStates = async () => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/states")
      const data: ApiResponse<State> = await response.json()
      // Sort states alphabetically by name
      const sortedStates = data.data.sort((a, b) => a.name.localeCompare(b.name))
      setStates(sortedStates)
    } catch (error) {
      console.error("Error fetching states:", error)
    }
  }

  const fetchLGAs = async (stateSlug: string) => {
    try {
      const response = await fetch(`https://ga.vplaza.com.ng/api/v1/states/${stateSlug}/lgas`)
      const data: ApiResponse<LGA> = await response.json()
      // Sort LGAs alphabetically by name
      const sortedLGAs = data.data.sort((a, b) => a.name.localeCompare(b.name))
      setLgas(sortedLGAs)
    } catch (error) {
      console.error("Error fetching LGAs:", error)
    }
  }

  const fetchProducts = async (page = 1) => {
    setLoading(true)
    try {
      let url = `https://ga.vplaza.com.ng/api/v1/products?page=${page}`

      // Add state filter if selected
      if (selectedState) {
        url += `&state_id=${selectedState.id}`
      }

      // Add LGA filter if selected
      if (selectedLGA) {
        url += `&lga_id=${selectedLGA.id}`
      }

      const response = await fetch(url)
      const data: ApiResponse<Product> = await response.json()
      setProducts(data.data)

      if (data.meta) {
        setCurrentPage(data.meta.current_page)
        setTotalPages(data.meta.last_page)
        setPaginationLinks(data.meta.links)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price)
    return `₦${numPrice.toLocaleString()}`
  }

  const handleStateChange = (stateId: string) => {
    const state = states.find((s) => s.id === stateId)
    setSelectedState(state || null)
  }

  const handleLGAChange = (lgaId: string) => {
    const lga = lgas.find((l) => l.id === lgaId)
    setSelectedLGA(lga || null)
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    setIsAuthenticated(false)
    setUserProfile(null)
    setUserStore(null)
    setWishlistItems([])
    router.push("/login")
  }

  const applyFilters = () => {
    // Here you would implement the filter logic
    console.log("Applying filters:", { filterState, filterLGA, minAmount, maxAmount })
    setShowFilterDialog(false)
  }

  const clearFilters = () => {
    setFilterState("")
    setFilterLGA("")
    setMinAmount("")
    setMaxAmount("")
  }

  const handlePageChange = (url: string | null) => {
    if (!url) return

    // Extract page number from URL
    const urlParams = new URLSearchParams(url.split("?")[1])
    const page = urlParams.get("page")
    if (page) {
      fetchProducts(Number.parseInt(page))
    }
  }

  const getUserInitials = () => {
    if (!userProfile || !userProfile.first_name || !userProfile.last_name) return "U"
    return `${userProfile.first_name[0]}${userProfile.last_name[0]}`
  }

  if (!isAuthenticated) {
    // NOT SIGNED IN - Show original homepage with LOGIN/REGISTER button
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
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
                          <div
                            onClick={() => {
                              window.open("https://wa.me/2348138695216?text=Hello%2C%20I%20need%20help%21", "_blank")
                            }}
                            className="py-3 px-4 text-sm cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium"
                          >
                            💬 Message Support
                          </div>
                          {/* <div className="py-3 px-4 text-sm cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-200 flex items-center font-medium">
                            <User className="h-4 w-4 mr-2" />
                            Settings
                          </div> */}
                        </div>
                      </div>
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

              {/* State/LGA Selectors - Desktop */}
              <div className="hidden md:flex items-center space-x-3">
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

              {/* Login/Register Button */}
              <Link href="/login">
                <Button className="bg-[#CB0207] hover:bg-[#A50206] text-white text-[10px] md:text-[12px] px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  LOGIN / REGISTER
                </Button>
              </Link>
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

        <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto mx-auto px-2 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Sidebar - Desktop Only */}
            <aside className="hidden md:block w-72">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
                <h3 className="font-bold text-xl mb-6 text-gray-800">All Categories</h3>
                <div className="space-y-1">
                  {categories.slice(0, 20).map((category) => (
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
                  {categories.length > 20 && (
                    <div className="py-3 px-4 text-sm text-[#CB0207] cursor-pointer font-medium hover:bg-gray-50 rounded-xl transition-all duration-200">
                      See More
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Hero Section */}
              <div
                className="relative rounded-lg p-8 mb-4 md:mb-8 overflow-hidden bg-cover bg-center h-[200px] md:h-[400px] transition-all duration-500"
                style={{ backgroundImage: `url(${slides[currentSlide]})` }}
              >
                {/* Black overlay */}
                <div className="absolute inset-0 bg-black/10 z-0"></div>

                {/* Content */}
                <div className="relative z-10 mt-4">
                  <h1 className="text-white text-xl md:text-4xl font-bold mb-2">New iPhone 14 Pro Max</h1>
                  <p className="text-white/90 text-[5px] md:text-base mb-4 max-w-[257px] md:max-w-2xl">
                    Apple's top-tier phone with a 6.7&quot; OLED display, A16 Bionic chip, and Dynamic Island. It
                    features a 48MP main camera, ProRAW/ProRes support, and cinematic 4K video. Built with stainless
                    steel.
                  </p>
                  <div className="inline-block bg-white text-[8px] md:text-[12px] text-black font-bold hover:bg-gray-100 px-2 md:px-4 py-1 md:py-2 rounded cursor-pointer">
                    VIEW INFO
                  </div>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-white" : "bg-white/50"}`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Products Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 md:p-8">
                <div className="flex items-center justify-between mb-4 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">🔥 Hot Sales</h2>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-[2] border-gray-60 text-black hover:bg-[#CB0207] hover:text-white rounded-xl px-3 py-2 font-medium transition-all duration-300 bg-transparent"
                    onClick={() => setShowFilterDialog(true)}
                  >
                    <Filter className="h-2 w-4" />
                  </Button>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB0207] border-t-transparent"></div>
                  </div>
                )}

                {/* Products Grid */}
                {!loading && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 pb-2">
                    {products.map((product) => (
                      <Link key={product.id} href={`/product/${product.slug}`}>
                        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-lg card-hover rounded-xl">
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-32 md:h-48 relative">
                            {product.images.length > 0 ? (
                              <Image
                                src={product.images[0].url || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg?height=200&width=200"
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-2">
                            <h3 className="font-semibold text-xs md:text-sm mb-1 md:mb-3 line-clamp-2 text-gray-800">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-bold text-sm md:text-lg text-[#CB0207]">
                                {formatPrice(product.price)}
                              </span>
                              {/* Only show Ad badge when is_featured is 1 */}
                              {product.is_featured === 1 && (
                                <span className="bg-[#CB0207] text-white text-xs px-2 py-1 rounded-lg font-medium">
                                  Ad
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {product.store.store_lga || "N/A"}, {product.store.store_state || "N/A"}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* No Products Message */}
                {!loading && products.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No products found</p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-[#CB0207] to-[#A50206] text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-xl mb-6">Buy</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                      Create account
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                      Bid
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                      Gift cards
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-6">Sell</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                      Become a seller
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                      Auction
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                      Store
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-6">Logistics</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                      Local
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                      Cross boarder
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-6">Customer Support</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                      Contact us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                      Email
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-4 mb-4 md:mb-0">
                <a href="#" className="text-white hover:text-gray-200 transition-colors duration-200">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                    <span className="text-white font-bold">f</span>
                  </div>
                </a>
                <a href="#" className="text-white hover:text-gray-200 transition-colors duration-200">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                    <span className="text-white font-bold">in</span>
                  </div>
                </a>
                <a href="#" className="text-white hover:text-gray-200 transition-colors duration-200">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                    <span className="text-white font-bold">@</span>
                  </div>
                </a>
              </div>
              <p className="text-sm text-white/80">© 2025 Strapre. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Modern Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="sm:max-w-lg rounded-2xl border-0 shadow-2xl">
            <DialogHeader className="pb-6">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold text-gray-800">🔍 Filter Products</DialogTitle>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilterDialog(false)}
                  className="rounded-xl hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button> */}
              </div>
            </DialogHeader>
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-[#CB0207]" />
                  <h3 className="font-semibold text-lg text-gray-800">Location</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select value={filterState} onValueChange={setFilterState}>
                    <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterLGA} onValueChange={setFilterLGA}>
                    <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12">
                      <SelectValue placeholder="Select LGA" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {lgas.map((lga) => (
                        <SelectItem key={lga.id} value={lga.id}>
                          {lga.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-[#CB0207]" />
                  <h3 className="font-semibold text-lg text-gray-800">Price Range</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <Input
                    placeholder="Min Amount"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    type="number"
                    className="rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12"
                  />
                  <span className="text-gray-400 font-medium">—</span>
                  <Input
                    placeholder="Max Amount"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    type="number"
                    className="rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={applyFilters}
                  className="flex-1 bg-[#CB0207] hover:bg-[#A50206] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Apply Filters
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="flex-1 border-2 border-gray-200 hover:bg-gray-50 py-3 rounded-xl font-semibold transition-all duration-300 bg-transparent"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // SIGNED IN - Show logged in homepage with user profile
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
                  <div className="py-6 h-full flex mb-4">
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
                      <div
                            onClick={() => {
                              window.open("https://wa.me/2348138695216?text=Hello%2C%20I%20need%20help%21", "_blank")
                            }}
                            className="py-3 px-4 text-sm cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium"
                          >
                            💬 Message Support
                          </div>
                      {/* <div className="py-3 px-4 text-sm cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-200 flex items-center font-medium">
                        <User className="h-4 w-4 mr-2" />
                        Settings
                      </div> */}
                    </div>

                    <Button
                      onClick={() => {
                        if (userStore) {
                          router.push("/my-store")
                        } else {
                          router.push("/create-store")
                        }
                      }}
                      className={`w-full ${
                        userStore
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-[#CB0207] hover:bg-[#A50206]"
                      } text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      {userStore ? "View My Store" : "Become a Merchant"}
                    </Button>
                    <div className="h-4 text-white">
                      Fill up
                    </div>
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
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 rounded-xl relative"
                onClick={() => router.push("/wishlist")}
              >
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#CB0207] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>

              {userProfile && (
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
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">{`${userProfile.first_name} ${userProfile.last_name}`}</p>
                        <p className="text-xs text-gray-500">{userProfile.email}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-0">
                    <DropdownMenuItem className="rounded-lg" onClick={() => router.push("/edit-profile")}>
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (userStore) {
                          router.push("/my-store")
                        } else {
                          router.push("/create-store")
                        }
                      }}
                    >
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
            <div className="flex md:hidden space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 rounded-xl relative"
                onClick={() => router.push("/wishlist")}
              >
                <Heart className="h-7 w-7" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#CB0207] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
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

      <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto mx-auto px-2 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden md:block w-72">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-xl mb-6 text-gray-800">All Categories</h3>
              <div className="space-y-1">
                {categories.slice(0, 20).map((category) => (
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
                {categories.length > 20 && (
                  <div className="py-3 px-4 text-sm text-[#CB0207] cursor-pointer font-medium hover:bg-gray-50 rounded-xl transition-all duration-200">
                    See More
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Hero Section */}
            <div
              className="relative rounded-lg p-8 mb-4 md:mb-8 overflow-hidden bg-cover bg-center h-[200px] md:h-[400px] transition-all duration-500"
              style={{ backgroundImage: `url(${slides[currentSlide]})` }}
            >
              {/* Black overlay */}
              <div className="absolute inset-0 bg-black/10 z-0"></div>

              {/* Content */}
              <div className="relative z-10 mt-4">
                <h1 className="text-white text-xl md:text-4xl font-bold mb-2">New iPhone 14 Pro Max</h1>
                <p className="text-white/90 text-[5px] md:text-base mb-4 max-w-[257px] md:max-w-2xl">
                  Apple's top-tier phone with a 6.7&quot; OLED display, A16 Bionic chip, and Dynamic Island. It features
                  a 48MP main camera, ProRAW/ProRes support, and cinematic 4K video. Built with stainless steel.
                </p>
                <div className="inline-block bg-white text-[8px] md:text-[12px] text-black font-bold hover:bg-gray-100 px-2 md:px-4 py-1 md:py-2 rounded cursor-pointer">
                  VIEW INFO
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-white" : "bg-white/50"}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 md:p-8">
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Products</h2>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-[2] border-gray-60 text-black hover:bg-[#CB0207] hover:text-white rounded-xl px-3 py-2 font-medium transition-all duration-300 bg-transparent"
                  onClick={() => setShowFilterDialog(true)}
                >
                  <Filter className="h-2 w-4" />
                </Button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB0207] border-t-transparent"></div>
                </div>
              )}

              {/* Products Grid */}
              {!loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 pb-2">
                  {products.map((product) => (
                    <div key={product.id} className="relative">
                      <Link href={`/product/${product.slug}`}>
                        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-lg card-hover rounded-xl">
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-32 md:h-48 relative">
                            {product.images.length > 0 ? (
                              <Image
                                src={product.images[0].url || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg?height=200&width=200"
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-2">
                            <h3 className="font-semibold text-xs md:text-sm mb-1 md:mb-3 line-clamp-2 text-gray-800">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-bold text-sm md:text-lg text-[#CB0207]">
                                {formatPrice(product.price)}
                              </span>
                              {/* Only show Ad badge when is_featured is 1 */}
                              {product.is_featured === 1 && (
                                <span className="bg-[#CB0207] text-white text-xs px-2 py-1 rounded-lg font-medium">
                                  Ad
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {product.store.store_lga || "N/A"}, {product.store.store_state || "N/A"}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Wishlist Heart Button - Only for logged in users */}
                      {isAuthenticated && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`absolute top-2 right-2 z-10 rounded-full w-8 h-8 ${
                            wishlistItems.includes(product.id)
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-white/80 hover:bg-white text-gray-600"
                          } shadow-lg transition-all duration-200`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleWishlist(product.id)
                          }}
                          disabled={wishlistLoading.includes(product.id)}
                        >
                          {wishlistLoading.includes(product.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                          ) : (
                            <Heart className={`h-4 w-4 ${wishlistItems.includes(product.id) ? "fill-current" : ""}`} />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                  {paginationLinks.map((link, index) => {
                    if (link.label.includes("Previous")) {
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          disabled={!link.url}
                          onClick={() => handlePageChange(link.url)}
                          className="rounded-xl border-2 border-gray-200 font-medium bg-transparent"
                        >
                          Previous
                        </Button>
                      )
                    } else if (link.label.includes("Next")) {
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          disabled={!link.url}
                          onClick={() => handlePageChange(link.url)}
                          className="rounded-xl border-2 border-gray-200 font-medium bg-transparent"
                        >
                          Next
                        </Button>
                      )
                    } else if (!isNaN(Number.parseInt(link.label))) {
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(link.url)}
                          className={`rounded-xl border-2 font-medium ${
                            link.active ? "bg-[#CB0207] text-white border-[#CB0207]" : "border-gray-200 bg-transparent"
                          }`}
                        >
                          {link.label}
                        </Button>
                      )
                    }
                    return null
                  })}
                </div>
              )}

              {/* No Products Message */}
              {!loading && products.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">No products found</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modern Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-gray-800">🔍 Filter Products</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilterDialog(false)}
                className="rounded-xl hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-[#CB0207]" />
                <h3 className="font-semibold text-lg text-gray-800">Location</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterLGA} onValueChange={setFilterLGA}>
                  <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12">
                    <SelectValue placeholder="Select LGA" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {lgas.map((lga) => (
                      <SelectItem key={lga.id} value={lga.id}>
                        {lga.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-[#CB0207]" />
                <h3 className="font-semibold text-lg text-gray-800">Price Range</h3>
              </div>
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Min Amount"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  type="number"
                  className="rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12"
                />
                <span className="text-gray-400 font-medium">—</span>
                <Input
                  placeholder="Max Amount"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  type="number"
                  className="rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                onClick={applyFilters}
                className="flex-1 bg-[#CB0207] hover:bg-[#A50206] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Apply Filters
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex-1 border-2 border-gray-200 hover:bg-gray-50 py-3 rounded-xl font-semibold transition-all duration-300 bg-transparent"
              >
                Clear All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#CB0207] to-[#A50206] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-6">Buy</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Create account
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Bid
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Gift cards
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-6">Sell</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Become a seller
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Auction
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Store
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-6">Logistics</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Local
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Cross border
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-6">Customer Support</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Contact us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <a href="#" className="text-white hover:text-gray-200 transition-colors duration-200">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                  <span className="text-white font-bold">f</span>
                </div>
              </a>
              <a href="#" className="text-white hover:text-gray-200 transition-colors duration-200">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                  <span className="text-white font-bold">in</span>
                </div>
              </a>
              <a href="#" className="text-white hover:text-gray-200 transition-colors duration-200">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                  <span className="text-white font-bold">@</span>
                </div>
              </a>
            </div>
            <p className="text-sm text-white/80">© 2025 Strapre. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function Page() {
  return (
    <>
      <HomePage />
      <RegisterSW />
      <InstallPrompt />
    </>
  )
}
