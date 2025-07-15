"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Upload, Edit3, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/header"
import Footer from '@/components/footer'

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

export default function EditProfilePage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedLGA, setSelectedLGA] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("")
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string>("")
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
        setFirstName(userDetails.first_name || "")
        setLastName(userDetails.last_name || "")
        setPhone(userDetails.phone || "")
        setEmail(userDetails.email || "")
        setCurrentProfilePicture(userDetails.profile_picture || "")
        // Don't set selectedState and selectedLGA here - let the useEffect handle it
      }
    } catch (error) {
      console.error("Error loading user details:", error)
    }
  }

  const fetchStates = async () => {
    setLoadingStates(true)
    try {
      const response = await fetch("https://api.strapre.com/api/v1/states")
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
      const response = await fetch(`https://api.strapre.com/api/v1/states/${stateSlug}/lgas`)
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

  const handleStateChange = (stateId: string) => {
    if (stateId === "defaultState") {
      setSelectedState("")
      setSelectedLGA("")
      setLgas([])
      return
    }
    setSelectedState(stateId)
    const state = states.find((s) => s.id === stateId)
    if (state) {
      fetchLGAs(state.slug)
    }
  }

  const handleLGAChange = (lgaId: string) => {
    if (lgaId === "defaultLGA") {
      setSelectedLGA("")
      return
    }
    setSelectedLGA(lgaId)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string)
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery)
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

    try {
      const formData = new FormData()
      // Only append fields that have values
      if (firstName.trim()) formData.append("first_name", firstName.trim())
      if (lastName.trim()) formData.append("last_name", lastName.trim())
      if (phone.trim()) formData.append("phone", phone.trim())
      if (selectedState) formData.append("state_id", selectedState)
      if (selectedLGA) formData.append("lga_id", selectedLGA)
      if (profilePicture) formData.append("profile_picture", profilePicture)

      // Console log for debugging
      console.log("=== UPDATING PROFILE ===")
      console.log("Token:", token)
      console.log("Endpoint:", "https://api.strapre.com/api/v1/auth/update-profile")
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

      const response = await fetch("https://api.strapre.com/api/v1/auth/update-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      })

      const data = await response.json()

      console.log("=== UPDATE RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response Data:", data)

      if (response.ok) {
        setSuccess("Profile updated successfully!")
        // Update localStorage with new profile data
        const updatedProfile = {
          ...userProfile,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          state_id: selectedState,
          lga_id: selectedLGA,
          profile_picture: profilePicturePreview || currentProfilePicture,
        }
        localStorage.setItem("userDetails", JSON.stringify(updatedProfile))
        setUserProfile(updatedProfile)
        // Redirect after success
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        setError(data.message || "Failed to update profile")
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

  // Convert selectedState and selectedLGA to State and LGA objects for Header component
  const selectedStateObj = selectedState ? states.find((s) => s.id === selectedState) || null : null
  const selectedLGAObj = selectedLGA ? lgas.find((l) => l.id === selectedLGA) || null : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        showStateSelectors={false}
        selectedState={selectedStateObj}
        selectedLGA={selectedLGAObj}
        onStateChange={handleStateChange}
        onLGAChange={handleLGAChange}
      />

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
              <Edit3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600">Update your personal information</p>
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
              {/* Profile Picture Section */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Picture</h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8">
                  <div className="mb-6 sm:mb-0">
                    <Avatar className="h-24 w-24 mx-auto sm:mx-0">
                      <AvatarImage src={profilePicturePreview || currentProfilePicture || ""} />
                      <AvatarFallback className="bg-[#CB0207] text-white text-xl font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-4 text-center sm:text-left">
                      Upload a new profile picture or take a photo
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
                        <span>Upload Photo</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>

              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                    />
                  </div>
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
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your WhatsApp number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                  />
                </div>

                {/* Location Information */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700 mb-2 block">
                        State
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
                        LGA
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-blue-900 mb-2">Current Location</h4>
                          <p className="text-sm text-blue-800 mb-3">
                            {getCurrentLGAName() && getCurrentStateName()
                              ? `${getCurrentLGAName()}, ${getCurrentStateName()}`
                              : getCurrentStateName() || getCurrentLGAName()}
                          </p>
                          <div className="bg-blue-100 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-900 mb-1">📍 Location Benefits</p>
                            <p className="text-xs text-blue-700">
                              This location setting determines the default set of products you'll see on the home page
                              when no filter is applied. Products from your area will be prioritized to show you the
                              most relevant items available nearby.
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
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
