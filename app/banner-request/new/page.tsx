"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Upload,
  CreditCard,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  Menu,
  Search,
  ChevronRight,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Footer from '@/components/footer'

interface Plan {
  id: string
  name: string
  price: string
  description: string
  duration_days: number
}

interface State {
  id: string
  name: string
  slug: string
}

interface CreateBannerFormData {
  plan_id: string
  state_id: string
  starts_at: string
  title: string
  image: File | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface LGA {
  id: string
  name: string
  slug: string
  state_id: string
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

export default function CreateBannerPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [states, setStates] = useState<State[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string>("")
  const [nextAvailableDate, setNextAvailableDate] = useState<string>("")

  const [categories, setCategories] = useState<Category[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStore, setUserStore] = useState<UserStore | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMerchant, setIsMerchant] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [selectedLGA, setSelectedLGA] = useState<LGA | null>(null)
  const [lgas, setLgas] = useState<LGA[]>([])

  const [formData, setFormData] = useState<CreateBannerFormData>({
    plan_id: "",
    state_id: "",
    starts_at: "",
    title: "",
    image: null,
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://api.strapre.com/api/v1/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
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
        setIsMerchant(true)

        if (typeof window !== "undefined") {
          localStorage.setItem("userStore", JSON.stringify(data))
        }
      }
    } catch (error) {
      console.error("Error fetching user store:", error)
    }
  }

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

        if (typeof window !== "undefined") {
          localStorage.setItem("userDetails", JSON.stringify(data.data))
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchLGAs = async (stateSlug: string) => {
    try {
      const response = await fetch(`https://api.strapre.com/api/v1/states/${stateSlug}/lgas`)
      if (response.ok) {
        const data = await response.json()
        const sortedLGAs = data.data.sort((a: LGA, b: LGA) => a.name.localeCompare(b.name))
        setLgas(sortedLGAs)
      }
    } catch (error) {
      console.error("Error fetching LGAs:", error)
    }
  }

  const handleStateChange = (stateId: string) => {
    if (stateId === "defaultState") {
      setSelectedState(null)
      setSelectedLGA(null)
      setLgas([])
      return
    }
    const state = states.find((s) => s.id === stateId)
    if (state) {
      setSelectedState(state)
      setSelectedLGA(null)
      fetchLGAs(state.slug)
    }
  }

  const handleLGAChange = (lgaId: string) => {
    if (lgaId === "defaultLGA") {
      setSelectedLGA(null)
      return
    }
    const lga = lgas.find((l) => l.id === lgaId)
    setSelectedLGA(lga || null)
  }

  const getUserInitials = () => {
    if (!userProfile || !userProfile.first_name || !userProfile.last_name) return "U"
    return `${userProfile.first_name[0]}${userProfile.last_name[0]}`
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("userStore")
      localStorage.removeItem("userDetails")
    }
    setIsAuthenticated(false)
    setUserProfile(null)
    setUserStore(null)
    setIsMerchant(false)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery)
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const fetchInitialData = async () => {
    try {
      // Check authentication
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const userStoreData = typeof window !== "undefined" ? localStorage.getItem("userStore") : null

      setIsAuthenticated(!!token)
      setIsMerchant(!!userStoreData)

      // Fetch user data if authenticated
      if (token) {
        fetchUserProfile(token)
        fetchUserStore(token)
      }

      fetchCategories()

      const [plansResponse, statesResponse] = await Promise.all([
        fetch("https://api.strapre.com/api/v1/advert-plans"),
        fetch("https://api.strapre.com/api/v1/states"),
      ])

      if (plansResponse.ok && statesResponse.ok) {
        const plansData = await plansResponse.json()
        const statesData = await statesResponse.json()

        setPlans(plansData.data)
        setStates(statesData.data.sort((a: State, b: State) => a.name.localeCompare(b.name)))

        // Calculate next available date
        await calculateNextAvailableDate()
      }
    } catch (error) {
      console.error("Error fetching initial data:", error)
      setError("Failed to load required data. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }

  const calculateNextAvailableDate = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch("https://api.strapre.com/api/v1/adverts", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          const latestEndDate = data.data.reduce((latest: Date, banner: any) => {
            const bannerEndDate = new Date(banner.ends_at)
            return bannerEndDate > latest ? bannerEndDate : latest
          }, new Date(data.data[0].ends_at))

          const nextAvailable = new Date(latestEndDate)
          nextAvailable.setDate(nextAvailable.getDate() + 1)

          const formattedDate = nextAvailable.toISOString().slice(0, 16)
          setNextAvailableDate(formattedDate)
          setFormData((prev) => ({ ...prev, starts_at: formattedDate }))
        } else {
          // No existing banners, start from tomorrow
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          const formattedDate = tomorrow.toISOString().slice(0, 16)
          setNextAvailableDate(formattedDate)
          setFormData((prev) => ({ ...prev, starts_at: formattedDate }))
        }
      }
    } catch (error) {
      console.error("Error calculating next available date:", error)
    }
  }

  const handleInputChange = (field: keyof CreateBannerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        return
      }

      setFormData((prev) => ({ ...prev, image: file }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError("")
    }
  }

  const validateForm = (): boolean => {
    if (!formData.plan_id) {
      setError("Please select a plan")
      return false
    }
    if (!formData.state_id) {
      setError("Please select a state")
      return false
    }
    if (!formData.title.trim()) {
      setError("Please enter a banner title")
      return false
    }
    if (!formData.image) {
      setError("Please upload a banner image")
      return false
    }
    if (!formData.starts_at) {
      setError("Please select a start date")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("Please log in to create a banner")
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append("plan_id", formData.plan_id)
      formDataToSend.append("state_id", formData.state_id)
      formDataToSend.append("starts_at", formData.starts_at.replace("T", " ") + ":00")
      formDataToSend.append("title", formData.title)
      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }

      const response = await fetch("https://api.strapre.com/api/v1/payments/book-advert", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const result = await response.json()

      if (response.ok && result.authorization_url) {
        // Redirect to payment page
        window.location.href = `${result.authorization_url}?reference=${result.reference}`
      } else {
        setError(result.message || "Failed to create banner. Please try again.")
      }
    } catch (error) {
      console.error("Error creating banner:", error)
      setError("An error occurred while creating your banner. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const getSelectedPlan = () => {
    return plans.find((plan) => plan.id === formData.plan_id)
  }

  const calculateEndDate = () => {
    const selectedPlan = getSelectedPlan()
    if (selectedPlan && formData.starts_at) {
      const startDate = new Date(formData.starts_at)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + selectedPlan.duration_days)
      return endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }
    return ""
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#CB0207]" />
          <p className="text-gray-600">Loading banner creation form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8">
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
                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto">
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
                    </div>
                    {/* Fixed bottom button */}
                    <div className="flex-shrink-0 pt-4 border-t border-gray-200">
                      <Button
                        className={`w-full ${
                          userStore ? "bg-green-600 hover:bg-green-700" : "bg-[#CB0207] hover:bg-[#A50206]"
                        } text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        {userStore ? "View My Store" : "Become a Merchant"}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            {/* Logo */}
            <div className="hidden md:flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
                  <img src="/strapre-logo.jpg" alt="Strapre Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-[#CB0207] font-bold text-xl">Strapre</span>
              </Link>
            </div>
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
            <div className="hidden lg:flex items-center space-x-3">
              <Select onValueChange={handleStateChange} value={selectedState?.id || "defaultState"}>
                <SelectTrigger className="w-36 rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12">
                  <SelectValue placeholder="State" />
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
              <Select onValueChange={handleLGAChange} value={selectedLGA?.id || "defaultLGA"} disabled={!selectedState}>
                <SelectTrigger className="w-36 rounded-xl border-2 border-gray-200 focus:border-[#CB0207] h-12">
                  <SelectValue placeholder="LGA" />
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
            {/* Login/Register Button or User Dropdown */}
            {!isAuthenticated ? (
              <Link href="/login">
                <Button className="bg-[#CB0207] hover:bg-[#A50206] text-white text-[10px] md:text-[12px] px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  LOGIN / REGISTER
                </Button>
              </Link>
            ) : (
              userProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-3 hover:bg-gray-100 rounded-xl px-3 h-14"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-[#CB0207]/20">
                        <AvatarImage src={userProfile.profile_picture || ""} />
                        <AvatarFallback className="bg-[#CB0207] text-white font-bold text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left hidden md:block">
                        <p className="text-sm font-semibold text-gray-800">{`${userProfile.first_name} ${userProfile.last_name}`}</p>
                        <p className="text-xs text-gray-500">{userProfile.email}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
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
              )
            )}
          </div>
          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Main Content */}
      <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Link href="/banner-request" className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Banner Dashboard
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Create New <span className="text-[#CB0207]">Banner Advertisement</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Design and launch your banner campaign to boost your store's visibility
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-[#CB0207]" />
                  Banner Details
                </CardTitle>
                <CardDescription>Fill in the details for your banner advertisement</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Alert */}
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Success Alert */}
                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">{success}</AlertDescription>
                    </Alert>
                  )}

                  {/* Plan Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="plan">Select Plan *</Label>
                    <Select onValueChange={(value) => handleInputChange("plan_id", value)} value={formData.plan_id}>
                      <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-[#CB0207]">
                        <SelectValue placeholder="Choose your advertising plan" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <span className="font-medium">{plan.name}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  (₦{plan.price} - {plan.duration_days} days)
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* State Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="state">Target State *</Label>
                    <Select onValueChange={(value) => handleInputChange("state_id", value)} value={formData.state_id}>
                      <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-[#CB0207]">
                        <SelectValue placeholder="Select target state" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Banner Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Banner Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter your banner title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="rounded-xl border-2 border-gray-200 focus:border-[#CB0207]"
                      maxLength={100}
                    />
                    <p className="text-sm text-gray-500">{formData.title.length}/100 characters</p>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="starts_at">Campaign Start Date *</Label>
                    <Input
                      id="starts_at"
                      type="datetime-local"
                      value={formData.starts_at}
                      onChange={(e) => handleInputChange("starts_at", e.target.value)}
                      className="rounded-xl border-2 border-gray-200 focus:border-[#CB0207]"
                      min={nextAvailableDate}
                    />
                    <p className="text-sm text-gray-500">
                      Next available slot: {new Date(nextAvailableDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="image">Banner Image *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#CB0207] transition-colors">
                      <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      <label htmlFor="image" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <div className="relative w-full max-w-md mx-auto">
                              <Image
                                src={imagePreview || "/placeholder.svg"}
                                alt="Banner preview"
                                width={400}
                                height={200}
                                className="rounded-lg object-cover w-full h-48"
                              />
                            </div>
                            <p className="text-sm text-gray-600">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-lg font-medium text-gray-700">Upload Banner Image</p>
                              <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#CB0207] hover:bg-[#A50206] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Banner...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            {/* Plan Summary */}
            {getSelectedPlan() && (
              <Card className="shadow-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Campaign Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-semibold">{getSelectedPlan()?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{getSelectedPlan()?.duration_days} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-[#CB0207]">₦{getSelectedPlan()?.price}</span>
                  </div>
                  {formData.starts_at && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-semibold">{new Date(formData.starts_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-semibold">{calculateEndDate()}</span>
                      </div>
                    </>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-[#CB0207]">₦{getSelectedPlan()?.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card className="shadow-sm border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">Important Notes</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Banner will be reviewed before going live</li>
                      <li>• Payment is processed securely via Paystack</li>
                      <li>• You'll receive confirmation once approved</li>
                      <li>• Campaign starts on your selected date</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  )
}
