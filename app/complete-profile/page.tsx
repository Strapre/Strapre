"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera, Upload } from "lucide-react"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      // Console log all form data being sent
      console.log("=== FORM DATA BEING SENT TO BACKEND ===")
      console.log("Token:", token)
      console.log("Endpoint:", "https://ga.vplaza.com.ng/api/v1/auth/complete-profile")
      console.log("Method:", "POST")
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
      })

      console.log("Form Data Contents:")
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, {
            name: value.name,
            size: value.size,
            type: value.type,
            lastModified: value.lastModified,
          })
        } else {
          console.log(`${key}:`, value)
        }
      }
      console.log("=== END FORM DATA ===")

      const response = await fetch("https://ga.vplaza.com.ng/api/v1/auth/complete-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json", 
        },
        body: formData,
      })

      const data = await response.json()

      console.log("=== BACKEND RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response Data:", data)
      console.log("=== END RESPONSE ===")

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

              
            <Link href="#">
                <Button className=" bg-[#CB0207] hover:bg-[#A50206] text-white text-[10px] md:text-[12px] px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  LOGIN / REGISTER
                </Button>
              </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6  ">
        <div className="flex gap-8 justify-center">
          {/* Main Content */}
          <div className="flex-1 max-w-2xl">

            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-red-600 mb-2">Complete Profile</h1>
                <p className="text-gray-600">COMPLETE YOUR PROFILE TODAY</p>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50 mb-6">
                  <AlertDescription className="text-red-600">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profilePicturePreview || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gray-100 text-gray-400 text-lg">
                        <Camera className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-3">Let's start with your gadgets</p>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        onClick={handleTakePhoto}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 flex items-center space-x-2"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Take new photo</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={handleUploadFromGallery}
                        variant="outline"
                        className="text-sm px-4 py-2 flex items-center space-x-2 bg-transparent"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload from gallery</span>
                      </Button>
                    </div>
                  </div>

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
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                      State
                    </Label>
                    <Select value={selectedState} onValueChange={setSelectedState} required>
                      <SelectTrigger className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg">
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
                      LGA
                    </Label>
                    <Select value={selectedLGA} onValueChange={setSelectedLGA} disabled={!selectedState} required>
                      <SelectTrigger className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg">
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
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Whatsapp Number"
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium text-lg"
                >
                  {loading ? "SUBMITTING..." : "SUBMIT"}
                </Button>
              </form>
            </div>
          </div>

          {/* Right Side Illustration - Desktop Only */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-50">
          <div className="relative">
            <div className="relative w-full max-w-sm mx-auto">
              <img
                src="/strapre-profile.png"
                alt="Strapre Sign-in mockup"
                className="w-full h-auto object-contain"
              />
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
