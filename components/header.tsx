"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Menu, ChevronDown, ChevronRight, Heart, User, LogOut, WifiOff, X, Bell, Play, LayoutGrid, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ENDPOINTS, apiFetch, authHeaders, getCorrectImageUrl } from "@/lib/api"

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
  store_cac_image: string
  store_id_image: string
  email: string
  phone: string
  address: string
  state_id: string
  lga_id: string
  subscription_expires_at: string
  is_active: boolean
  status: string
  created_at: string
  updated_at: string
}

interface ApiResponse<T> {
  data: T[]
}

interface HeaderProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onSearch?: () => void
  showStateSelectors?: boolean
  selectedState?: State | null
  selectedLGA?: LGA | null
  onStateChange?: (state: State | null) => void
  onLGAChange?: (lga: LGA | null) => void
  viewMode?: "feed" | "grid" | null
  onViewModeChange?: (mode: "feed" | "grid") => void
}

// Network Error Popup Component
const NetworkErrorPopup = ({ isVisible, onClose, onRefresh }: {
  isVisible: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 duration-300">
      <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-[400px] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <WifiOff className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Network Error</p>
            <p className="text-xs opacity-90">Please check your connection and refresh</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-white hover:bg-red-600 text-xs px-2 py-1 h-auto"
          >
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-red-600 p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Header({
  searchQuery = "",
  onSearchChange,
  onSearch,
  showStateSelectors = false,
  selectedState = null,
  selectedLGA = null,
  onStateChange,
  onLGAChange,
  viewMode = null,
  onViewModeChange,
}: HeaderProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [states, setStates] = useState<State[]>([])
  const [lgas, setLgas] = useState<LGA[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStore, setUserStore] = useState<UserStore | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [internalSearchQuery, setInternalSearchQuery] = useState(searchQuery)
  const [networkError, setNetworkError] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const router = useRouter()

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setNetworkError(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setNetworkError(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial connection status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Enhanced fetch function with network error handling
  const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
    try {
      const response = await apiFetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response
    } catch (error) {
      console.error('Network error:', error)

      // Show network error popup for various error types
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setNetworkError(true)
      } else if (error instanceof Error && error.name === 'AbortError') {
        setNetworkError(true)
      } else if (error instanceof Error && error.message.includes('HTTP error')) {
        setNetworkError(true)
      }

      throw error
    }
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
    fetchCategories()
    fetchStates()
  }, [])

  // Fetch LGAs when state changes
  useEffect(() => {
    if (selectedState) {
      fetchLGAs(selectedState.slug)
    } else {
      setLgas([])
    }
  }, [selectedState])

  // Update internal search query when prop changes
  useEffect(() => {
    setInternalSearchQuery(searchQuery)
  }, [searchQuery])

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetchWithErrorHandling(ENDPOINTS.getProfile, {
        headers: authHeaders(token),
      })
      const data = await response.json()
      setUserProfile(data.data)
      localStorage.setItem("userDetails", JSON.stringify(data.data))
      if (!data.data.first_name) {
        router.push("/complete-profile")
        return
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchUserStore = async (token: string) => {
    try {
      const response = await fetchWithErrorHandling(ENDPOINTS.myStore, {
        headers: authHeaders(token),
      })
      const data = await response.json()
      setUserStore(data)
      localStorage.setItem("userStore", JSON.stringify(data))
    } catch (error) {
      console.error("Error fetching user store:", error)
    }
  }

  const fetchWishlist = async (token: string) => {
    try {
      const response = await fetchWithErrorHandling(ENDPOINTS.wishlist, {
        headers: authHeaders(token),
      })

      if (response.status === 401) {
        router.push('/login')
        return
      }

      const data = await response.json()
      const productIds = data.data?.map((item: any) => item.product_id) || []
      setWishlistItems(productIds)
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetchWithErrorHandling(ENDPOINTS.categories)
      const data: ApiResponse<Category> = await response.json()
      setCategories(data.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchStates = async () => {
    try {
      const response = await fetchWithErrorHandling(ENDPOINTS.states)
      const data: ApiResponse<State> = await response.json()
      const sortedStates = data.data.sort((a, b) => a.name.localeCompare(b.name))
      setStates(sortedStates)
    } catch (error) {
      console.error("Error fetching states:", error)
    }
  }

  const fetchLGAs = async (stateSlug: string) => {
    try {
      const response = await fetchWithErrorHandling(ENDPOINTS.lgasByState(stateSlug))
      const data: ApiResponse<LGA> = await response.json()
      const sortedLGAs = data.data.sort((a, b) => a.name.localeCompare(b.name))
      setLgas(sortedLGAs)
    } catch (error) {
      console.error("Error fetching LGAs:", error)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    setIsAuthenticated(false)
    setUserProfile(null)
    setUserStore(null)
    setWishlistItems([])
    router.push("/login")
  }

  const handleSearchChange = (value: string) => {
    setInternalSearchQuery(value)
    if (onSearchChange) {
      onSearchChange(value)
    }
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch()
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleStateChangeInternal = (value: string) => {
    if (value === "defaultState") {
      if (onStateChange) onStateChange(null)
    } else {
      const state = states.find((s) => s.id === value) || null
      if (onStateChange) onStateChange(state)
    }
  }

  const handleLGAChangeInternal = (value: string) => {
    if (value === "defaultLGA") {
      if (onLGAChange) onLGAChange(null)
    } else {
      const lga = lgas.find((l) => l.id === value) || null
      if (onLGAChange) onLGAChange(lga)
    }
  }

  const getUserInitials = () => {
    if (!userProfile || !userProfile.first_name || !userProfile.last_name) return "U"
    return `${userProfile.first_name[0]}${userProfile.last_name[0]}`
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const closeNetworkError = () => {
    setNetworkError(false)
  }

  return (
    <>
      {/* Network Error Popup */}
      <NetworkErrorPopup
        isVisible={networkError}
        onClose={closeNetworkError}
        onRefresh={handleRefresh}
      />

      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div
          className={`${isAuthenticated ? "max-w-[1500px]" : "w-full md:w-[90%] md:max-w-[1750px]"} mx-auto px-4 sm:px-6 lg:px-8`}
        >
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
                            src={getCorrectImageUrl(userProfile.profile_picture)}
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
                      {/* Home Page Link */}
                      <div className="mb-6">
                        <Link
                          href="/"
                          className="flex items-center space-x-3 py-3 px-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200 group"
                        >
                          <Home className="h-5 w-5 text-gray-500 group-hover:text-[#CB0207] transition-colors" />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-[#CB0207] transition-colors">
                            Home Page
                          </span>
                        </Link>
                      </div>

                      {/* State/LGA Selectors - Mobile */}
                      {showStateSelectors && (
                        <div className="mb-6 space-y-3">
                          <h3 className="font-bold text-xl text-gray-800">Location</h3>
                          <Select onValueChange={handleStateChangeInternal} value={selectedState?.id || "defaultState"}>
                            <SelectTrigger className="w-full rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12 text-gray-800">
                              <SelectValue placeholder="All States" />
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

                          <Select onValueChange={handleLGAChangeInternal} value={selectedLGA?.id || "defaultLGA"} disabled={!selectedState}>
                            <SelectTrigger className="w-full rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12 text-gray-800">
                              <SelectValue placeholder="All LGAs" />
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
                            window.open("https://wa.me/2348129769093?text=Hello%2C%20I%20need%20help%21", "_blank")
                          }}
                          className="py-3 px-4 text-sm cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium"
                        >
                          💬 Message Support
                        </div>
                      </div>
                    </div>
                    {isAuthenticated && (
                      <Button
                        onClick={() => {
                          if (userStore && Object.keys(userStore).length > 0) {
                            router.push("/my-store");
                          } else {
                            router.push("/create-store");
                          }
                        }}
                        className={`w-full ${userStore && Object.keys(userStore).length > 0
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-[#CB0207] hover:bg-[#A50206]"
                          } text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        {userStore && Object.keys(userStore).length > 0
                          ? "View My Store"
                          : "Become a Merchant"}
                      </Button>
                    )}

                    {isAuthenticated && <div className="h-4 text-white">Fill up</div>}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <div className="hidden md:flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-24 h-auto overflow-hidden flex items-center justify-center bg-white">
                  <img
                    src="/straprelogo.png"  // ⚠️ Also removed the extra space in filename
                    alt="Strapre Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="What are you looking for?"
                  value={internalSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
            {showStateSelectors && (
              <div className="hidden md:flex items-center space-x-3">
                <Select onValueChange={handleStateChangeInternal} value={selectedState?.id || "defaultState"}>
                  <SelectTrigger className="w-36 rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12 text-gray-800">
                    <SelectValue placeholder="All States" />
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

                <Select onValueChange={handleLGAChangeInternal} value={selectedLGA?.id || "defaultLGA"} disabled={!selectedState}>
                  <SelectTrigger className="w-36 rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12 text-gray-800">
                    <SelectValue placeholder="All LGAs" />
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
            )}



            {/* Login/Register Button (for non-authenticated users) */}
            {!isAuthenticated && (
              <Link href="/login">
                <Button className="bg-[#CB0207] hover:bg-[#A50206] text-white text-[10px] md:text-[12px] px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  LOGIN / REGISTER
                </Button>
              </Link>
            )}

            {/* Desktop User Actions (for authenticated users) */}
            {isAuthenticated && (
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
                          <AvatarImage src={getCorrectImageUrl(userProfile.profile_picture)} />
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
                      <DropdownMenuItem className="rounded-lg" onClick={() => router.push("/notifications")}>
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg" onClick={() => router.push("/profile")}>
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (userStore && Object.keys(userStore).length > 0) {
                            router.push("/my-store")
                          } else {
                            router.push("/create-store")
                          }
                        }}
                      >
                        <span className="h-4 w-4 mr-2">S</span>
                        {userStore && Object.keys(userStore).length > 0 ? "View My Store" : "Become a Merchant"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}

            {/* Mobile User Avatar (for authenticated users) */}
            {isAuthenticated && (
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100 rounded-xl"
                  onClick={() => router.push("/notifications")}
                >
                  <Bell className="h-7 w-7" />
                </Button>
                {userProfile && (
                  <div
                    onClick={() => router.push("/profile")}
                    className="cursor-pointer"
                    title="View Profile"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-[#CB0207]/20">
                      <AvatarImage src={getCorrectImageUrl(userProfile.profile_picture)} />
                      <AvatarFallback className="bg-[#CB0207] text-white font-bold text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4 flex items-center space-x-2">
            {onViewModeChange && viewMode !== null && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onViewModeChange(viewMode === "feed" ? "grid" : "feed")}
                className="h-10 w-10 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-700 active:scale-95 transition-all shadow-sm"
                title={viewMode === "feed" ? "Classic Grid view" : "TikTok Feed view"}
              >
                {viewMode === "feed" ? (
                  <LayoutGrid className="h-4.5 w-4.5 text-[#CB0207]" />
                ) : (
                  <Play className="h-4.5 w-4.5 text-[#CB0207] fill-[#CB0207]" />
                )}
              </Button>
            )}
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="What are you looking for?"
                value={internalSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
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
    </>
  )
}
