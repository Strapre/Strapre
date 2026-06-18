"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Heart,
  Edit,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Settings,
  User,
  LogOut,
  ChevronRight,
  Store,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from '@/components/footer'
import { ENDPOINTS, authHeaders, getCorrectImageUrl } from "@/lib/api"

interface Category {
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
  created_at?: string
  updated_at?: string
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
}

function ProfilePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStore, setUserStore] = useState<UserStore | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Helper function to get userStore data from localStorage
  const getUserStoreData = () => {
    if (typeof window === "undefined") return null
    const storedUserStore = localStorage.getItem("userStore")
    if (!storedUserStore) return null
    
    try {
      const parsedStore = JSON.parse(storedUserStore)
      console.log("getUserStoreData:", parsedStore)
      return parsedStore
    } catch (error) {
      console.error("Error parsing userStore from localStorage:", error)
      return null
    }
  }

  // Helper function to check if userStore has actual data from localStorage
  const hasUserStoreData = () => {
    const storeData = getUserStoreData()
    return storeData && Object.keys(storeData).length > 0
  }

  // Check authentication and fetch user data
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      setIsAuthenticated(true)
      fetchUserProfile(token)
      fetchUserStore(token)
      fetchWishlist(token)
      fetchCategories()
      
      // Also check for existing userStore in localStorage
      const storedUserStore = localStorage.getItem("userStore")
      if (storedUserStore) {
        try {
          const parsedStore = JSON.parse(storedUserStore)
          setUserStore(parsedStore)
        } catch (error) {
          console.error("Error parsing userStore from localStorage:", error)
        }
      }
    } else {
      router.push("/login")
    }
  }, [router])

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(ENDPOINTS.getProfile, {
        headers: authHeaders(token),
      })
      const data = await response.json()
      if (response.ok) {
        setUserProfile(data.data)
        localStorage.setItem("userDetails", JSON.stringify(data.data))
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
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

  const fetchCategories = async () => {
    try {
      const response = await fetch(ENDPOINTS.categories)
      const data: ApiResponse<Category> = await response.json()
      setCategories(data.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleContactSupport = () => {
    window.open("https://wa.me/2348129769093?text=Hello%2C%20I%20need%20help%21", "_blank")
  }

  const getUserInitials = () => {
    if (!userProfile || !userProfile.first_name || !userProfile.last_name) return "U"
    return `${userProfile.first_name[0]}${userProfile.last_name[0]}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Handle search functionality
      console.log("Searching for:", searchQuery)
      // You can implement search navigation here
    }
  }

  const handleStateChange = (_state: { id: string; name: string; slug: string } | null) => {
    // Placeholder function for state change
  }

  const handleLGAChange = (_lga: { id: string; name: string; slug: string } | null) => {
    // Placeholder function for LGA change
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pb-8">
        {/* Modern mobile header */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm">
          <button onClick={() => router.push("/")} className="text-gray-700 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">My Profile</h1>
          <button onClick={() => router.push("/edit-profile")} className="text-gray-700 hover:text-[#CB0207] transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* User Hero section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            {/* Red accent glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#CB0207] to-[#A50206]" />

            <Avatar className="h-20 w-20 ring-4 ring-red-50 hover:scale-105 transition-transform duration-300">
              <AvatarImage src={getCorrectImageUrl(userProfile?.profile_picture)} />
              <AvatarFallback className="bg-gradient-to-br from-[#CB0207] to-[#A50206] text-white font-bold text-xl">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-extrabold text-gray-900 mt-4 tracking-tight">
              {userProfile?.first_name} {userProfile?.last_name}
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">{userProfile?.email}</p>

            {hasUserStoreData() ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#CB0207] border border-red-100 mt-3">
                <Store className="h-3.5 w-3.5 mr-1" />
                Merchant Partner
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 mt-3">
                <User className="h-3.5 w-3.5 mr-1" />
                Customer
              </span>
            )}

            {/* Quick stats grid */}
            <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-5 border-t border-gray-100">
              <div className="flex flex-col items-center">
                <Heart className="h-4.5 w-4.5 text-[#CB0207] mb-1" />
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Wishlist</span>
                <span className="text-xs font-bold text-gray-800 mt-0.5">{wishlistItems.length} items</span>
              </div>
              <div className="flex flex-col items-center border-x border-gray-100">
                <Calendar className="h-4.5 w-4.5 text-blue-500 mb-1" />
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Joined</span>
                <span className="text-xs font-bold text-gray-800 mt-0.5">
                  {userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : "N/A"}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Settings className="h-4.5 w-4.5 text-green-500 mb-1" />
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Status</span>
                <span className="text-xs font-bold text-green-600 mt-0.5">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Settings list */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Quick Actions</h3>
            <div className="bg-white border border-gray-100 rounded-3xl p-2 shadow-sm space-y-0.5">
              <button
                onClick={() => router.push("/edit-profile")}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-[#CB0207]">
                    <Edit className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-sm font-semibold">Edit Profile</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  if (hasUserStoreData()) {
                    router.push("/my-store")
                  } else {
                    router.push("/create-store")
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <Store className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-sm font-semibold">
                    {hasUserStoreData() ? "My Store Hub" : "Become a Merchant"}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={() => router.push("/wishlist")}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                    <Heart className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-sm font-semibold">My Wishlist</span>
                </div>
                <div className="flex items-center space-x-2">
                  {wishlistItems.length > 0 && (
                    <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {wishlistItems.length}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </button>

              <button
                onClick={handleContactSupport}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                    <MessageCircle className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-sm font-semibold">Contact WhatsApp Support</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Log Out button */}
          <div className="pt-2">
            <button
              onClick={() => {
                localStorage.clear()
                setIsAuthenticated(false)
                setUserProfile(null)
                setUserStore(null)
                setWishlistItems([])
                router.push("/login")
              }}
              className="w-full flex items-center justify-center space-x-2 py-4 bg-red-50 active:bg-red-100 text-red-600 hover:text-red-700 font-semibold rounded-2xl border border-red-100 shadow-sm transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        showStateSelectors={false}
        selectedState={null}
        selectedLGA={null}
        onStateChange={handleStateChange}
        onLGAChange={handleLGAChange}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-0 sm:px-6 lg:px-8 py-0 md:py-2">
        {/* Back Button */}
        <Link href="/" className="flex items-center text-[14px] text-gray-600 hover:text-gray-800 mb-2 mt-4 ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#CB0207] to-[#A50206] text-white p-8">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24 ring-4 ring-white/20">
                    <AvatarImage src={getCorrectImageUrl(userProfile?.profile_picture)} />
                    <AvatarFallback className="bg-white/20 text-white font-bold text-2xl">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-3xl font-bold mb-2">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </CardTitle>
                    <p className="text-white/90 text-lg">{userProfile?.email}</p>
                    {hasUserStoreData() && (
                      <div className="mt-2">
                        <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full font-medium">
                          Store Owner
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h3>
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-[#CB0207]" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-semibold text-gray-800">
                          {userProfile?.first_name} {userProfile?.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-[#CB0207]" />
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-semibold text-gray-800">{userProfile?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-[#CB0207]" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-semibold text-gray-800">{userProfile?.phone || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Account Details</h3>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-[#CB0207]" />
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-semibold text-gray-800">{formatDate(userProfile?.created_at || "")}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-[#CB0207]" />
                      <div>
                        <p className="text-sm text-gray-500">Account Status</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Heart className="h-5 w-5 text-[#CB0207]" />
                      <div>
                        <p className="text-sm text-gray-500">Wishlist Items</p>
                        <p className="font-semibold text-gray-800">{wishlistItems.length} items</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Store Information (if user has a store with data) */}
                {hasUserStoreData() && (
                  <>
                    <Separator className="my-8" />
                    <div className="hidden md:block">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Store Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 bg-[#CB0207] rounded text-white flex items-center justify-center text-xs font-bold">
                              S
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Store Name: </p>
                              <p className="font-semibold text-gray-800">{getUserStoreData()?.data.store_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-[#CB0207]" />
                            <div>
                              <p className="text-sm text-gray-500">Store Email</p>
                              <p className="font-semibold text-gray-800">{getUserStoreData()?.data.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-[#CB0207]" />
                            <div>
                              <p className="text-sm text-gray-500">Store Phone</p>
                              <p className="font-semibold text-gray-800">{getUserStoreData()?.data.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-[#CB0207]" />
                            <div>
                              <p className="text-sm text-gray-500">Store Address</p>
                              <p className="font-semibold text-gray-800">{getUserStoreData()?.data.address}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gray-50 p-6">
                <CardTitle className="text-xl font-bold text-gray-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <Button
                  onClick={() => router.push("/edit-profile")}
                  className="w-full bg-[#CB0207] hover:bg-[#A50206] text-white py-3 h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Profile</span>
                </Button>

                <Button
                  onClick={() => router.push("/wishlist")}
                  variant="outline"
                  className="w-full border-2 border-gray-200 hover:bg-gray-50 py-3 h-12 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 bg-transparent"
                >
                  <Heart className="h-5 w-5" />
                  <span>My Wishlist ({wishlistItems.length})</span>
                </Button>

                <Button
                  onClick={handleContactSupport}
                  variant="outline"
                  className="w-full border-2 border-gray-200 hover:bg-gray-50 py-3 h-12 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 bg-transparent"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Contact Support</span>
                </Button>

                <Button
                  onClick={() => {
                    if (hasUserStoreData()) {
                      router.push("/my-store")
                    } else {
                      router.push("/create-store")
                    }
                  }}
                  variant="outline"
                  className={`w-full border-2 ${
                    hasUserStoreData() ? "border-green-200 hover:bg-green-50" : "border-gray-200 hover:bg-gray-50"
                  } py-3 h-12 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 bg-transparent`}
                >
                  <div className="w-5 h-5 bg-[#CB0207] rounded text-white flex items-center justify-center text-xs font-bold">
                    S
                  </div>
                  <span>{hasUserStoreData() ? "View My Store" : "Become a Merchant"}</span>
                </Button>

                <Separator className="my-4" />

                <Button
                  onClick={() => {
                    // Clear all localStorage items
                    localStorage.clear()
                    setIsAuthenticated(false)
                    setUserProfile(null)
                    setUserStore(null)
                    setWishlistItems([])
                    router.push("/login")
                  }}
                  variant="outline"
                  className="w-full border-2 border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 py-3 h-12 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 bg-transparent"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log Out</span>
                </Button>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card className="shadow-xl hidden md:block border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gray-50 p-6">
                <CardTitle className="text-xl font-bold text-gray-800">Account Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Wishlist Items</span>
                  <span className="font-bold text-[#CB0207]">{wishlistItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account Type</span>
                  <span className="font-bold text-gray-800">{hasUserStoreData() ? "Merchant" : "Customer"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-bold text-gray-800">
                    {userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer - Same as homepage */}
      <Footer />
    </div>
  )
}

export default ProfilePage
