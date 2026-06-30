"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  MessageCircle,
  Share2,
  Search,
  MapPin,
  Calendar,
  ShoppingBag,
  Loader2,
  Check,
  AlertTriangle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Header from "@/components/header"
import Footer from "@/components/footer"

import { ENDPOINTS, getCorrectImageUrl } from "@/lib/api"

interface ProductImage {
  id: string
  url: string
}

interface StoreDetails {
  id: string
  user_id?: string
  store_name: string
  name?: string
  slug: string
  store_description: string
  description?: string
  store_image?: string
  image?: string
  phone: string
  phone_number?: string
  email: string
  state_id?: string
  lga_id?: string
  store_state?: string
  store_lga?: string
  address?: string
  created_at: string
}

interface Product {
  id: string
  name: string
  slug: string
  price: string
  wholesale_price?: string
  description: string
  images: ProductImage[]
  isWishlist?: boolean
  store: {
    id: string
    name: string
    slug: string
    store_lga?: string
    store_state?: string
    phone_number?: string
    phone?: string
  }
  created_at: string
}

interface StorePageClientProps {
  slug: string
}

export default function StorePageClient({ slug }: StorePageClientProps) {
  const router = useRouter()
  const [store, setStore] = useState<StoreDetails | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isMock, setIsMock] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const [showShareDialog, setShowShareDialog] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  
  // Fetch Store and Products on mount
  useEffect(() => {
    async function getStoreData() {
      setLoading(true)
      setError("")
      setIsMock(false)
      try {
        console.log(`[StorePageClient] Fetching store details for slug: ${slug}`)
        // Fetch store details
        const response = await fetch(ENDPOINTS.storeBySlug(slug), {
          headers: {
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const resData = await response.json()
          console.log("[StorePageClient] Store details API response payload:", resData)
          const storeData = resData.data

          if (storeData) {
            setStore({
              id: storeData.id,
              store_name: storeData.store_name || storeData.name || "Strapre Vendor",
              slug: storeData.slug,
              store_description: storeData.store_description || storeData.description || "Welcome to my store on Strapre! Feel free to browse my products and chat with me directly on WhatsApp.",
              store_image: storeData.store_image || storeData.image,
              phone: storeData.phone || storeData.phone_number || "",
              email: storeData.email || "",
              store_state: storeData.store_state || "Nigeria",
              store_lga: storeData.store_lga || "",
              address: storeData.address || "",
              created_at: storeData.created_at || new Date().toISOString(),
            })

            // Fetch products for store
            setProductsLoading(true)
            const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
            const headers: HeadersInit = { Accept: "application/json" }
            if (token) {
              headers["Authorization"] = `Bearer ${token}`
            }

            console.log(`[StorePageClient] Fetching products for store slug: ${slug}`)
            const prodResponse = await fetch(`${ENDPOINTS.storeProducts(slug)}?page=1&limit=12`, {
              headers,
            })

            if (prodResponse.ok) {
              const prodData = await prodResponse.json()
              console.log("[StorePageClient] Store products API response payload:", prodData)
              
              if (prodData && Array.isArray(prodData.data)) {
                setProducts(prodData.data)
                
                // Set pagination metadata
                if (prodData.meta) {
                  setTotalPages(prodData.meta.last_page || 1)
                  setCurrentPage(prodData.meta.current_page || 1)
                  setTotalProducts(prodData.meta.total || prodData.data.length)
                } else {
                  setTotalPages(1)
                  setTotalProducts(prodData.data.length)
                }

                // Dynamically resolve State and LGA names from product store info if available
                if (prodData.data.length > 0 && prodData.data[0].store) {
                  const storeInfo = prodData.data[0].store
                  setStore((prev) => {
                    if (!prev) return null
                    return {
                      ...prev,
                      store_state: storeInfo.store_state || prev.store_state,
                      store_lga: storeInfo.store_lga || prev.store_lga,
                    }
                  })
                }
              } else {
                console.warn("[StorePageClient] Store products response is not an array:", prodData)
              }
            } else if (prodResponse.status === 404) {
              console.warn(`[StorePageClient] Store products returned 404. Setting empty catalog.`)
              setProducts([])
              setTotalPages(1)
              setTotalProducts(0)
            } else {
              console.error(`[StorePageClient] Store products fetch failed. Status: ${prodResponse.status}`)
            }
          } else {
            setError("Store details are empty.")
          }
        } else if (response.status === 404) {
          setError("Store not found or is currently inactive.")
        } else {
          // Fallback to mock data if it returns another server error
          console.warn(`Server returned ${response.status}. Falling back to mock data...`)
          loadMockData()
        }
      } catch (err) {
        console.warn("Backend connection failed, loading mock seller data:", err)
        loadMockData()
      } finally {
        setLoading(false)
        setProductsLoading(false)
      }
    }

    getStoreData()
  }, [slug])

  // Fetch paginated products on page change
  const fetchProductsPage = async (page: number) => {
    if (isMock) return
    setProductsLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = { Accept: "application/json" }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      console.log(`[StorePageClient] Fetching page ${page} of products for store slug: ${slug}`)
      const response = await fetch(`${ENDPOINTS.storeProducts(slug)}?page=${page}&limit=12`, {
        headers,
      })

      if (response.ok) {
        const resData = await response.json()
        console.log(`[StorePageClient] Products page ${page} response payload:`, resData)
        if (resData && Array.isArray(resData.data)) {
          setProducts(resData.data)
          if (resData.meta) {
            setTotalPages(resData.meta.last_page || 1)
            setCurrentPage(resData.meta.current_page || 1)
            setTotalProducts(resData.meta.total || resData.data.length)
          }
        }
      }
    } catch (err) {
      console.error("Error fetching products page:", err)
    } finally {
      setProductsLoading(false)
    }
  }

  // Handle page click
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
    fetchProductsPage(newPage)
    
    // Smooth scroll to catalog header
    const catalogEl = document.getElementById("store-catalog-section")
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Run filtering and sorting whenever searchQuery, sortBy, or products change
  useEffect(() => {
    let result = [...products]

    // Apply Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query))
      )
    }

    // Apply Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0))
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    } else {
      // Default: latest
      result.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
    }

    setFilteredProducts(result)
  }, [searchQuery, sortBy, products])

  // Mock data generator for testing if API is unreachable
  const loadMockData = () => {
    setIsMock(true)
    const formattedName = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    const mockStore: StoreDetails = {
      id: "mock-store-123",
      store_name: formattedName || "Apex Digital Hub",
      slug: slug,
      store_description: "We deal in high-quality smartphones, laptops, audio accessories, and gaming gadgets. All devices come with official warranty and reliable after-sales support. Delivery available nationwide.",
      store_image: "",
      phone: "+2348012345678",
      email: "contact@apexdigital.com",
      store_state: "Lagos",
      store_lga: "Ikeja",
      address: "Suite 45, Computer Village, Ikeja, Lagos",
      created_at: "2024-03-15T00:00:00.000Z",
    }

    const mockProducts: Product[] = [
      {
        id: "prod-1",
        name: "Brand New iPhone 14 Pro Max - 256GB",
        slug: "brand-new-iphone-14-pro-max-256gb",
        price: "850000",
        description: "Brand new Apple iPhone 14 Pro Max in Deep Purple. Factory unlocked, 256GB storage, A16 Bionic chip, and dynamic island layout. 1-year Apple Warranty included.",
        images: [],
        store: {
          id: mockStore.id,
          name: mockStore.store_name,
          slug: mockStore.slug,
          store_lga: mockStore.store_lga,
          store_state: mockStore.store_state,
          phone_number: mockStore.phone,
        },
        created_at: "2026-06-28T12:00:00.000Z",
      },
      {
        id: "prod-2",
        name: "HP EliteBook x360 G8 Touchscreen",
        slug: "hp-elitebook-x360-g8-touchscreen",
        price: "420000",
        description: "Premium business convertible laptop. Intel Core i7 11th Gen, 16GB RAM, 512GB SSD, 14-inch Full HD touch display with stylus support. Bang & Olufsen sound system.",
        images: [],
        store: {
          id: mockStore.id,
          name: mockStore.store_name,
          slug: mockStore.slug,
          store_lga: mockStore.store_lga,
          store_state: mockStore.store_state,
          phone_number: mockStore.phone,
        },
        created_at: "2026-06-25T14:30:00.000Z",
      },
      {
        id: "prod-3",
        name: "Sony WH-1000XM5 Wireless Headphones",
        slug: "sony-wh-1000xm5-wireless-headphones",
        price: "240000",
        description: "Industry-leading active noise canceling wireless headphones. 30 hours battery life, touch sensor controls, crystal clear hands-free calling, and ultimate comfort.",
        images: [],
        store: {
          id: mockStore.id,
          name: mockStore.store_name,
          slug: mockStore.slug,
          store_lga: mockStore.store_lga,
          store_state: mockStore.store_state,
          phone_number: mockStore.phone,
        },
        created_at: "2026-06-20T09:15:00.000Z",
      },
      {
        id: "prod-4",
        name: "Samsung Galaxy S23 Ultra 5G",
        slug: "samsung-galaxy-s23-ultra-5g",
        price: "780000",
        description: "Samsung flagship phone with built-in S Pen. 200MP ultra-sharp camera, Snapdragon 8 Gen 2, 12GB RAM, 256GB storage, and stunning Phantom Black finish.",
        images: [],
        store: {
          id: mockStore.id,
          name: mockStore.store_name,
          slug: mockStore.slug,
          store_lga: mockStore.store_lga,
          store_state: mockStore.store_state,
          phone_number: mockStore.phone,
        },
        created_at: "2026-06-18T10:00:00.000Z",
      },
      {
        id: "prod-5",
        name: "Anker PowerCore 24K 140W Power Bank",
        slug: "anker-powercore-24k-140w-power-bank",
        price: "85000",
        description: "Ultra-high capacity power bank with smart display. 24,000mAh battery, 140W output to charge laptops, tablets, and phones simultaneously. Extremely durable.",
        images: [],
        store: {
          id: mockStore.id,
          name: mockStore.store_name,
          slug: mockStore.slug,
          store_lga: mockStore.store_lga,
          store_state: mockStore.store_state,
          phone_number: mockStore.phone,
        },
        created_at: "2026-06-15T16:45:00.000Z",
      },
    ]

    setStore(mockStore)
    setProducts(mockProducts)
    setFilteredProducts(mockProducts)
    setTotalPages(1)
    setCurrentPage(1)
    setTotalProducts(mockProducts.length)
  }

  // Format phone number and open WhatsApp chat
  const handleWhatsAppChat = (phoneNumber: string, messageText?: string) => {
    if (!phoneNumber) return

    const defaultMsg = messageText || `Hello! I visited your store "${store?.store_name}" on Strapre and would like to make an enquiry.`

    // Format phone number: remove all non-digits, replace local '0' prefix with '234'
    let cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.startsWith("0")) {
      cleaned = "234" + cleaned.substring(1)
    } else if (cleaned.length === 10 && !cleaned.startsWith("234")) {
      cleaned = "234" + cleaned
    }

    const encodedMsg = encodeURIComponent(defaultMsg)
    const whatsappUrl = `https://wa.me/${cleaned}?text=${encodedMsg}`
    window.open(whatsappUrl, "_blank")
  }

  // Copy Store Link to Clipboard
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  // Share store via social networks
  const handleSocialShare = (platform: string) => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : ""
    const shareText = `Check out the products from "${store?.store_name}" on Strapre!`
    
    let url = ""
    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`
        break
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`
        break
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
        break
      default:
        return
    }
    
    window.open(url, "_blank")
    setShowShareDialog(false)
  }

  const formatPrice = (price: any) => {
    if (price === null || price === undefined) return "₦0"
    const numPrice = typeof price === "number" ? price : Number.parseFloat(price)
    if (isNaN(numPrice)) return "₦0"
    return `₦${numPrice.toLocaleString()}`
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long" })
  }

  // Error/404 view
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Header />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="border border-gray-100 shadow-xl rounded-2xl p-8 text-center bg-white">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-[#CB0207]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {error} This store may have been deactivated or approved settings have changed.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-[#CB0207] hover:bg-[#A50206] text-white rounded-xl px-6 w-full py-6 font-bold"
            >
              Back to Home Page
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Header />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8 animate-pulse">
          {/* Skeleton Hero Banner */}
          <div className="h-48 md:h-64 bg-gray-200 rounded-2xl"></div>

          {/* Skeleton Profile Details */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-20 md:-mt-24 px-4 md:px-8">
            <div className="w-32 h-32 md:w-36 md:h-36 bg-gray-300 rounded-full border-4 border-white shadow"></div>
            <div className="flex-1 text-center md:text-left space-y-3 pt-24 md:pt-28">
              <div className="h-7 bg-gray-300 rounded w-1/3 mx-auto md:mx-0"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto md:mx-0"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto md:mx-0"></div>
            </div>
          </div>

          {/* Skeleton Products Filter and Grid */}
          <div className="space-y-6 pt-8">
            <div className="flex justify-between items-center h-12 bg-gray-200 rounded px-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden h-80 space-y-4 p-4">
                  <div className="bg-gray-200 h-40 rounded-lg"></div>
                  <div className="h-5 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-10 bg-gray-300 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Store profile view
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        
        {/* Back navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-white/80 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to previous page
          </Button>
        </div>

        {/* Premium Dual-Column Desktop / Mobile Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Column: Vendor Profile Details Sidebar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:sticky lg:top-24">
              
              {/* Header Cover inside card */}
              <div className="h-28 bg-gradient-to-r from-orange-400 via-[#CB0207] to-purple-900 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 rounded-full bg-white/20 hover:bg-white/40 text-white h-9 w-9 backdrop-blur-sm shadow border border-white/5"
                  onClick={() => setShowShareDialog(true)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="px-6 pb-6 relative">
                
                {/* Floating Avatar overlapping cover banner */}
                <div className="flex justify-center -mt-12 mb-4">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-md bg-white rounded-full overflow-hidden relative">
                    <AvatarImage
                      src={getCorrectImageUrl(store?.store_image)}
                      alt={store?.store_name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-100 text-gray-500 font-bold text-2xl">
                      {store?.store_name ? store.store_name.charAt(0).toUpperCase() : "S"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Seller Name and Verification */}
                <div className="text-center space-y-2">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
                      {store?.store_name}
                    </h1>
                    <span className="inline-flex items-center justify-center bg-green-50 border border-green-200 text-green-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      Verified Seller
                    </span>
                  </div>

                  {/* Icon Metadata details */}
                  <div className="flex flex-col items-center gap-2 pt-3 text-xs text-gray-600 border-t border-gray-50 mt-3">
                    {/* Location Pin */}
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#CB0207] flex-shrink-0" />
                      <span className="font-medium text-gray-800">
                        {store?.store_lga && `${store.store_lga}, `}
                        {store?.store_state || "Nigeria"}
                      </span>
                    </div>

                    {/* Member Since calendar */}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#CB0207] flex-shrink-0" />
                      <span>Member since {store?.created_at ? formatDate(store.created_at) : "2024"}</span>
                    </div>

                    {/* Products active shopping bag */}
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="h-3.5 w-3.5 text-[#CB0207] flex-shrink-0" />
                      <span>{totalProducts} Active Listings</span>
                    </div>
                  </div>
                </div>

                {/* About and Bio section */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-left space-y-2">
                  <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">About Seller</h3>
                  <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">
                    {store?.store_description}
                  </p>
                  {store?.address && (
                    <div className="text-[11px] text-gray-500 pt-1 leading-snug">
                      <span className="font-semibold text-gray-700">Address:</span> {store.address}
                    </div>
                  )}
                </div>

                {/* Message Seller CTA Button Only */}
                <div className="mt-6 pt-4">
                  <Button
                    onClick={() => handleWhatsAppChat(store?.phone || "")}
                    disabled={!store?.phone}
                    className="w-full bg-[#25D366] hover:bg-[#1C8C4E] text-white rounded-xl h-11 flex items-center justify-center gap-2 font-bold shadow transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message Seller
                  </Button>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Store Catalog Section */}
          <div className="lg:col-span-3">
            <div id="store-catalog-section" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative">
              
              {/* Overlay loader */}
              {productsLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 rounded-2xl flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-[#CB0207] animate-spin" />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Products Catalog</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Showing {filteredProducts.length} of {totalProducts} items
                  </p>
                </div>

                {/* Search and Sort controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
                  
                  {/* Search within Store */}
                  <div className="relative flex-1 sm:w-60">
                    <Input
                      type="text"
                      placeholder="Search store items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>

                  {/* Sort Selector */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-44 rounded-xl border-gray-200 bg-gray-50">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="name_asc">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>

                </div>
              </div>

              {/* Products Catalog Display Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800 text-lg">No products found</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto mt-1">
                    {searchQuery
                      ? "No products inside this store catalog matched your search term."
                      : "This seller hasn't listed any products yet."}
                  </p>
                  {searchQuery && (
                    <Button
                      onClick={() => setSearchQuery("")}
                      variant="outline"
                      className="mt-4 rounded-xl"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-2">
                    {filteredProducts.map((product) => {
                      const productUrl = `/product/${product.slug}`
                      
                      return (
                        <div key={product.id} className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group pb-3">
                          <Link href={productUrl} className="block">
                            {/* Product Image Area */}
                            <div className="relative w-full h-32 md:h-48 bg-gray-50 overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={getCorrectImageUrl(product.images[0].url)}
                                  alt={product.name || "Product Image"}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=200&width=200"
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <span className="text-gray-400 text-xs">No Image</span>
                                </div>
                              )}
                            </div>

                            {/* Simplified Card Content: Product Name and Price Only */}
                            <div className="p-3 space-y-2">
                              {/* Product Name */}
                              <h3 className="font-semibold text-xs md:text-sm line-clamp-2 text-gray-800 group-hover:text-[#CB0207] transition-colors leading-tight">
                                {product.name || "Product Name"}
                              </h3>

                              {/* Price */}
                              <div className="pt-1">
                                <span className="font-bold text-sm md:text-base text-[#CB0207]">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      )
                    })}
                  </div>

                  {/* Dynamic Page Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-100">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || productsLoading}
                        className="rounded-xl px-4 py-2 border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold disabled:opacity-50"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1 mx-2">
                        {Array.from({ length: totalPages }).map((_, idx) => {
                          const pageNum = idx + 1
                          const isCurrent = pageNum === currentPage
                          return (
                            <Button
                              key={pageNum}
                              variant={isCurrent ? "default" : "outline"}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={productsLoading}
                              className={`w-8 h-8 rounded-lg p-0 text-xs font-bold transition-all ${
                                isCurrent
                                  ? "bg-[#CB0207] hover:bg-[#A50206] text-white shadow-sm"
                                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || productsLoading}
                        className="rounded-xl px-4 py-2 border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold disabled:opacity-50"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Share Modal Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-lg font-bold text-gray-900">
              Share Store Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <p className="text-sm text-gray-500">
              Share this store link with friends and customers to showcase their catalog.
            </p>

            {/* Social icons layout */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col gap-2 h-20 rounded-xl hover:bg-green-50 hover:border-green-300"
                onClick={() => handleSocialShare("whatsapp")}
              >
                <MessageCircle className="h-5 w-5 text-[#25D366] fill-current" />
                <span className="text-xs font-semibold">WhatsApp</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col gap-2 h-20 rounded-xl hover:bg-blue-50 hover:border-blue-300"
                onClick={() => handleSocialShare("facebook")}
              >
                <span className="h-5 w-5 font-extrabold text-[#1877F2] text-lg leading-none">f</span>
                <span className="text-xs font-semibold">Facebook</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col gap-2 h-20 rounded-xl hover:bg-sky-50 hover:border-sky-300"
                onClick={() => handleSocialShare("twitter")}
              >
                <span className="h-5 w-5 font-extrabold text-black text-lg leading-none">𝕏</span>
                <span className="text-xs font-semibold">Twitter</span>
              </Button>
            </div>

            {/* Direct Copy Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  className="pr-10 rounded-xl border-gray-200 bg-gray-50 text-xs select-all"
                />
              </div>
              <Button
                onClick={handleCopyLink}
                className="bg-[#CB0207] hover:bg-[#A50206] text-white rounded-xl px-4 text-xs font-bold"
              >
                {copiedLink ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-4 w-4" /> Copied!
                  </span>
                ) : (
                  "Copy Link"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
