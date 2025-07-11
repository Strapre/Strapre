"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

export default function CompleteProfilePage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedLGA, setSelectedLGA] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("")
  const [states, setStates] = useState<State[]>([])
  const [lgas, setLgas] = useState<LGA[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetchStates()
    // Check if user has auth token
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
    }
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

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      phone.trim() !== "" &&
      selectedState !== "" &&
      selectedLGA !== "" &&
      profilePicture !== null
    )
  }

  // Update the fetchStates and fetchLGAs functions to sort alphabetically
  const fetchStates = async () => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/states")
      const data: ApiResponse<State> = await response.json()
      // Sort states alphabetically by name
      const sortedStates = data.data.sort((a, b) => a.name.localeCompare(b.name))
      setStates(sortedStates)
    } catch (error) {
      console.error("Error fetching states:", error)
    }
  }

  const fetchLGAs = async (stateSlug: string) => {
    try {
      const response = await fetch(`https://ga.vplaza.com.ng/api/v1/states/${stateSlug}/lgas`)
      const data: ApiResponse<LGA> = await response.json()
      // Sort LGAs alphabetically by name
      const sortedLGAs = data.data.sort((a, b) => a.name.localeCompare(b.name))
      setLgas(sortedLGAs)
    } catch (error) {
      console.error("Error fetching LGAs:", error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      const maxSizeInBytes = 2 * 1024 * 1024
      if (file.size > maxSizeInBytes) {
        setError(`Image size must be less than 2MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`)
        // Clear the file input
        if (event.target) {
          event.target.value = ""
        }
        return
      }

      // Clear any previous error
      setError("")

      setProfilePicture(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setShowPhotoOptions(false)
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

  const handleAvatarClick = () => {
    setShowPhotoOptions(!showPhotoOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form before submission
    if (!isFormValid()) {
      setError("Please fill in all required fields including uploading a profile picture.")
      return
    }

    setLoading(true)
    setError("")

    const token = localStorage.getItem("auth_token")
    if (!token) {
      setError("Session expired. Please login again.")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("first_name", firstName)
      formData.append("last_name", lastName)
      formData.append("phone", phone)
      formData.append("state_id", selectedState)
      formData.append("lga_id", selectedLGA)
      if (profilePicture) {
        formData.append("profile_picture", profilePicture)
      }

      const response = await fetch("https://ga.vplaza.com.ng/api/v1/auth/complete-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        console.log("✅ Profile completed successfully!")
        // Profile completed successfully, redirect to home
        router.push("/")
      } else {
        console.log("❌ Profile completion failed:", data.message || "Unknown error")
        setError(data.message || "Failed to complete profile")
      }
    } catch (error) {
      console.log("❌ Network error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className=" items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
                  <img src="/strapre-logo.jpg" alt="Strapre Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-[#CB0207] font-bold text-xl">Strapre</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8  ">
        <div className="flex gap-8 justify-center">
          {/* Main Content */}
          <div className="flex-1 max-w-2xl">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-8 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-red-600 mb-2">Complete Profile</h1>
                <p className="text-gray-600 text-[12px]">COMPLETE YOUR PROFILE TODAY</p>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50 mb-6">
                  <AlertDescription className="text-red-600">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Section - Centered */}
                <div className="flex flex-col items-center justify-center mb-8 relative">
                  <div className="relative">
                    <Avatar
                      className="h-32 w-32 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={handleAvatarClick}
                    >
                      <AvatarImage src={profilePicturePreview || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gray-100 text-gray-400 text-lg">
                        <Camera className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>
                    {!profilePicture && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">
                    Profile picture <span className="text-red-500">*</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1 text-center">Click to add photo</p>

                  {/* Photo Options Dropdown */}
                  {showPhotoOptions && (
                    <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                      <Button
                        type="button"
                        onClick={handleTakePhoto}
                        className="w-full mb-2 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 flex items-center space-x-2"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Take new photo</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={handleUploadFromGallery}
                        variant="outline"
                        className="w-full text-sm px-4 py-2 flex items-center space-x-2 bg-transparent"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload from gallery</span>
                      </Button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className={`mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        firstName.trim() === "" ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className={`mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        lastName.trim() === "" ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedState} onValueChange={setSelectedState} required>
                      <SelectTrigger
                        className={`mt-1 w-full px-4 py-3 border rounded-lg ${
                          selectedState === "" ? "border-red-300" : "border-gray-300"
                        }`}
                      >
                        <SelectValue placeholder="Select State" />
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
                    <Label htmlFor="lga" className="text-sm font-medium text-gray-700">
                      LGA <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedLGA} onValueChange={setSelectedLGA} disabled={!selectedState} required>
                      <SelectTrigger
                        className={`mt-1 w-full px-4 py-3 border rounded-lg ${
                          selectedLGA === "" ? "border-red-300" : "border-gray-300"
                        }`}
                      >
                        <SelectValue placeholder="Select LGA" />
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

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Whatsapp Number"
                    className={`mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      phone.trim() === "" ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className={`w-full py-3 rounded-lg font-medium text-lg transition-all duration-300 ${
                    isFormValid()
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loading ? "SUBMITTING..." : "SUBMIT"}
                </Button>

                {!isFormValid() && (
                  <p className="text-sm text-red-500 text-center mt-2">
                    Please fill in all required fields to continue
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Right Side Illustration - Desktop Only */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-50">
            <div className="relative">
              <div className="relative w-full max-w-sm mx-auto">
                <img src="/strapre-profile.png" alt="Strapre Sign-in mockup" className="w-full h-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-red-900 text-white mt-12 hidden lg:block w-full">
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
