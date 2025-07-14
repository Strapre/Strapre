"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Camera, Upload, Store, MapPin, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/header"
import Footer from "@/components/footer"

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

interface ApiResponse<T> {
  data: T[]
}

type UpdateSuccess = {
  message: string
  data?: any
}

type UpdateError = {
  message: string
  errors?: {
    update_request?: string[]
    [key: string]: string[] | undefined
  }
}

type UpdateResponse = UpdateSuccess | UpdateError

interface UserStore {
  data: {
    id: string
    user_id: string
    store_name: string
    slug: string
    store_description: string
    store_image: string
    phone: string
    email: string
    address: string
    state_id: string
    lga_id: string
    subscription_expires_at: string | null
    is_active: number
    status: string
    created_at: string
    updated_at: string
  }
}

export default function EditStoreRequestPage() {
  const [storeName, setStoreName] = useState("")
  const [storeDescription, setStoreDescription] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
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
  const [showStoreImageOptions, setShowStoreImageOptions] = useState(false)
  const [originalStoreData, setOriginalStoreData] = useState<UserStore["data"] | null>(null)
  const [currentStoreImageUrl, setCurrentStoreImageUrl] = useState<string>("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const params = useParams()
  const storeSlug = params?.slug as string

  // Constants
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB in bytes

  // Check if any field has changed from original values
  const isFormValid = useMemo(() => {
    if (!originalStoreData) {
      return (
        storeName.trim() !== "" ||
        storeDescription.trim() !== "" ||
        address.trim() !== "" ||
        phone.trim() !== "" ||
        selectedState !== "" ||
        selectedLGA !== "" ||
        storeImage !== null
      )
    }

    return (
      storeName.trim() !== originalStoreData.store_name ||
      storeDescription.trim() !== originalStoreData.store_description ||
      address.trim() !== originalStoreData.address ||
      phone.trim() !== originalStoreData.phone ||
      selectedState !== originalStoreData.state_id ||
      selectedLGA !== originalStoreData.lga_id ||
      storeImage !== null
    )
  }, [storeName, storeDescription, address, phone, selectedState, selectedLGA, storeImage, originalStoreData])

  useEffect(() => {
    // Check if user has auth token
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load existing profile data from userDetails
    loadProfileData()
    // Load existing store data
    loadStoreData()
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
        setPhone(userDetails.phone || "")
      }
    } catch (error) {
      console.error("Error loading user details:", error)
    }
  }

  const loadStoreData = () => {
    try {
      const userStoreStr = localStorage.getItem("userStore")
      if (userStoreStr) {
        const userStore: UserStore = JSON.parse(userStoreStr)
        const storeData = userStore.data
        setOriginalStoreData(storeData)

        // Pre-populate form fields with existing data
        setStoreName(storeData.store_name || "")
        setStoreDescription(storeData.store_description || "")
        setAddress(storeData.address || "")
        setPhone(storeData.phone || "")
        setSelectedState(storeData.state_id || "")
        setSelectedLGA(storeData.lga_id || "")
        setCurrentStoreImageUrl(storeData.store_image || "")
      }
    } catch (error) {
      console.error("Error loading store data:", error)
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > MAX_IMAGE_SIZE) {
        setError(`Image size must be less than 2MB. Selected file is ${formatFileSize(file.size)}.`)
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

      // Clear any previous errors
      setError("")
      setStoreImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setStoreImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setShowStoreImageOptions(false)
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

    if (!storeSlug) {
      setError("Store not found. Please try again.")
      setLoading(false)
      return
    }

    // Validation for phone number format if provided
    if (phone.trim() && !phone.startsWith("0")) {
      setError("WhatsApp number must start with 0.")
      setLoading(false)
      return
    }

    // Validation for image size if provided
    if (storeImage && storeImage.size > MAX_IMAGE_SIZE) {
      setError(`Store image size must be less than 2MB. Selected file is ${formatFileSize(storeImage.size)}.`)
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("_method", "PUT")
      let hasChanges = false

      // Only append fields that have changed from original values
      if (originalStoreData) {
        if (storeName.trim() !== originalStoreData.store_name) {
          formData.append("store_name", storeName.trim())
          hasChanges = true
        }
        if (storeDescription.trim() !== originalStoreData.store_description) {
          formData.append("store_description", storeDescription.trim())
          hasChanges = true
        }
        if (address.trim() !== originalStoreData.address) {
          formData.append("address", address.trim())
          hasChanges = true
        }
        if (phone.trim() !== originalStoreData.phone) {
          formData.append("phone", phone.trim())
          hasChanges = true
        }
        if (selectedState !== originalStoreData.state_id) {
          formData.append("state_id", selectedState)
          hasChanges = true
        }
        if (selectedLGA !== originalStoreData.lga_id) {
          formData.append("lga_id", selectedLGA)
          hasChanges = true
        }
        if (storeImage) {
          formData.append("store_image", storeImage)
          hasChanges = true
        }
      } else {
        // Fallback: if no original data, send all non-empty fields
        if (storeName.trim()) {
          formData.append("store_name", storeName.trim())
          hasChanges = true
        }
        if (storeDescription.trim()) {
          formData.append("store_description", storeDescription.trim())
          hasChanges = true
        }
        if (address.trim()) {
          formData.append("address", address.trim())
          hasChanges = true
        }
        if (phone.trim()) {
          formData.append("phone", phone.trim())
          hasChanges = true
        }
        if (selectedState) {
          formData.append("state_id", selectedState)
          hasChanges = true
        }
        if (selectedLGA) {
          formData.append("lga_id", selectedLGA)
          hasChanges = true
        }
        if (storeImage) {
          formData.append("store_image", storeImage)
          hasChanges = true
        }
      }

      if (!hasChanges) {
        setError("No changes detected. Please modify at least one field to submit an update request.")
        setLoading(false)
        return
      }

      // Console log for debugging
      console.log("=== REQUESTING STORE UPDATE ===")
      console.log("Token:", token)
      console.log("Endpoint:", `https://ga.vplaza.com.ng/api/v1/stores/${storeSlug}`)
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

      const response = await fetch(`https://ga.vplaza.com.ng/api/v1/stores/${storeSlug}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      })

      const data: UpdateResponse = await response.json()

      if (response.ok) {
        setSuccess("Your store update request has been sent for approval and will be reviewed within 24 hours.")
        // Clear form after success
        setTimeout(() => {
          router.push("/my-store")
        }, 3000)
      } else {
        const errorData = data as UpdateError

        // Handle specific pending request error
        if (errorData.errors?.update_request) {
          setError(errorData.message || "You already have a pending store update request.")
        } else {
          setError(errorData.message || "Failed to submit store update request")
        }
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
              <Edit className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Request Store Update</h1>
              <p className="text-gray-600">Submit changes to your store information for review</p>
            </div>
          </div>
        </div>

        

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Only fill in the fields you want to update. Leave other fields empty if no
                changes are needed. Your request will be reviewed within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Store Image Section */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Store Image (Optional)</h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8">
                  <div className="mb-6 sm:mb-0 relative">
                    <div
                      className="h-36 w-36 mx-auto sm:mx-0 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-[#CB0207] transition-colors"
                      onClick={() => setShowStoreImageOptions(!showStoreImageOptions)}
                    >
                      {storeImagePreview ? (
                        <img
                          src={storeImagePreview || "/placeholder.svg"}
                          alt="Store preview"
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : currentStoreImageUrl ? (
                        <img
                          src={currentStoreImageUrl || "/placeholder.svg"}
                          alt="Current store image"
                          className="h-full w-full object-cover rounded-full opacity-75"
                        />
                      ) : (
                        <Store className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    {showStoreImageOptions && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
                        <Button
                          type="button"
                          onClick={handleTakePhoto}
                          className="w-full mb-2 bg-[#CB0207] hover:bg-[#A50206] text-white flex items-center justify-center space-x-2"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Take Photo</span>
                        </Button>
                        <Button
                          type="button"
                          onClick={handleUploadFromGallery}
                          variant="outline"
                          className="w-full border-gray-300 hover:border-[#CB0207] hover:text-[#CB0207] flex items-center justify-center space-x-2 bg-transparent"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload Image</span>
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2 text-center sm:text-left">Click to update store image</p>
                    {storeImage && (
                      <p className="text-xs text-green-600 mt-2 text-center sm:text-left">
                        ✓ Selected: {storeImage.name} ({formatFileSize(storeImage.size)})
                      </p>
                    )}
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>

              {/* Store Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Store Information</h3>

                <div>
                  <Label htmlFor="storeName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Store Name
                  </Label>
                  <Input
                    id="storeName"
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Enter new store name (leave empty if no change)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                  />
                </div>

                <div>
                  <Label htmlFor="storeDescription" className="text-sm font-medium text-gray-700 mb-2 block">
                    Store Description
                  </Label>
                  <Textarea
                    id="storeDescription"
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    placeholder="Enter new store description (leave empty if no change)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207] min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                    Store Address
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter new store address (leave empty if no change)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                    WhatsApp Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter new WhatsApp number (leave empty if no change)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must start with 0 (e.g., 08012345678)</p>
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
                          <SelectValue
                            placeholder={loadingStates ? "Loading states..." : "Select new state (optional)"}
                          />
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
                              !selectedState
                                ? "Select state first"
                                : loadingLGAs
                                  ? "Loading LGAs..."
                                  : "Select new LGA (optional)"
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
                          <h4 className="text-sm font-semibold text-green-900 mb-2">New Store Location</h4>
                          <p className="text-sm text-green-800 mb-3">
                            {getCurrentLGAName() && getCurrentStateName()
                              ? `${getCurrentLGAName()}, ${getCurrentStateName()}`
                              : getCurrentStateName() || getCurrentLGAName()}
                          </p>
                          <div className="bg-green-100 rounded-lg p-3">
                            <p className="text-xs font-medium text-green-900 mb-1">📍 Location Update</p>
                            <p className="text-xs text-green-700">
                              Your store location will be updated to this new location after approval, helping you reach
                              customers in this area more effectively.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-gray-200">
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
                  disabled={loading || !isFormValid}
                  className="flex-1 bg-[#CB0207] hover:bg-[#A50206] text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting Request..." : "Submit Update Request"}
                </Button>
              </div>

              {/* Form validation indicator */}
              {!isFormValid && (
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    {originalStoreData
                      ? "Please modify at least one field to submit an update request"
                      : "Please fill in at least one field to submit an update request"}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
