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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from '@/components/footer'

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
  const router = useRouter()

  // Helper function to get userStore data from localStorage
  const getUserStoreData = () => {
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
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/auth/get-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/mystore", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
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

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/categories")
      const data: ApiResponse<Category> = await response.json()
      setCategories(data.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleContactSupport = () => {
    window.open("https://wa.me/2348138695216?text=Hello%2C%20I%20need%20help%21", "_blank")
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

  const handleStateChange = (stateId: string) => {
    // Placeholder function for state change
    console.log("State changed:", stateId)
  }

  const handleLGAChange = (lgaId: string) => {
    // Placeholder function for LGA change
    console.log("LGA changed:", lgaId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB0207] border-t-transparent"></div>
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
                    <AvatarImage src={userProfile?.profile_picture || ""} />
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