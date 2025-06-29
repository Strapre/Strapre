"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, Menu, Filter, ChevronDown, ChevronRight, Heart, User, LogOut } from "lucide-react"
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

  // Check authentication and fetch user data
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      setIsAuthenticated(true)
      fetchUserProfile(token)
      fetchUserStore(token)
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

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("https://gadg.vplaza.com.ng/api/v1/auth/get-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setUserProfile(data.data)

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

  const fetchUserStore = async (token: string) => {
    try {
      const response = await fetch("https://gadg.vplaza.com.ng/api/v1/mystore", {
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

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://gadg.vplaza.com.ng/api/v1/categories")
      const data: ApiResponse<Category> = await response.json()
      setCategories(data.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchStates = async () => {
    try {
      const response = await fetch("https://gadg.vplaza.com.ng/api/v1/states")
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
      const response = await fetch(`https://gadg.vplaza.com.ng/api/v1/states/${stateSlug}/lgas`)
      const data: ApiResponse<LGA> = await response.json()
      // Sort LGAs alphabetically by name
      const sortedLGAs = data.data.sort((a, b) => a.name.localeCompare(b.name))
      setLgas(sortedLGAs)
    } catch (error) {
      console.error("Error fetching LGAs:", error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://gadg.vplaza.com.ng/api/v1/products")
      const data: ApiResponse<Product> = await response.json()
      setProducts(data.data)
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

  const getUserInitials = () => {
    if (!userProfile || !userProfile.first_name || !userProfile.last_name) return "U"
    return `${userProfile.first_name[0]}${userProfile.last_name[0]}`
  }

  if (!isAuthenticated) {
    // NOT SIGNED IN - Show original homepage with LOGIN/REGISTER button
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <div className="py-4">
                      <h3 className="font-semibold text-lg mb-4">All Categories</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/category/${category.id}`}
                            className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
                          >
                            <span className="text-sm truncate pr-2 flex-1">{category.name}</span>
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          </Link>
                        ))}
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
                    className="w-full pr-12 rounded-full border-gray-300"
                  />
                  <Button
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                    variant="ghost"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* State/LGA Selectors - Desktop */}
              <div className="hidden md:flex items-center space-x-4">
                <Select onValueChange={handleStateChange} value={selectedState?.id || "defaultState"}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="LGA" />
                  </SelectTrigger>
                  <SelectContent>
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
                <Button className="bg-[#CB0207] md:text-[12px] text-[10px] hover:bg-red-700 text-white px-4 md:px-6">
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
                  className="w-full pr-12 rounded-full"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                  variant="ghost"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Sidebar - Desktop Only */}
            <aside className="hidden md:block w-64 bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-lg mb-4">All Categories</h3>
              <div className="space-y-2">
                {categories.slice(0, 10).map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.id}`}
                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <span className="text-sm truncate pr-2 flex-1">{category.name}</span>
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  </Link>
                ))}
                {categories.length > 10 && (
                  <div className="py-2 px-3 text-sm text-blue-600 cursor-pointer">See More</div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Hero Section */}
              <div className="relative rounded-lg p-8 mb-4 md:mb-8 overflow-hidden bg-[url('/strapre-hero.png')] bg-cover bg-center">
                {/* Black overlay */}
                <div className="absolute inset-0 bg-black/10 z-0"></div>

                {/* Content */}
                <div className="relative z-10">
                  <h1 className="text-white text-xl md:text-4xl font-bold mb-2">New iPhone 14 Pro Max</h1>
                  <p className="text-white/90 text-[5px] md:text-base mb-4 max-w-[257px] md:max-w-2xl">
                    Apple's top-tier phone with a 6.7" OLED display, A16 Bionic chip, and Dynamic Island. It features a
                    48MP main camera, ProRAW/ProRes support, and cinematic 4K video. Built with stainless steel.
                  </p>
                  <div className="inline-block bg-white text-[8px] md:text-[12px] text-black font-bold hover:bg-gray-100 px-2 md:px-4 py-1 md:py-2 rounded cursor-pointer">
                    VIEW INFO
                  </div>
                </div>

                {/* Slide Indicators (centered horizontally) */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-white" : "bg-white/50"}`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </div>


              {/* Products Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Hot Sales</h2>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent"
                    onClick={() => setShowFilterDialog(true)}
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  </div>
                )}

                {/* Products Grid */}
                {!loading && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                    {products.map((product) => (
                      <Link key={product.id} href={`/product/${product.slug}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                          <div className="bg-gray-100 h-32 md:h-48 relative">
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
                          <CardContent className="p-3 md:p-4">
                            <h3 className="font-medium text-xs md:text-sm mb-2 line-clamp-2">{product.name}</h3>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm md:text-lg">{formatPrice(product.price)}</span>
                              {isAuthenticated && (
                                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">Ad</span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs">
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
                  <div className="text-center py-12">
                    <p className="text-gray-500">No products found</p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>

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
            <div className="border-t border-red-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-4 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-900 font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-900 font-bold">in</span>
                </div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-900 font-bold">@</span>
                </div>
              </div>
              <p className="text-sm text-gray-300">© 2025 Strapre. All rights reserved.</p>
            </div>
          </div>
        </footer>

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
      </div>
    )
  }

  // SIGNED IN - Show logged in homepage with user profile
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="py-4">
                    {/* User Profile Section */}
                    {userProfile && (
                      <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={userProfile.profile_picture || ""} />
                          <AvatarFallback className="bg-red-100 text-red-600">{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{`${userProfile.first_name} ${userProfile.last_name}`}</h3>
                          <p className="text-sm text-gray-500">{userProfile.email}</p>
                        </div>
                      </div>
                    )}

                    <h3 className="font-semibold text-lg mb-4">All Categories</h3>
                    <div className="space-y-2 mb-8">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.id}`}
                          className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <span className="text-sm truncate pr-2 flex-1">{category.name}</span>
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="py-2 px-3 text-sm cursor-pointer hover:bg-gray-100 rounded">Notification</div>
                      <div className="py-2 px-3 text-sm cursor-pointer hover:bg-gray-100 rounded">Message Support</div>
                      <div className="py-2 px-3 text-sm cursor-pointer hover:bg-gray-100 rounded flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Settings
                      </div>
                    </div>

                    <Button
                      className={`w-full ${
                        userStore ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                      } text-white`}
                    >
                      {userStore ? "View My Store" : "Become a Merchant"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-orange-500 font-bold text-xl">Strapre</span>
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
                  className="w-full pr-12 rounded-full border-gray-300"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                  variant="ghost"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>

              {userProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile.profile_picture || ""} />
                        <AvatarFallback className="bg-red-100 text-red-600 text-sm">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-medium">{`${userProfile.first_name} ${userProfile.last_name}`}</p>
                        <p className="text-xs text-gray-500">{userProfile.email}</p>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span className="h-4 w-4 mr-2">S</span>
                      {userStore ? "View My Store" : "Become a Merchant"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
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
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile.profile_picture || ""} />
                  <AvatarFallback className="bg-red-100 text-red-600 text-sm">{getUserInitials()}</AvatarFallback>
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
                className="w-full pr-12 rounded-full"
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                variant="ghost"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden md:block w-64 bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-lg mb-4">All Categories</h3>
            <div className="space-y-2">
              {categories.slice(0, 10).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <span className="text-sm truncate pr-2 flex-1">{category.name}</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                </Link>
              ))}
              {categories.length > 10 && <div className="py-2 px-3 text-sm text-blue-600 cursor-pointer">See More</div>}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-800 rounded-lg p-8 mb-8 relative overflow-hidden">
              <div className="relative z-10">
                  <h1 className="text-white text-xl md:text-4xl font-bold mb-2">New iPhone 14 Pro Max</h1>
                  <p className="text-white/90 text-[5px] md:text-base mb-4 max-w-[257px] md:max-w-2xl">
                    Apple's top-tier phone with a 6.7" OLED display, A16 Bionic chip, and Dynamic Island. It features a
                    48MP main camera, ProRAW/ProRes support, and cinematic 4K video. Built with stainless steel.
                  </p>
                  <div className="inline-block bg-white text-[8px] md:text-[12px] text-black font-bold hover:bg-gray-100 px-2 md:px-4 py-1 md:py-2 rounded cursor-pointer">
                    VIEW INFO
                  </div>
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-8 flex space-x-2">
                {[0, 1, 2, 3, 4].map((index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-white" : "bg-white/50"}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Products</h2>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  onClick={() => setShowFilterDialog(true)}
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              )}

              {/* Products Grid */}
              {!loading && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                  {products.map((product) => (
                    <Link key={product.id} href={`/product/${product.slug}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="bg-gray-100 h-32 md:h-48 relative">
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
                        <CardContent className="p-3 md:p-4">
                          <h3 className="font-medium text-xs md:text-sm mb-2 line-clamp-2">{product.name}</h3>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm md:text-lg">{formatPrice(product.price)}</span>
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">Ad</span>
                          </div>
                          <p className="text-gray-500 text-xs">
                            {product.store.store_lga || "N/A"}, {product.store.store_state || "N/A"}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button variant="outline" size="sm">
                  Pages
                </Button>
                <Button variant="outline" size="sm" className="bg-red-600 text-white">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  4
                </Button>
                <Button variant="outline" size="sm">
                  5
                </Button>
                <Button variant="outline" size="sm">
                  More
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>

              {/* No Products Message */}
              {!loading && products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products found</p>
                </div>
              )}
            </div>
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

          <div className="border-t border-red-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <a href="#" className="text-white hover:text-gray-300">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-900 font-bold">f</span>
                </div>
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-900 font-bold">in</span>
                </div>
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-900 font-bold">@</span>
                </div>
              </a>
            </div>
            <p className="text-sm text-gray-300">© 2025 Strapre. All rights reserved.</p>
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
