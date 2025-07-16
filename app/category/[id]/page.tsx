"use client"

import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Filter, ChevronRight, ChevronLeft, MapPin, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Header from "@/components/header"
import Footer from "@/components/footer"

interface Category {
  id: string
  name: string
  slug: string
}

interface Advert {
  id: string
  store_id: string | null
  state_id: string
  title: string
  link: string
  starts_at: string
  ends_at: string
  image: string
  is_dummy: number
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
  store_state: string
  store_lga: string
  phone_number: string
}

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  profile_picture: string | null
  state_id?: string
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

interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  specifications: string[] | null
  brand: string
  price: string
  wholesale_price: string
  images: ProductImage[]
  store: ProductStore
  created_at: string
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

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [category, setCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [states, setStates] = useState<State[]>([])
  const [lgas, setLgas] = useState<LGA[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [selectedLGA, setSelectedLGA] = useState<LGA | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStore, setUserStore] = useState<UserStore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [filterState, setFilterState] = useState("")
  const [filterLGA, setFilterLGA] = useState("")
  const [useUserLocation, setUseUserLocation] = useState(true)
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
  const [adverts, setAdverts] = useState<Advert[]>([])
  const [advertsLoading, setAdvertsLoading] = useState(true)

  // Add function to fetch adverts
  const fetchAdverts = async () => {
    try {
      setAdvertsLoading(true)
      const response = await fetch("https://api.strapre.com/api/v1/adverts/dummy", {
        headers: {
          Accept: "application/json",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAdverts(data.data)
      } else {
        console.error("Failed to fetch adverts")
        // Fallback to static images if API fails
        setAdverts([
          {
            id: "1",
            store_id: null,
            state_id: "",
            title: "Strapre",
            link: "#",
            starts_at: "",
            ends_at: "",
            image: "/strapre-hero.png",
            is_dummy: 1,
          },
          {
            id: "2",
            store_id: null,
            state_id: "",
            title: "Featured Products",
            link: "#",
            starts_at: "",
            ends_at: "",
            image: "/strapre-hero1.jpg",
            is_dummy: 1,
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching adverts:", error)
      // Fallback to static images if API fails
      setAdverts([
        {
          id: "1",
          store_id: null,
          state_id: "",
          title: "Strapre - Gadget Home",
          link: "#",
          starts_at: "",
          ends_at: "",
          image: "/strapre-hero.png",
          is_dummy: 1,
        },
      ])
    } finally {
      setAdvertsLoading(false)
    }
  }

  // Manual navigation functions
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % adverts.length)
  }

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + adverts.length) % adverts.length)
  }

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    setIsAuthenticated(!!token)

    // Fetch initial data
    fetchCategories()
    fetchStates()
    fetchAdverts()

    // Fetch category products
    if (params.id) {
      fetchCategoryProducts(params.id as string)
    }
  }, [params.id])

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

  useEffect(() => {
    if (selectedState) {
      fetchLGAs(selectedState.slug)
      setSelectedLGA(null)
    } else {
      setLgas([])
      setSelectedLGA(null)
    }
  }, [selectedState])

  useEffect(() => {
    // Refetch products when filters change
    if (params.id) {
      fetchCategoryProducts(params.id as string, currentPage)
    }
  }, [selectedState, selectedLGA, currentPage, params.id])

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("https://api.strapre.com/api/v1/auth/get-profile", {
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
    if (adverts.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % adverts.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [adverts.length])

  // Helper function to handle advert clicks
  const handleAdvertClick = (advert: Advert) => {
    if (advert.link && advert.link !== "#" && advert.link !== "https://strapre.com") {
      window.open(advert.link, "_blank")
    }
  }

  const fetchUserStore = async (token: string) => {
    try {
      const response = await fetch("https://api.strapre.com/api/v1/mystore", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUserStore(data)
      }
    } catch (error) {
      console.error("Error fetching user store:", error)
    }
  }

  // Wishlist functions
  const fetchWishlist = async (token: string) => {
    try {
      const response = await fetch("https://api.strapre.com/api/v1/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      if (response.ok) {
        const data = await response.json()
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
      const response = await fetch("https://api.strapre.com/api/v1/wishlist", {
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
      const response = await fetch(`https://api.strapre.com/api/v1/wishlist/${productId}`, {
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
      const response = await fetch("https://api.strapre.com/api/v1/categories")
      const data: ApiResponse<Category> = await response.json()
      setCategories(data.data)
      // Find current category
      const currentCategory = data.data.find((cat) => cat.id === params.id)
      setCategory(currentCategory || null)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchStates = async () => {
    try {
      const response = await fetch("https://api.strapre.com/api/v1/states")
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
      const response = await fetch(`https://api.strapre.com/api/v1/states/${stateSlug}/lgas`)
      const data: ApiResponse<LGA> = await response.json()
      // Sort LGAs alphabetically by name
      const sortedLGAs = data.data.sort((a, b) => a.name.localeCompare(b.name))
      setLgas(sortedLGAs)
    } catch (error) {
      console.error("Error fetching LGAs:", error)
    }
  }

  const fetchCategoryProducts = async (categoryId: string, page = 1) => {
    setLoading(true)
    try {
      let url = `https://api.strapre.com/api/v1/products/category/${categoryId}?page=${page}`

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

      if (response.ok) {
        setProducts(data.data)
        if (data.meta) {
          setTotalPages(data.meta.last_page)
          setCurrentPage(data.meta.current_page)
          setPaginationLinks(data.meta.links)
        }
      } else {
        setError("Failed to load products")
      }
    } catch (error) {
      setError("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  // New search function using the search endpoint
  const searchProducts = async (
    page = 1,
    searchParams: {
      search?: string
      min_price?: string
      max_price?: string
      state_id?: string
    } = {},
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("page", page.toString())

      if (searchParams.search) {
        params.append("search", searchParams.search)
      }
      if (searchParams.min_price) {
        params.append("min_price", searchParams.min_price)
      }
      if (searchParams.max_price) {
        params.append("max_price", searchParams.max_price)
      }
      if (searchParams.state_id) {
        params.append("state_id", searchParams.state_id)
      }

      const url = `https://api.strapre.com/api/v1/products/search?${params.toString()}`
      const response = await fetch(url)
      const data: ApiResponse<Product> = await response.json()

      setProducts(data.data)
      if (data.meta) {
        setCurrentPage(data.meta.current_page)
        setTotalPages(data.meta.last_page)
        setPaginationLinks(data.meta.links)
      }
    } catch (error) {
      console.error("Error searching products:", error)
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

  const handlePageChange = (url: string | null) => {
    if (!url || !params.id) return

    // Extract page number from URL
    const urlParams = new URLSearchParams(url.split("?")[1])
    const page = urlParams.get("page")
    if (page) {
      fetchCategoryProducts(params.id as string, Number.parseInt(page))
    }
  }

  // Updated apply filters function
  const applyFilters = () => {
    const searchParams: any = {}

    if (searchQuery.trim()) {
      searchParams.search = searchQuery.trim()
    }
    if (minAmount) {
      searchParams.min_price = minAmount
    }
    if (maxAmount) {
      searchParams.max_price = maxAmount
    }

    // Handle state selection for logged in users
    if (isAuthenticated) {
      if (useUserLocation && userProfile?.state_id) {
        searchParams.state_id = userProfile.state_id
      } else if (filterState) {
        searchParams.state_id = filterState
      }
    } else {
      // For non-logged in users, use filter state
      if (filterState) {
        searchParams.state_id = filterState
      }
    }

    searchProducts(1, searchParams)
    setShowFilterDialog(false)
  }

  const clearFilters = () => {
    setFilterState("")
    setFilterLGA("")
    setMinAmount("")
    setMaxAmount("")
    setSelectedState(null)
    setSelectedLGA(null)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery)
    }
  }
  const handleBackToHome = () => {
    router.push("/")
  }

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  // Update the Hero Section JSX
  const renderHeroSection = () => {
    if (advertsLoading) {
      return (
        <div className="relative rounded-lg p-8 mb-4 md:mb-8 overflow-hidden h-[150px] md:h-[400px] bg-gray-200 animate-pulse">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB0207] border-t-transparent"></div>
          </div>
        </div>
      )
    }

    if (adverts.length === 0) {
      return (
        <div className="relative rounded-lg p-8 mb-4 md:mb-8 overflow-hidden h-[150px] md:h-[400px] bg-gray-200">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No adverts available</p>
          </div>
        </div>
      )
    }

    const currentAdvert = adverts[currentSlide]

    return (
      <div
        className="relative rounded-lg p-8 mb-4 md:mb-8 overflow-hidden bg-cover bg-center h-[150px] md:h-[400px] transition-all duration-500 cursor-pointer"
        style={{ backgroundImage: `url(${currentAdvert.image})` }}
        onClick={() => handleAdvertClick(currentAdvert)}
      >
        {/* Black overlay */}
        <div className="absolute inset-0 bg-black/10 z-0"></div>

        {/* Content */}
        <div className="relative z-10 mt-4">
          <h1 className="text-white text-xl md:text-4xl font-bold mb-2">{currentAdvert.title}</h1>
        </div>

        {/* Navigation Arrows */}
        {adverts.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                goToPreviousSlide()
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Next Button */}
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                goToNextSlide()
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
          {adverts.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-white" : "bg-white/50"}`}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentSlide(index)
              }}
            />
          ))}
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
        selectedState={selectedState}
        selectedLGA={selectedLGA}
        onStateChange={handleStateChange}
        onLGAChange={handleLGAChange}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="flex gap-6">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden md:block w-64 bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-lg mb-4">All Categories</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className={`flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded cursor-pointer ${
                    cat.id === params.id ? "bg-red-50 text-red-600" : ""
                  }`}
                >
                  <span className="text-sm truncate pr-2 flex-1">{cat.name}</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Back Button */}
                <div className="">
                  <Button
                    onClick={handleBackToHome}
                    variant="ghost"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-medium">Back to Home</span>
                  </Button>
                </div>
            {/* Hero Section */}
            {renderHeroSection()}

            {/* Category Header */}
            <div className="flex flex-col justify-between mb-6">
              <div className="flex items-center space-x-4 justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Category ({category?.name || "Loading..."})</h2>

                  {/* Desktop State/LGA Filters */}
                  <div className="hidden md:flex items-center space-x-3">
                    <Select onValueChange={handleStateChange} value={selectedState?.id || "all"}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select onValueChange={handleLGAChange} value={selectedLGA?.id || "all"} disabled={!selectedState}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="LGA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All LGAs</SelectItem>
                        {lgas.map((lga) => (
                          <SelectItem key={lga.id} value={lga.id}>
                            {lga.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-[2] border-gray-60 text-black hover:bg-[#CB0207] hover:text-white rounded-xl px-3 py-2 font-medium transition-all duration-300 bg-transparent"
                  onClick={() => setShowFilterDialog(true)}
                >
                  <Filter className="h-2 w-4" />
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
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
                          {isAuthenticated && (
                            <span className="bg-[#CB0207] text-white text-xs px-2 py-1 rounded-lg font-medium">Ad</span>
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
          </main>
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Location:</h3>
              <div className="grid grid-cols-2 gap-3">
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterLGA} onValueChange={setFilterLGA}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select LGA" />
                  </SelectTrigger>
                  <SelectContent>
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
              <h3 className="font-medium mb-3">Amount:</h3>
              <div className="flex items-center space-x-3">
                <Input
                  placeholder="Min Amount"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  type="number"
                />
                <span className="text-gray-400">—</span>
                <Input
                  placeholder="Max Amount"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  type="number"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={applyFilters} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                Apply Filter
              </Button>
              <Button onClick={clearFilters} variant="outline" className="flex-1 bg-transparent">
                Clear Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Footer />
    </div>
  )
}
