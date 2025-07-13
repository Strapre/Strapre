"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Store, Plus, Star, MapPin, Phone, Mail, Calendar, Edit, AlertTriangle, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import Footer from '@/components/footer'
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
    store_cac_image?: string
    store_id_image?: string
    phone: string
    email: string
    state_id: string
    lga_id: string
    address: string
    subscription_expires_at: string | null
    is_active: number
    status: string
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

  const isStorePending = () => {
    return storeData?.status === "pending"
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery)
    }
  }

  const handleStateChange = (stateId: string) => {
    // This page doesn't need state selection functionality
    console.log("State changed:", stateId)
  }

  const handleLGAChange = (lgaId: string) => {
    // This page doesn't need LGA selection functionality
    console.log("LGA changed:", lgaId)
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

        {/* Store Under Review Alert - Only show if status is pending */}
        {isStorePending() && (
          <Alert className="border-orange-200 bg-orange-50 mb-6 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 font-medium">
              Your store is currently under review. All store functions are temporarily disabled until the review
              process is complete.
            </AlertDescription>
          </Alert>
        )}

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
                      <div className="flex flex-row items-center space-x-3">
                        {/* Show status badge based on store status */}
                        {isStorePending() ? (
                          <Badge
                            variant="secondary"
                            className="px-4 py-2 text-sm font-semibold bg-orange-100 text-orange-800 border-orange-200"
                          >
                            🔍 Under Review
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="px-4 py-2 text-sm font-semibold bg-green-100 text-green-800 border-green-200"
                          >
                            ✅ Approved
                          </Badge>
                        )}

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
                        className={`p-4 rounded-xl border hidden ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Manage Products Card */}
              {isStorePending() ? (
                <Card className="opacity-60 cursor-not-allowed border-0 bg-gradient-to-br from-red-50 to-red-100">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                      <Plus className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Manage Products</CardTitle>
                    <CardDescription className="text-gray-600">View and manage all your store products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      disabled
                      className="w-full bg-gray-400 text-white font-semibold py-3 rounded-xl shadow-lg cursor-not-allowed"
                    >
                      Store Under Review
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Link href="/my-store/products">
                  <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200">
                    <CardHeader className="pb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#CB0207] to-[#A50206] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                        <Plus className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">Manage Products</CardTitle>
                      <CardDescription className="text-gray-600">
                        View and manage all your store products
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-gradient-to-r from-[#CB0207] to-[#A50206] hover:from-[#A50206] hover:to-[#8B0105] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                        View Products
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {/* Featured Products Card */}
              {isStorePending() ? (
                <Card className="opacity-60 cursor-not-allowed border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                      <Star className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Featured Products</CardTitle>
                    <CardDescription className="text-gray-600">Manage and promote your best items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      disabled
                      variant="outline"
                      className="w-full border-2 border-gray-400 text-gray-500 font-semibold py-3 rounded-xl bg-transparent cursor-not-allowed"
                    >
                      Store Under Review
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Link href="/feature-product">
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
                </Link>
              )}

              {/* Ad Insight Card */}
              {isStorePending() ? (
                <Card className="opacity-60 cursor-not-allowed border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                      <BarChart3 className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Ad Insight</CardTitle>
                    <CardDescription className="text-gray-600">View insights and analytics for all your ads</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      disabled
                      variant="outline"
                      className="w-full border-2 border-gray-400 text-gray-500 font-semibold py-3 rounded-xl bg-transparent cursor-not-allowed"
                    >
                      Store Under Review
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Link href="/ad-insights">
                  <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
                    <CardHeader className="pb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                        <BarChart3 className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">Ad Insight</CardTitle>
                      <CardDescription className="text-gray-600">View insights and analytics for all your ads</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full border-2 border-blue-500 text-blue-700 hover:bg-blue-500 hover:text-white font-semibold py-3 rounded-xl transition-all bg-transparent"
                      >
                        View Insights
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
      <Footer />
    </div>
  )
}