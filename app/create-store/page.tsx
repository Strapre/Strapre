"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Camera,
  Upload,
  Search,
  Heart,
  User,
  Menu,
  ChevronDown,
  ChevronRight,
  LogOut,
  Store,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

interface Category {
  id: string
  name: string
}

interface ApiResponse<T> {
  data: T[]
}

type StoreSuccess = {
  data: {
    id: string
    store_name: string
    store_description: string
    store_image: string
    email: string
    phone: string
    address: string
    state_id: string
    lga_id: string
    user_id: string
    slug: string
    subscription_expires_at: string | null
    created_at: string
    updated_at: string
  }
}

type StoreError = {
  message: string
}

type StoreResponse = StoreSuccess | StoreError

export default function CreateStorePage() {
  const [storeName, setStoreName] = useState("")
  const [storeDescription, setStoreDescription] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedLGA, setSelectedLGA] = useState("")
  const [storeImage, setStoreImage] = useState<File | null>(null)
  const [storeImagePreview, setStoreImagePreview] = useState<string>("")
  const [states, setStates] = useState<State[]>([])
  const [lgas, setLgas] = useState<LGA[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingLGAs, setLoadingLGAs] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [categories] = useState<Category[]>([
    { id: "1", name: "Electronics" },
    { id: "2", name: "Fashion" },
    { id: "3", name: "Home & Garden" },
    { id: "4", name: "Sports" },
    { id: "5", name: "Books" },
  ])
  const [userStore] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    // Fetch states
    fetchStates()
  }, [router])

  useEffect(() => {
    if (selectedState) {
      const state = states.find((s) => s.id === selectedState)
      if (state) {
        fetchLGAs(state.slug)
      }
    } else {
      setLgas([])
      setSelectedLGA("")
    }
  }, [selectedState, states])

  // Load user's existing state and LGA when states are loaded
  useEffect(() => {
    if (states.length > 0 && userProfile?.state_id) {
      const userState = states.find((s) => s.id === userProfile.state_id)
      if (userState) {
        setSelectedState(userProfile.state_id)
        // Fetch LGAs for the user's state
        fetchLGAs(userState.slug)
      }
    }
  }, [states, userProfile])

  // Set user's existing LGA when LGAs are loaded
  useEffect(() => {
    if (lgas.length > 0 && userProfile?.lga_id) {
      const userLGA = lgas.find((l) => l.id === userProfile.lga_id)
      if (userLGA) {
        setSelectedLGA(userProfile.lga_id)
      }
    }
  }, [lgas, userProfile])

  const loadProfileData = () => {
    try {
      const userDetailsStr = localStorage.getItem("userDetails")
      if (userDetailsStr) {
        const userDetails: UserProfile = JSON.parse(userDetailsStr)
        setUserProfile(userDetails)
        setEmail(userDetails.email || "")
        setPhone(userDetails.phone || "")
      }
    } catch (error) {
      console.error("Error loading user details:", error)
    }
  }

  const fetchStates = async () => {
    setLoadingStates(true)
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/states")
      const data: ApiResponse<State> = await response.json()
      // Sort states alphabetically by name
      const sortedStates = data.data.sort((a, b) => a.name.localeCompare(b.name))
      setStates(sortedStates)
    } catch (error) {
      console.error("Error fetching states:", error)
      setError("Failed to load states. Please try again.")
    } finally {
      setLoadingStates(false)
    }
  }

  const fetchLGAs = async (stateSlug: string) => {
    setLoadingLGAs(true)
    try {
      const response = await fetch(`https://ga.vplaza.com.ng/api/v1/states/${stateSlug}/lgas`)
      const data: ApiResponse<LGA> = await response.json()
      // Sort LGAs alphabetically by name
      const sortedLGAs = data.data.sort((a, b) => a.name.localeCompare(b.name))
      setLgas(sortedLGAs)
    } catch (error) {
      console.error("Error fetching LGAs:", error)
      setError("Failed to load LGAs. Please try again.")
    } finally {
      setLoadingLGAs(false)
    }
  }

  const getUserInitials = () => {
    if (!userProfile) return "U"
    return `${userProfile.first_name?.[0] || ""}${userProfile.last_name?.[0] || ""}`.toUpperCase()
  }

  const getCurrentStateName = () => {
    if (!selectedState || states.length === 0) return ""
    const state = states.find((s) => s.id === selectedState)
    return state?.name || ""
  }

  const getCurrentLGAName = () => {
    if (!selectedLGA || lgas.length === 0) return ""
    const lga = lgas.find((l) => l.id === selectedLGA)
    return lga?.name || ""
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("userDetails")
    router.push("/login")
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setStoreImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setStoreImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "camera")
      fileInputRef.current.click()
    }
  }

  const handleUploadFromGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture")
      fileInputRef.current.click()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const token = localStorage.getItem("auth_token")
    if (!token) {
      setError("Session expired. Please login again.")
      setLoading(false)
      return
    }

    // Validation
    if (!storeName.trim()) {
      setError("Store name is required.")
      setLoading(false)
      return
    }

    if (!storeDescription.trim()) {
      setError("Store description is required.")
      setLoading(false)
      return
    }

    if (!address.trim()) {
      setError("Store address is required.")
      setLoading(false)
      return
    }

    if (!phone.trim()) {
      setError("WhatsApp number is required.")
      setLoading(false)
      return
    }

    if (!phone.startsWith("0")) {
      setError("WhatsApp number must start with 0.")
      setLoading(false)
      return
    }

    if (!selectedState) {
      setError("Please select a state.")
      setLoading(false)
      return
    }

    if (!selectedLGA) {
      setError("Please select an LGA.")
      setLoading(false)
      return
    }

    if (!storeImage) {
      setError("Store image is required.")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("store_name", storeName.trim())
      formData.append("store_description", storeDescription.trim())
      formData.append("address", address.trim())
      formData.append("phone", phone.trim())
      formData.append("email", email)
      formData.append("state_id", selectedState)
      formData.append("lga_id", selectedLGA)
      formData.append("store_image", storeImage)

      // Console log for debugging
      console.log("=== CREATING STORE ===")
      console.log("Token:", token)
      console.log("Endpoint:", "https://ga.vplaza.com.ng/api/v1/stores")
      console.log("Form Data Contents:")
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, {
            name: value.name,
            size: value.size,
            type: value.type,
          })
        } else {
          console.log(`${key}:`, value)
        }
      }

      const response = await fetch("https://ga.vplaza.com.ng/api/v1/stores", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      })

      const data: StoreResponse = await response.json()

      console.log("=== CREATE STORE RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response Data:", data)

      if (response.ok) {
        setSuccess("Store created successfully!")

        // Store the response as userStore in localStorage
        localStorage.setItem("userStore", JSON.stringify((data as StoreSuccess).data))

        // Redirect after success
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        const errorData = data as StoreError
        setError(errorData.message || "Failed to create store")

      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Back Button */}
        <div className="lg:hidden mb-6">
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-[#CB0207] rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Your Store</h1>
              <p className="text-gray-600">Set up your online store and start selling</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6 rounded-lg">
            <AlertDescription className="text-red-600 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 mb-6 rounded-lg">
            <AlertDescription className="text-green-600 font-medium">{success}</AlertDescription>
          </Alert>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Store Image Section */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Store Image</h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8">
                  <div className="mb-6 sm:mb-0">
                    <div className="h-24 w-24 mx-auto sm:mx-0 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                      {storeImagePreview ? (
                        <img
                          src={storeImagePreview || "/placeholder.svg"}
                          alt="Store preview"
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <Store className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-4 text-center sm:text-left">
                      Upload your store logo or take a photo
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        onClick={handleTakePhoto}
                        className="bg-[#CB0207] hover:bg-[#A50206] text-white flex items-center justify-center space-x-2"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Take Photo</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={handleUploadFromGallery}
                        variant="outline"
                        className="border-gray-300 hover:border-[#CB0207] hover:text-[#CB0207] flex items-center justify-center space-x-2 bg-transparent"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload Image</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>

              {/* Store Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Store Information</h3>

                <div>
                  <Label htmlFor="storeName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Store Name *
                  </Label>
                  <Input
                    id="storeName"
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Enter your store name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="storeDescription" className="text-sm font-medium text-gray-700 mb-2 block">
                    Store Description *
                  </Label>
                  <Textarea
                    id="storeDescription"
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    placeholder="Describe what your store sells and what makes it special"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207] min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                    Store Address *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your store's physical address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                      WhatsApp Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter WhatsApp number starting with 0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Must start with 0 (e.g., 08012345678)</p>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      placeholder="Email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">From your profile</p>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700 mb-2 block">
                        State *
                      </Label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]">
                          <SelectValue placeholder={loadingStates ? "Loading states..." : "Select State"} />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.id} value={state.id}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="lga" className="text-sm font-medium text-gray-700 mb-2 block">
                        LGA *
                      </Label>
                      <Select value={selectedLGA} onValueChange={setSelectedLGA} disabled={!selectedState}>
                        <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207] disabled:bg-gray-50 disabled:text-gray-400">
                          <SelectValue
                            placeholder={
                              !selectedState ? "Select state first" : loadingLGAs ? "Loading LGAs..." : "Select LGA"
                            }
                          />
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

                  {/* Location Display */}
                  {(getCurrentStateName() || getCurrentLGAName()) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-green-900 mb-2">Store Location</h4>
                          <p className="text-sm text-green-800 mb-3">
                            {getCurrentLGAName() && getCurrentStateName()
                              ? `${getCurrentLGAName()}, ${getCurrentStateName()}`
                              : getCurrentStateName() || getCurrentLGAName()}
                          </p>
                          <div className="bg-green-100 rounded-lg p-3">
                            <p className="text-xs font-medium text-green-900 mb-1">🏪 Store Benefits</p>
                            <p className="text-xs text-green-700">
                              Your store will be visible to customers in this location first. Local customers will see
                              your products prioritized in their search results, helping you reach nearby buyers more
                              effectively.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#CB0207] hover:bg-[#A50206] text-white py-3 disabled:opacity-50"
                >
                  {loading ? "Creating Store..." : "Create Store"}
                </Button>
              </div>
            </form>
          </div>
        </div>
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
              <ul className="space-y-2 text-Sm">
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
