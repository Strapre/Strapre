"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Search,
  Heart,
  User,
  Menu,
  ChevronDown,
  ChevronRight,
  LogOut,
  Store,
  Plus,
  Star,
  ImageIcon,
  Settings,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Eye,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string
  profile_picture?: string
  state_id?: string
  lga_id?: string
}

interface StoreResponse {
  data: {
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
    subscription_expires_at: string | null
    is_active: number
    created_at: string
    updated_at: string
  }
}

interface Category {
  id: string
  name: string
}

export default function MyStorePage() {
  const [storeData, setStoreData] = useState<StoreResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [categories] = useState<Category[]>([
    { id: "1", name: "Electronics" },
    { id: "2", name: "Fashion" },
    { id: "3", name: "Home & Garden" },
    { id: "4", name: "Sports" },
    { id: "5", name: "Books" },
  ])
  const [userStore] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user has auth token
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load existing profile data from userDetails
    loadProfileData()
    // Fetch store data
    fetchStoreData()
  }, [router])

  const loadProfileData = () => {
    try {
      const userDetailsStr = localStorage.getItem("userDetails")
      if (userDetailsStr) {
        const userDetails: UserProfile = JSON.parse(userDetailsStr)
        setUserProfile(userDetails)
      }
    } catch (error) {
      console.error("Error loading user details:", error)
    }
  }

  const fetchStoreData = async () => {
    setLoading(true)
    const token = localStorage.getItem("auth_token")

    try {
      console.log("=== FETCHING STORE DATA ===")
      console.log("Token:", token)
      console.log("Endpoint:", "https://ga.vplaza.com.ng/api/v1/mystore")

      const response = await fetch("https://ga.vplaza.com.ng/api/v1/mystore", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const responseData: StoreResponse = await response.json()

      console.log("=== STORE DATA RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response Data:", responseData)

      if (response.ok) {
        setStoreData(responseData.data)
        // Also update localStorage with store data
        localStorage.setItem("userStore", JSON.stringify(responseData.data))
      } else {
        setError(responseData.message || "Failed to load store data")
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getUserInitials = () => {
    if (!userProfile) return "U"
    return `${userProfile.first_name?.[0] || ""}${userProfile.last_name?.[0] || ""}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isSubscriptionActive = () => {
    if (!storeData?.subscription_expires_at) return false
    return new Date(storeData.subscription_expires_at) > new Date()
  }

  const getSubscriptionStatus = () => {
    if (!storeData?.subscription_expires_at) return "No Subscription"
    const isActive = isSubscriptionActive()
    return isActive ? "Active" : "Expired"
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("userDetails")
    localStorage.removeItem("userStore")
    router.push("/login")
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CB0207] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your store...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                    <Button
                      className={`w-full ${
                        userStore ? "bg-green-600 hover:bg-green-700" : "bg-[#CB0207] hover:bg-[#A50206]"
                      } text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      {userStore ? "View My Store" : "Become a Merchant"}
                    </Button>
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
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-xl">
                <Heart className="h-5 w-5" />
              </Button>
              {userProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-3 hover:bg-gray-100 rounded-xl px-3 py-2"
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
              )}
            </div>
            {/* Mobile User Avatar */}
            <div className="md:hidden">
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={handleBackToHome}
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Home</span>
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6 rounded-lg">
            <AlertDescription className="text-red-600 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {storeData && (
          <>
            {/* Enhanced Store Header */}
            <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
              <div className="p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-10">
                  {/* Enhanced Store Image */}
                  <div className="mb-8 lg:mb-0 flex-shrink-0">
                    <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg ring-4 ring-white">
                      {storeData.store_image ? (
                        <img
                          src={storeData.store_image || "/placeholder.svg"}
                          alt={storeData.store_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="h-20 w-20 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Enhanced Store Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                      <div className="mb-4 sm:mb-0">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                          {storeData.store_name}
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">{storeData.store_description}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <Badge
                          variant={storeData.is_active === 1 ? "default" : "secondary"}
                          className={`px-4 py-2 text-sm font-semibold ${
                            storeData.is_active === 1
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {storeData.is_active === 1 ? "🟢 Active" : "⚫ Inactive"}
                        </Badge>
                        <Badge
                          variant={isSubscriptionActive() ? "default" : "destructive"}
                          className={`px-4 py-2 text-sm font-semibold ${
                            isSubscriptionActive()
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        >
                          {isSubscriptionActive() ? "💎 Premium" : "⏰ Expired"}
                        </Badge>
                      </div>
                    </div>

                    {/* Enhanced Store Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Address</p>
                          <p className="text-gray-900 font-medium">{storeData.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-gray-900 font-medium">{storeData.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-gray-900 font-medium">{storeData.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Created</p>
                          <p className="text-gray-900 font-medium">{formatDate(storeData.created_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Subscription Info */}
                    {storeData.subscription_expires_at && (
                      <div
                        className={`p-4 rounded-xl border ${
                          isSubscriptionActive() ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${isSubscriptionActive() ? "bg-blue-500" : "bg-red-500"}`}
                          ></div>
                          <p
                            className={`text-sm font-semibold ${
                              isSubscriptionActive() ? "text-blue-800" : "text-red-800"
                            }`}
                          >
                            Subscription {isSubscriptionActive() ? "expires" : "expired"} on{" "}
                            {formatDate(storeData.subscription_expires_at)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Create New Product */}
              <Link href="/my-store/products">
                <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#CB0207] to-[#A50206] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                      <Plus className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Manage Products</CardTitle>
                    <CardDescription className="text-gray-600">View and manage all your store products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-[#CB0207] to-[#A50206] hover:from-[#A50206] hover:to-[#8B0105] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                      View Products
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Featured Products */}
              <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Star className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Featured Products</CardTitle>
                  <CardDescription className="text-gray-600">Manage and promote your best items</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-500 hover:text-white font-semibold py-3 rounded-xl transition-all bg-transparent"
                  >
                    View Featured
                  </Button>
                </CardContent>
              </Card>

              {/* Banner Request */}
              <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <ImageIcon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Banner Request</CardTitle>
                  <CardDescription className="text-gray-600">Request promotional banners and ads</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-purple-500 text-purple-700 hover:bg-purple-500 hover:text-white font-semibold py-3 rounded-xl transition-all bg-transparent"
                  >
                    Request Banner
                  </Button>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Settings className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Store Settings</CardTitle>
                  <CardDescription className="text-gray-600">Configure and customize your store</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-gray-500 text-gray-700 hover:bg-gray-600 hover:text-white font-semibold py-3 rounded-xl transition-all bg-transparent"
                  >
                    Manage Settings
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Store Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold text-gray-900">1,234</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Total views this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Store className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900">45</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Active products</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Last Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Edit className="h-5 w-5 text-orange-500" />
                    <span className="text-lg font-semibold text-gray-900">{formatDate(storeData.updated_at)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Store information</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-red-900 text-white mt-16 hidden lg:block w-full">
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
