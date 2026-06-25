"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Filter, ChevronRight, Heart, X, MapPin, DollarSign, Star, ChevronLeft, Share2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ENDPOINTS, authHeaders, authJsonHeaders, IMAGE_BASE_URL, getCorrectImageUrl } from "@/lib/api"

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
  phone?: string
}

interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  short_description?: string
  description: string
  specifications: string[]
  brand: string
  price: string
  wholesale_price: string
  images: ProductImage[]
  video_url?: string | null
  store: ProductStore
  created_at: string
  is_featured: number
  average_rating: number
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

interface Advert {
  id: string
  store_id: string | null
  state_id: string
  title: string
  link: string
  starts_at: string
  ends_at: string
  image_media_url?: string
  image_url?: string | null
  is_dummy?: number
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

interface TikTokVideoPlayerProps {
  src: string
  isActive: boolean
}

function TikTokVideoPlayer({ src, isActive }: TikTokVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!videoRef.current) return
    if (isActive) {
      videoRef.current.play().catch((err) => console.log("Autoplay blocked:", err))
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [isActive])

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      className="w-full h-full object-contain"
    />
  )
}

interface ProductMediaSliderProps {
  product: Product
  activeIndex: number
  onIndexChange: (index: number) => void
  isParentActive: boolean
}

function ProductMediaSlider({ product, activeIndex, onIndexChange, isParentActive }: ProductMediaSliderProps) {
  const hasVideo = !!product.video_url
  const totalSlides = (hasVideo ? 1 : 0) + product.images.length

  const touchStartRef = useRef({ x: 0, y: 0 })
  const isHorizontalSwipeRef = useRef<boolean | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    isHorizontalSwipeRef.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isHorizontalSwipeRef.current === false) return

    const diffX = e.touches[0].clientX - touchStartRef.current.x
    const diffY = e.touches[0].clientY - touchStartRef.current.y

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > Math.abs(diffY) + 5) {
        isHorizontalSwipeRef.current = true
      } else if (Math.abs(diffY) > Math.abs(diffX) + 5) {
        isHorizontalSwipeRef.current = false
      }
    }

    if (isHorizontalSwipeRef.current) {
      if (e.cancelable) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isHorizontalSwipeRef.current) {
      const diffX = e.changedTouches[0].clientX - touchStartRef.current.x
      const swipeThreshold = 50

      if (diffX < -swipeThreshold) {
        if (activeIndex < totalSlides - 1) {
          onIndexChange(activeIndex + 1)
        }
      } else if (diffX > swipeThreshold) {
        if (activeIndex > 0) {
          onIndexChange(activeIndex - 1)
        }
      }
    }
    isHorizontalSwipeRef.current = null
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (activeIndex > 0) {
      onIndexChange(activeIndex - 1)
    }
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (activeIndex < totalSlides - 1) {
      onIndexChange(activeIndex + 1)
    }
  }

  return (
    <div
      className="w-full h-full overflow-hidden relative bg-black select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Video Slide (if present, rendered at index 0) */}
      {hasVideo && (
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${-activeIndex * 100}%)` }}
        >
          <Link
            href={`/product/${product.slug}`}
            className="absolute inset-0 w-full h-full flex items-center justify-center"
          >
            <TikTokVideoPlayer
              src={product.video_url!}
              isActive={isParentActive && activeIndex === 0}
            />
          </Link>
        </div>
      )}

      {/* 2. Image Slides */}
      {product.images.map((image, imgIdx) => {
        const slideIndex = hasVideo ? imgIdx + 1 : imgIdx
        return (
          <div
            key={image.id || imgIdx}
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${(slideIndex - activeIndex) * 100}%)` }}
          >
            <Link
              href={`/product/${product.slug}`}
              className="absolute inset-0 w-full h-full flex items-center justify-center"
            >
              <img
                src={getCorrectImageUrl(image.url)}
                alt={`${product.name} - Image ${imgIdx + 1}`}
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable="false"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=400&width=400"
                }}
              />
            </Link>
          </div>
        )
      })}

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          {activeIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all backdrop-blur-sm active:scale-90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {activeIndex < totalSlides - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all backdrop-blur-sm active:scale-90"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </>
      )}
    </div>
  )
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
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [filterState, setFilterState] = useState("")
  const [filterLGA, setFilterLGA] = useState("")
  const [useUserLocation, setUseUserLocation] = useState(true)
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
  const [adverts, setAdverts] = useState<Advert[]>([])
  const [advertsLoading, setAdvertsLoading] = useState(true)

  // Mobile/Feed states
  const [isMobile, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState<"feed" | "grid" | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [selectedDescProduct, setSelectedDescProduct] = useState<Product | null>(null)
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({})
  const feedContainerRef = useRef<HTMLDivElement | null>(null)
  const handleHorizontalScroll = (productId: string, e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const index = Math.round(container.scrollLeft / container.clientWidth)
    setActiveImageIndices((prev) => ({ ...prev, [productId]: index }))
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    setViewMode(isMobile ? "feed" : "grid")
  }, [isMobile])



  // Smart Pagination Logic - Mobile Optimized with better page visibility
  const generateSmartPagination = () => {
    const pages = []
    const totalPagesNum = totalPages
    const currentPageNum = currentPage

    if (totalPagesNum <= 5) {
      // If total pages is 5 or less, show all pages
      for (let i = 1; i <= totalPagesNum; i++) {
        pages.push(i)
      }
    } else {
      // Always show page 1
      pages.push(1)

      if (currentPageNum <= 3) {
        // Near the beginning: 1 2 3 4 ... last
        for (let i = 2; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPagesNum)
      } else if (currentPageNum >= totalPagesNum - 2) {
        // Near the end: 1 ... (last-3) (last-2) (last-1) last
        pages.push('...')
        for (let i = totalPagesNum - 3; i <= totalPagesNum; i++) {
          pages.push(i)
        }
      } else {
        // In the middle: 1 ... (current-1) current (current+1) ... last
        pages.push('...')
        for (let i = currentPageNum - 1; i <= currentPageNum + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPagesNum)
      }
    }

    // Remove duplicates and sort
    return [...new Set(pages)].sort((a, b) => {
      if (a === '...' || b === '...') return 0
      return Number(a) - Number(b)
    })
  }

  // Helper function to handle page navigation
  const handleSmartPageChange = (page: number | string) => {
    if (isSearchActive) {
      const searchParams: {
        search?: string
        min_price?: string
        max_price?: string
        state_id?: string
      } = {}
      if (searchQuery.trim()) searchParams.search = searchQuery.trim()
      if (minAmount) searchParams.min_price = minAmount
      if (maxAmount) searchParams.max_price = maxAmount
      if (isAuthenticated && useUserLocation && userProfile?.state_id) {
        searchParams.state_id = userProfile.state_id
      } else if (filterState) {
        searchParams.state_id = filterState
      }
      searchProducts(Number(page), searchParams)
    } else {
      fetchProducts(Number(page))
    }
  }

  // Add function to fetch adverts
  const fetchAdverts = async () => {
    try {
      setAdvertsLoading(true)
      const response = await fetch(ENDPOINTS.advertsDummy, {
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAdverts(Array.isArray(data.data) ? data.data : [])
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
            image_media_url: "/strapre-hero.png",
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
            image_media_url: "/strapre-hero1.jpg",
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
          image_media_url: "/strapre-hero.png",
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
    fetchAdverts()
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
      const response = await fetch(ENDPOINTS.getProfile, {
        headers: authHeaders(token),
      })
      if (response.status === 401) {
        router.push("/login")
        return
      }
      const data = await response.json()
      if (response.ok) {
        setUserProfile(data.data)
        localStorage.setItem("userDetails", JSON.stringify(data.data))
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
    if (adverts && adverts.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % adverts.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [adverts?.length])

  // Helper function to handle advert clicks
  const handleAdvertClick = (advert: Advert) => {
    if (advert.link && advert.link !== "#" && advert.link !== "https://strapre.com") {
      window.open(advert.link, "_blank")
    }
  }

  const fetchUserStore = async (token: string) => {
    try {
      const response = await fetch(ENDPOINTS.myStore, {
        headers: authHeaders(token),
      })
      if (response.ok) {
        const data = await response.json()
        setUserStore(data)
        localStorage.setItem("userStore", JSON.stringify(data))
      }
    } catch (error) {
      console.error("Error fetching user store:", error)
    }
  }

  // Wishlist functions
  const fetchWishlist = async (token: string) => {
    try {
      const response = await fetch(ENDPOINTS.wishlist, {
        headers: authHeaders(token),
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
      const response = await fetch(ENDPOINTS.wishlist, {
        method: "POST",
        headers: authJsonHeaders(token),
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
      const response = await fetch(ENDPOINTS.removeWishlist(productId), {
        method: "DELETE",
        headers: authHeaders(token),
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
      const response = await fetch(ENDPOINTS.categories)
      const data: ApiResponse<Category> = await response.json()
      setCategories(Array.isArray(data.data) ? data.data : [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchStates = async () => {
    try {
      const response = await fetch(ENDPOINTS.states)
      const data: ApiResponse<State> = await response.json()
      const statesArray = Array.isArray(data.data) ? data.data : []
      const sortedStates = statesArray.sort((a, b) => a.name.localeCompare(b.name))
      setStates(sortedStates)
    } catch (error) {
      console.error("Error fetching states:", error)
    }
  }

  const fetchLGAs = async (stateSlug: string) => {
    try {
      const response = await fetch(ENDPOINTS.lgasByState(stateSlug))
      const data: ApiResponse<LGA> = await response.json()
      const lgasArray = Array.isArray(data.data) ? data.data : []
      const sortedLGAs = lgasArray.sort((a, b) => a.name.localeCompare(b.name))
      setLgas(sortedLGAs)
    } catch (error) {
      console.error("Error fetching LGAs:", error)
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
    if (page === 1) {
      setActiveIndex(0)
    }
    try {
      const params = new URLSearchParams()
      params.append("page", page.toString())
      if (searchParams.search) params.append("search", searchParams.search)
      if (searchParams.min_price) params.append("min_price", searchParams.min_price)
      if (searchParams.max_price) params.append("max_price", searchParams.max_price)
      if (searchParams.state_id) params.append("state_id", searchParams.state_id)

      const url = `${ENDPOINTS.searchProducts}?${params.toString()}`
      const response = await fetch(url)
      const data: ApiResponse<Product> = await response.json()
      console.log("=== SEARCH PRODUCTS RESPONSE ===", data)
      setProducts(Array.isArray(data.data) ? data.data : [])
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

  const fetchProducts = async (page = 1) => {
    setLoading(true)
    if (page === 1) {
      setActiveIndex(0)
    }
    try {
      const params = new URLSearchParams({ page: page.toString() })
      if (selectedState) params.append("state_id", selectedState.id)
      if (selectedLGA) params.append("lga_id", selectedLGA.id)

      const response = await fetch(`${ENDPOINTS.products}?${params.toString()}`)
      const data: ApiResponse<Product> = await response.json()
      console.log("=== FETCH PRODUCTS RESPONSE ===", data)
      setProducts(Array.isArray(data.data) ? data.data : [])
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

  const loadNextPage = async () => {
    if (loadingMore || currentPage >= totalPages) return
    setLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      const params = new URLSearchParams({ page: nextPage.toString() })
      
      let url = ""
      if (isSearchActive) {
        if (searchQuery.trim()) params.append("search", searchQuery.trim())
        if (minAmount) params.append("min_price", minAmount)
        if (maxAmount) params.append("max_price", maxAmount)
        if (isAuthenticated && useUserLocation && userProfile?.state_id) {
          params.append("state_id", userProfile.state_id)
        } else if (filterState) {
          params.append("state_id", filterState)
        }
        url = `${ENDPOINTS.searchProducts}?${params.toString()}`
      } else {
        if (selectedState) params.append("state_id", selectedState.id)
        if (selectedLGA) params.append("lga_id", selectedLGA.id)
        url = `${ENDPOINTS.products}?${params.toString()}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data: ApiResponse<Product> = await response.json()
        console.log("=== LOAD NEXT PAGE RESPONSE ===", data)
        const newProducts = Array.isArray(data.data) ? data.data : []
        if (newProducts.length > 0) {
          setProducts((prev) => [...prev, ...newProducts])
        }
        if (data.meta) {
          setCurrentPage(data.meta.current_page)
        }
      }
    } catch (error) {
      console.error("Error loading next page for TikTok feed:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleTikTokScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const index = Math.round(container.scrollTop / container.clientHeight)
    if (index !== activeIndex) {
      setActiveIndex(index)
    }
    
    const threshold = container.scrollHeight - container.clientHeight * 1.5
    if (container.scrollTop >= threshold && currentPage < totalPages && !loadingMore) {
      loadNextPage()
    }
  }

  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price)
    return `₦${numPrice.toLocaleString()}`
  }

  const handleStateChange = (state: State | null) => {
    setSelectedState(state)
  }

  const handleLGAChange = (lga: LGA | null) => {
    setSelectedLGA(lga)
  }

  // Updated search function for search bar
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const searchParams: any = { search: searchQuery.trim() }
      if (isAuthenticated && useUserLocation && userProfile?.state_id) {
        searchParams.state_id = userProfile.state_id
      }
      searchProducts(1, searchParams)
      setIsSearchActive(true) // Add this line
    } else {
      fetchProducts(1)
      setIsSearchActive(false) // Add this line
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

    // Check if any filters are active
    const hasActiveFilters = Object.keys(searchParams).length > 0

    if (hasActiveFilters) {
      searchProducts(1, searchParams)
      setIsSearchActive(true) // Add this line
    } else {
      fetchProducts(1)
      setIsSearchActive(false) // Add this line
    }

    setShowFilterDialog(false)
  }

  // Add new function to return to all products
  const returnToAllProducts = () => {
    setSearchQuery("")
    setMinAmount("")
    setMaxAmount("")
    setFilterState("")
    setFilterLGA("")
    setUseUserLocation(true)
    setIsSearchActive(false)
    fetchProducts(1)
  }

  const clearFilters = () => {
    setFilterState("")
    setFilterLGA("")
    setMinAmount("")
    setMaxAmount("")
    setSearchQuery("")
    setUseUserLocation(true)
    setIsSearchActive(false)
    fetchProducts(1)
  }

  // Update the Hero Section JSX
  const renderHeroSection = () => {
    if (advertsLoading) {
      return (
        <div className="relative rounded-lg p-8 mb-4 md:mb-8 overflow-hidden h-[145px] md:h-[400px] bg-gray-200 animate-pulse">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB0207] border-t-transparent"></div>
          </div>
        </div>
      )
    }
    if (!adverts || adverts.length === 0) {
      return (
        <div className="relative rounded-lg p-8 mb-4 md:mb-8 overflow-hidden h-[145px] md:h-[400px] bg-gray-200">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No adverts available</p>
          </div>
        </div>
      )
    }
    const currentAdvert = adverts[currentSlide]

    return (
      <div
        className="relative rounded-lg p-8 mb-4 md:mb-8 overflow-hidden bg-cover bg-center h-[145px] md:h-[400px] transition-all duration-500 cursor-pointer"
        style={{ backgroundImage: `url(${getCorrectImageUrl(currentAdvert.image_media_url || currentAdvert.image_url)})` }}
        onClick={() => handleAdvertClick(currentAdvert)}
      >


        {/* Navigation Arrows */}
        {adverts && adverts.length > 1 && (
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
          {(adverts || []).map((_, index) => (
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
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col relative ${
      isMobile && viewMode === "feed" ? "h-dvh overflow-hidden" : "min-h-screen"
    }`}>
      {/* Header Component */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        showStateSelectors={true}
        selectedState={selectedState}
        selectedLGA={selectedLGA}
        onStateChange={handleStateChange}
        onLGAChange={handleLGAChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Toast Message notification popup */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[9999] bg-black/85 text-white px-4 py-2 rounded-xl text-sm shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          {toastMessage}
        </div>
      )}

      {/* Main Content Layout */}
      {isMobile && viewMode === "feed" ? (
        /* TikTok style feed on Mobile */
        <div 
          className="w-full bg-black relative overflow-hidden flex-1" 
          style={{ height: "calc(100dvh - 7.5rem)" }}
        >

          {loading && products.length === 0 ? (
            <div className="flex h-full items-center justify-center bg-gray-950">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB0207] border-t-transparent"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-full items-center justify-center bg-gray-950 text-gray-400 px-4 text-center">
              <div>
                <p className="text-lg font-semibold mb-2">No products found</p>
                <p className="text-sm mb-4">Try clearing filters or checking other states.</p>
                {isSearchActive && (
                  <Button
                    variant="outline"
                    className="border-[#CB0207] text-[#CB0207] hover:bg-[#CB0207] hover:text-white"
                    onClick={returnToAllProducts}
                  >
                    Reset Search
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div 
              ref={feedContainerRef}
              className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar"
              onScroll={handleTikTokScroll}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((product, idx) => (
                <div 
                  key={`${product.id}-${idx}`}
                  className="snap-start snap-always w-full relative overflow-hidden flex flex-col justify-between bg-gray-950"
                  style={{ height: "calc(100dvh - 7.5rem)" }}
                >
                  {/* Media Content - Play video and/or show image gallery in a unified swiper */}
                  {product.video_url || product.images.length > 0 ? (
                    <div className="absolute inset-0 w-full h-full z-10">
                      <ProductMediaSlider
                        product={product}
                        activeIndex={activeImageIndices[product.id] || 0}
                        onIndexChange={(index) => {
                          setActiveImageIndices((prev) => ({ ...prev, [product.id]: index }))
                        }}
                        isParentActive={idx === activeIndex}
                      />

                      {/* Horizontal Slide Indicators (Dots) */}
                      {((product.video_url ? 1 : 0) + product.images.length) > 1 && (
                        <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1.5 bg-black/35 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5">
                          {Array.from({ length: (product.video_url ? 1 : 0) + product.images.length }).map((_, slideIdx) => {
                            const isActive = (activeImageIndices[product.id] || 0) === slideIdx
                            return (
                              <span
                                key={slideIdx}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                  isActive ? "bg-[#CB0207] w-3" : "bg-white/50"
                                }`}
                              />
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center bg-black text-gray-500">
                      No Image
                    </div>
                  )}

                  {/* Vignette Overlay for TikTok readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-5 pointer-events-none" />

                  {/* Floating Action Buttons (Right Side) */}
                  <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center space-y-4">
                    {/* Wishlist Button */}
                    {isAuthenticated && (
                      <div className="flex flex-col items-center">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleWishlist(product.id)
                          }}
                          disabled={wishlistLoading.includes(product.id)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-all active:scale-90 ${
                            wishlistItems.includes(product.id)
                              ? "bg-red-500 text-white border-red-400"
                              : "bg-black/45 text-white"
                          }`}
                        >
                          {wishlistLoading.includes(product.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                          ) : (
                            <Heart className={`h-5 w-5 ${wishlistItems.includes(product.id) ? "fill-current" : ""}`} />
                          )}
                        </button>
                        <span className="text-white text-[9px] font-semibold mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-center max-w-[65px] leading-tight select-none">
                          Add to wishlist
                        </span>
                      </div>
                    )}

                    {/* WhatsApp Support Button */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const phone = product.store?.phone || "2348129769093"
                          const text = encodeURIComponent(`Hello, I'm interested in purchasing your product: "${product.name}" listed on Strapre. Link: https://strapre.com/product/${product.slug}`)
                          const url = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${text}`
                          window.open(url, "_blank")
                        }}
                        className="w-10 h-10 rounded-full bg-black/45 text-white hover:text-gray-200 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg transition-all active:scale-90"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.86.002-2.637-1.019-5.115-2.875-6.973-1.857-1.859-4.325-2.883-6.963-2.885-5.437 0-9.86 4.42-9.865 9.86-.001 1.772.482 3.502 1.398 5.027l-.95 3.473 3.566-.936zm10.748-6.195c-.3-.15-1.774-.875-2.049-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.492-.893-.797-1.496-1.782-1.671-2.082-.175-.3-.019-.462.13-.61l.448-.522c.15-.175.2-.3.3-.5s.05-.375-.025-.525C8.908 6.84 8.243 5.2 7.968 4.525c-.267-.643-.538-.556-.738-.566-.19-.009-.408-.01-.627-.01-.219 0-.575.083-.875.409-.3.325-1.15 1.125-1.15 2.741 0 1.617 1.175 3.178 1.338 3.4.162.223 2.312 3.53 5.6 4.95.782.338 1.39.54 1.868.692.788.25 1.503.214 2.07.129.631-.095 1.775-.725 2.025-1.425.25-.7.25-1.3 0-1.425-.075-.125-.275-.2-.575-.35z" />
                        </svg>
                      </button>
                      <span className="text-white text-[9px] font-semibold mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-center select-none">
                        Chat
                      </span>
                    </div>

                    {/* Share Button */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const productUrl = `${window.location.origin}/product/${product.slug}`
                          if (navigator.share) {
                            navigator.share({
                              title: product.name,
                              text: `Check out ${product.name} on Strapre!`,
                              url: productUrl,
                            }).catch((err) => console.log(err))
                          } else {
                            navigator.clipboard.writeText(productUrl)
                            showToastMessage("Product link copied!")
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-black/45 text-white border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg transition-all active:scale-90"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                      <span className="text-white text-[9px] font-semibold mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-center select-none">
                        Share
                      </span>
                    </div>
                  </div>

                  {/* Bottom Product Details Overlay */}
                  <div className="w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-8 pb-1.5 px-3 z-20 absolute bottom-0 left-0 right-0">
                    <div className="max-w-xl space-y-1.5">
                      {/* Store Profile & Location */}
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#CB0207] text-white font-bold flex items-center justify-center shadow-md border border-white/10 text-xs">
                          {product.store?.name?.substring(0, 2).toUpperCase() || "ST"}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs hover:underline cursor-pointer">
                            {product.store?.name || "Anonymous Store"}
                          </p>
                          <p className="text-gray-300 text-[10px] flex items-center">
                            <MapPin className="h-2.5 w-2.5 mr-0.5 text-red-500" />
                            {product.store?.store_lga || "N/A"}, {product.store?.store_state || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h2 className="text-white text-xs font-normal line-clamp-1 leading-tight">
                        {product.name}
                      </h2>

                      {/* Short Description */}
                      {product.short_description && (
                        <p 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedDescProduct(product)
                          }}
                          className="text-gray-300 text-[11px] line-clamp-2 leading-snug cursor-pointer hover:text-white transition-colors underline decoration-dotted decoration-white/30"
                        >
                          {product.short_description}
                        </p>
                      )}

                      {/* Rating and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-0.5">
                          {Array.from({ length: 5 }, (_, i) => {
                            const rating = product.average_rating || 0
                            return (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(rating) 
                                    ? "fill-yellow-400 stroke-yellow-400" 
                                    : "stroke-gray-400"
                                }`} 
                              />
                            )
                          })}
                          <span className="text-gray-300 text-[10px] ml-1">({product.average_rating || 0})</span>
                        </div>
                        <span className="text-base font-bold text-yellow-400">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      {/* Call-to-action button */}
                      <Link href={`/product/${product.slug}`} className="block pt-0.5">
                        <Button className="w-full h-8 bg-[#CB0207] hover:bg-[#A50206] text-white rounded-lg font-semibold shadow-lg transition-all active:scale-95 text-xs py-1">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Endless Scroll Loading Indicator */}
              {loadingMore && (
                <div className="snap-start snap-always h-full w-full bg-gray-950 flex flex-col items-center justify-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#CB0207] border-t-transparent mb-3" />
                  <p className="text-sm font-medium">Loading more products...</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Render Classic Grid or Desktop Layout */
        <div
          className={`${isAuthenticated ? "w-full md:w-[90%] md:max-w-[1750px]" : "w-full md:w-[90%] md:max-w-[1750px]"
            } mx-auto px-2 sm:px-6 lg:px-8 py-6`}
        >
          <div className="flex gap-6">
            {/* Sidebar - Desktop Only */}
            <aside className="hidden md:block w-72">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
                <h3 className="font-bold text-xl mb-6 text-gray-800">All Categories</h3>
                <div className="space-y-1">
                  {(categories || []).slice(0, 20).map((category) => (
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
              {renderHeroSection()}

              {/* Products Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 md:p-8">
                <div className="flex items-center justify-between mb-4 md:mb-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                      {isAuthenticated ? "Products" : "🔥 Hot Sales"}
                    </h2>
                    {isSearchActive && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border-2 border-[#CB0207] text-[8px] md:text-[12px] text-[#CB0207] hover:bg-[#CB0207] hover:text-white rounded-xl px-2 py-2 font-medium transition-all duration-300 bg-transparent"
                        onClick={returnToAllProducts}
                      >
                        <ChevronLeft className="h-[5px] md:h-4 w-[5px] md:w-4" />
                        Back to All Products
                      </Button>
                    )}
                  </div>
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
                    {(products || []).map((product) => (
                      <div key={product.id} className="relative">
                        <Link href={`/product/${product.slug}`}>
                          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-lg card-hover rounded-xl">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-32 md:h-48 relative">
                              {product.images.length > 0 ? (
                                <Image
                                  src={getCorrectImageUrl(product.images[0].url)}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                  quality={50}
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
                                <span className="font-bold text-[12px] md:text-lg text-[#CB0207]">
                                  {formatPrice(product.price)}
                                </span>
                                {product.is_featured === 1 && (
                                  <span className="bg-[#CB0207] text-white text-xs px-2 py-1 rounded-lg font-medium">
                                    Ad
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {product.store?.store_lga || "N/A"}, {product.store?.store_state || "N/A"}
                              </p>
                              <div className="flex items-center gap-0 mt-2">
                                {Array.from({ length: 5 }, (_, i) => {
                                  const rating = product.average_rating || 0
                                  const fullStar = i < Math.floor(rating)
                                  const halfStar = i < rating && i >= Math.floor(rating)
                                  return (
                                    <span key={i} className="text-yellow-400">
                                      {fullStar ? (
                                        <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                                      ) : halfStar ? (
                                        <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400 opacity-50" />
                                      ) : (
                                        <Star className="w-3 h-3 stroke-gray-300" />
                                      )}
                                    </span>
                                  )
                                })}
                                <span className="text-xs text-gray-600 ml-1">({product.average_rating || 0})</span>
                              </div>
                              <p className="text-gray-500 text-xs flex items-center mt-2 space-x-1">
                                <span>Store:</span>
                                <span>{product.store?.name || "N/A"}</span>
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                        {/* Wishlist Heart Button - Only for logged in users */}
                        {isAuthenticated && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`absolute top-2 right-2 z-10 rounded-full w-8 h-8 ${wishlistItems.includes(product.id)
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

                {/* Smart Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    {/* Previous Button - Icon Only */}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => handleSmartPageChange(currentPage - 1)}
                      className="rounded-xl border-2 border-gray-200 font-medium bg-transparent hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed p-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Smart Page Numbers */}
                    {generateSmartPagination().map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400 font-medium select-none">
                            ...
                          </span>
                        )
                      }

                      return (
                        <Button
                          key={page}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSmartPageChange(Number(page))}
                          className={`rounded-xl border-2 font-medium min-w-[40px] transition-all duration-200 ${currentPage === Number(page)
                            ? "bg-[#CB0207] text-white border-[#CB0207] shadow-md"
                            : "border-gray-200 bg-transparent hover:bg-gray-50 hover:border-gray-300"
                            }`}
                        >
                          {page}
                        </Button>
                      )
                    })}

                    {/* Next Button - Icon Only */}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handleSmartPageChange(currentPage + 1)}
                      className="rounded-xl border-2 border-gray-200 font-medium bg-transparent hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed p-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
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
      )}

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
            {/* Location Section for Logged In Users */}
            {isAuthenticated && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-[#CB0207]" />
                  <h3 className="font-semibold text-lg text-gray-800">Location Preference</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="useUserLocation"
                      name="locationPreference"
                      checked={useUserLocation}
                      onChange={() => setUseUserLocation(true)}
                      className="text-[#CB0207] focus:ring-[#CB0207]"
                    />
                    <label htmlFor="useUserLocation" className="text-sm font-medium">
                      Use my location {userProfile?.state_id ? "(from profile)" : "(not set)"}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="selectCustomLocation"
                      name="locationPreference"
                      checked={!useUserLocation}
                      onChange={() => setUseUserLocation(false)}
                      className="text-[#CB0207] focus:ring-[#CB0207]"
                    />
                    <label htmlFor="selectCustomLocation" className="text-sm font-medium">
                      Select different location
                    </label>
                  </div>
                  {!useUserLocation && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
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
                  )}
                </div>
              </div>
            )}
            {/* Location Section for Non-Logged In Users */}
            {!isAuthenticated && (
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
            )}
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

      {/* Product Description Modal */}
      <Dialog open={!!selectedDescProduct} onOpenChange={(open) => !open && setSelectedDescProduct(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl border-0 shadow-2xl bg-white text-gray-900">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-800">
                {selectedDescProduct?.name}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDescProduct(null)}
                className="rounded-xl hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            {selectedDescProduct?.short_description && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Short Description</h4>
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  {selectedDescProduct.short_description}
                </p>
              </div>
            )}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Description</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedDescProduct?.description}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      {!(isMobile && viewMode === "feed") && <Footer />}
    </div>
  )
}

export default function Page() {
  return <HomePage />
}
