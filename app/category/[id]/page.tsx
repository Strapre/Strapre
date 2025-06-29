"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, Menu, Search, Filter, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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
  store_state: string
  store_lga: string
  phone_number: string
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
  }
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [states, setStates] = useState<State[]>([])
  const [lgas, setLgas] = useState<LGA[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [selectedLGA, setSelectedLGA] = useState<LGA | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [filterState, setFilterState] = useState("")
  const [filterLGA, setFilterLGA] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    setIsAuthenticated(!!token)

    // Fetch initial data
    fetchCategories()
    fetchStates()

    // Fetch category products
    if (params.id) {
      fetchCategoryProducts(params.id as string)
    }
  }, [params.id])

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

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://gadg.vplaza.com.ng/api/v1/categories")
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

  const fetchCategoryProducts = async (categoryId: string, page = 1) => {
    setLoading(true)
    try {
      let url = `https://gadg.vplaza.com.ng/api/v1/products/category/${categoryId}?page=${page}`

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const applyFilters = () => {
    // Here you would implement additional filter logic
    console.log("Applying filters:", { filterState, filterLGA, minAmount, maxAmount })
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

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.id}`}
                          className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <span className="text-sm truncate pr-2 flex-1">{cat.name}</span>
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-red-600 font-bold text-xl">LOGO</span>
              </Link>
            </div>

            {/* Desktop Search Bar */}
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

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>

              {isAuthenticated ? (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-red-100 text-red-600 text-sm">U</AvatarFallback>
                </Avatar>
              ) : (
                <Link href="/login">
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-4 text-sm">LOGIN / REGISTER</Button>
                </Link>
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
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-800 rounded-lg p-8 mb-8 relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-white text-3xl md:text-4xl font-bold mb-4">New iPhone 14 Pro Max</h1>
                <p className="text-white/90 text-sm md:text-base mb-6 max-w-2xl">
                  Apple's top-tier phone with a 6.7" OLED display, A16 Bionic chip, and Dynamic Island. It features a
                  48MP main camera, ProRAW/ProRes support, and cinematic 4K video. Built with stainless steel and
                  Ceramic Shield, it's IP68 rated and includes Crash Detection and SOS via satellite. Comes in Purple,
                  Deep Purple, Gold, Silver, and Space Black.
                </p>
                <Button className="bg-white text-black hover:bg-gray-100">View More</Button>
              </div>

              {/* Phone Image */}
              <div className="absolute right-4 top-4 bottom-4 w-48 md:w-64">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl transform rotate-12 opacity-20"></div>
                  <div className="absolute inset-2 bg-black rounded-3xl flex items-center justify-center">
                    <div className="w-32 h-48 md:w-40 md:h-60 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl"></div>
                  </div>
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-8 flex space-x-2">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div key={index} className="w-3 h-3 rounded-full bg-white/50"></div>
                ))}
              </div>
            </div>

            {/* Category Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
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
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">Ad</span>
                          </div>
                          <p className="text-gray-500 text-xs">
                            {product.store.store_lga}, {product.store.store_state}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button variant="outline" size="sm">
                      Pages
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant="outline"
                        size="sm"
                        className={currentPage === page ? "bg-red-600 text-white" : ""}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    {totalPages > 5 && (
                      <>
                        <Button variant="outline" size="sm">
                          More
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage >= totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* No Products Message */}
                {products.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No products found in this category</p>
                  </div>
                )}
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
