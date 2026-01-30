<<<<<<< HEAD
"use client"

import { useState, useEffect, useRef } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, X, Plus, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoriesResponse {
  data: Category[]
}

interface ProductResponse {
  data: {
    id: string
    name: string
    slug: string
    description: string
    price: string
    wholesale_price: string
    category_id: string
    images: Array<{
      id: string
      url: string
    }>
    created_at: string
    updated_at: string
  }
}

export default function CreateProductPage() {
  const [productName, setProductName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [price, setPrice] = useState("")
  const [wholesalePrice, setWholesalePrice] = useState("")
  const [productImages, setProductImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [staticCategories] = useState<Category[]>([
    { id: "1", name: "Electronics", slug: "electronics" },
    { id: "2", name: "Fashion", slug: "fashion" },
    { id: "3", name: "Home & Garden", slug: "home-garden" },
    { id: "4", name: "Sports", slug: "sports" },
    { id: "5", name: "Books", slug: "books" },
  ])

  const [displayPrice, setDisplayPrice] = useState("")
  const [displayWholesalePrice, setDisplayWholesalePrice] = useState("")

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
  const MAX_IMAGE_WIDTH = 1200
  const MAX_IMAGE_HEIGHT = 1200
  const JPEG_QUALITY = 0.8
  const MAX_IMAGES = 5

    // ADD THESE HELPER FUNCTIONS HERE:
  const formatNumberWithCommas = (value) => {
    if (!value) return ""
    const numericValue = value.replace(/\D/g, "")
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const removeCommas = (value) => {
    return value.replace(/,/g, "")
  }

  useEffect(() => {
    // Check if user has auth token
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load existing profile data from userDetails
    loadProfileData()
    // Fetch categories
    fetchCategories()
  }, [router])

  // Add this useEffect to clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up all object URLs when component unmounts
      imagePreviewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

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

  const fetchCategories = async () => {
    setLoadingCategories(true)
    const token = localStorage.getItem("auth_token")

    try {
      console.log("=== FETCHING CATEGORIES ===")
      console.log("Token:", token)
      console.log("Endpoint:", "https://api.strapre.com/api/v1/categories")

      const response = await fetch("https://api.strapre.com/api/v1/categories", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const responseData: CategoriesResponse = await response.json()

      console.log("=== CATEGORIES RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response Data:", responseData)

      if (response.ok) {
        // Sort categories alphabetically by name
        const sortedCategories = responseData.data.sort((a, b) => a.name.localeCompare(b.name))
        setCategories(sortedCategories)
      } else {
        setError("Failed to load categories. Please try again.")
        // Fallback to static categories
        setCategories(staticCategories)
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Failed to load categories. Using default categories.")
      // Fallback to static categories
      setCategories(staticCategories)
    } finally {
      setLoadingCategories(false)
    }
  }

  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img

        if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
          const ratio = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
              resolve(resizedFile)
            } else {
              resolve(file)
            }
          },
          "image/jpeg",
          JPEG_QUALITY,
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleSearch = () => {
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const handleStateChange = () => {
    // Not needed for this page
  }

  const handleLGAChange = () => {
    // Not needed for this page
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, imageIndex: number) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Calculate how many slots are available
    const availableSlots = MAX_IMAGES - productImages.length
    
    // If no available slots, show error
    if (availableSlots <= 0) {
      setError("Maximum 5 images allowed. Please remove some images first.")
      return
    }

    // If user selected more files than available slots, take only what we can fit
    const filesToProcess = files.slice(0, availableSlots)
    
    // If we had to limit the selection, inform the user
    if (files.length > availableSlots) {
      setError(`You selected ${files.length} images, but only ${availableSlots} slot(s) available. Processing first ${filesToProcess.length} image(s).`)
    }

    const processedImages: File[] = []
    const processedPreviewUrls: string[] = []
    let hasError = false

    // Process each selected file
    for (const file of filesToProcess) {
      // Check file size (5MB limit)
      if (file.size > MAX_FILE_SIZE) {
        setError(`Image "${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 5MB.`)
        hasError = true
        continue
      }

      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not a valid image file.`)
        hasError = true
        continue
      }

      try {
        // Resize and compress the image
        const resizedFile = await resizeImage(file)
        processedImages.push(resizedFile)

        // Create preview URL synchronously using URL.createObjectURL
        const previewUrl = URL.createObjectURL(resizedFile)
        processedPreviewUrls.push(previewUrl)

      } catch (error) {
        console.error(`Error processing image "${file.name}":`, error)
        setError(`Error processing image "${file.name}". Please try again.`)
        hasError = true
      }
    }

    // Update state only once after all images are processed
    if (!hasError && processedImages.length > 0) {
      setProductImages(prev => [...prev, ...processedImages])
      setImagePreviewUrls(prev => [...prev, ...processedPreviewUrls])
      setError("") // Clear any previous errors
    }

    // Clear the input
    if (fileInputRefs.current[imageIndex]) {
      fileInputRefs.current[imageIndex]!.value = ""
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...productImages]
    const newPreviewUrls = [...imagePreviewUrls]

    // Clean up the object URL to prevent memory leaks
    if (newPreviewUrls[index]) {
      URL.revokeObjectURL(newPreviewUrls[index])
    }

    newImages.splice(index, 1)
    newPreviewUrls.splice(index, 1)

    setProductImages(newImages)
    setImagePreviewUrls(newPreviewUrls)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = removeCommas(inputValue)
    
    if (numericValue === "" || /^\d*\.?\d*$/.test(numericValue)) {
      setPrice(numericValue) // Raw value for backend
      setDisplayPrice(formatNumberWithCommas(numericValue)) // Formatted for display
    }
  }

  const handleWholesalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = removeCommas(inputValue)
    
    if (numericValue === "" || /^\d*\.?\d*$/.test(numericValue)) {
      setWholesalePrice(numericValue) // Raw value for backend
      setDisplayWholesalePrice(formatNumberWithCommas(numericValue)) // Formatted for display
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
    if (!productName.trim()) {
      setError("Product name is required.")
      setLoading(false)
      return
    }

    if (!description.trim()) {
      setError("Product description is required.")
      setLoading(false)
      return
    }

    if (!selectedCategory) {
      setError("Please select a category.")
      setLoading(false)
      return
    }

    if (!price.trim()) {
      setError("Product price is required.")
      setLoading(false)
      return
    }

    if (Number.parseFloat(price) <= 0) {
      setError("Product price must be greater than 0.")
      setLoading(false)
      return
    }

    if (!wholesalePrice.trim()) {
      setError("Vendor price is required.")
      setLoading(false)
      return
    }

    if (Number.parseFloat(wholesalePrice) <= 0) {
      setError("Vendor price must be greater than 0.")
      setLoading(false)
      return
    }

    if (Number.parseFloat(wholesalePrice) >= Number.parseFloat(price)) {
      setError("Vendor price must be less than the regular price.")
      setLoading(false)
      return
    }

    if (productImages.length === 0) {
      setError("At least one product image is required.")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", productName.trim())
      formData.append("description", description.trim())
      formData.append("category_id", selectedCategory)
      formData.append("price", price.trim())
      formData.append("wholesale_price", wholesalePrice.trim())

      // Append images as array
      productImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })


      const response = await fetch("https://api.strapre.com/api/v1/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      })

      const data: ProductResponse = await response.json()

      console.log("=== CREATE PRODUCT RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response Data:", data)

      if (response.ok) {
        setSuccess("Product created successfully!")
        // Redirect after success
        setTimeout(() => {
          router.push("/my-store/products")
        }, 2000)
      } else {
        setError(data.message || "Failed to create product")
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
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
              <p className="text-gray-600">Add a new product to your store</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product Images Section */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Images</h3>

                {/* Image Upload Areas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-4">
                  {/* Show existing images */}
                  {productImages.map((_, index) => (
                    <div key={index} className="relative">
                      <div
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-[#CB0207] transition-colors"
                        onClick={() => fileInputRefs.current[index]?.click()}
                      >
                        {imagePreviewUrls[index] ? (
                          <>
                            <img
                              src={imagePreviewUrls[index] || "/placeholder.svg"}
                              alt={`Product ${index + 1}`}
                              className="h-full w-full object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage(index)
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Plus className="h-6 w-6 text-gray-400" />
                        )}
                      </div>

                      <input
                        ref={(el) => (fileInputRefs.current[index] = el)}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileSelect(e, index)}
                        className="hidden"
                      />
                    </div>
                  ))}

                  {/* Show one more empty box if under the limit */}
                  {productImages.length < MAX_IMAGES && (
                    <div className="relative">
                      <div
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-[#CB0207] transition-colors"
                        onClick={() => fileInputRefs.current[productImages.length]?.click()}
                      >
                        <div className="text-center">
                          <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Add Image(s)</p>
                        </div>
                      </div>

                      <input
                        ref={(el) => (fileInputRefs.current[productImages.length] = el)}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileSelect(e, productImages.length)}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4">
                    <p>• Maximum 5MB per image</p>
                    <p>• You can select multiple images at once (up to 5 total)</p>
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>

                <div>
                  <Label htmlFor="productName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Product Name *
                  </Label>
                  <Input
                    id="productName"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                    Product Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product in detail. Include features, specifications, and benefits."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207] min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 block">
                    Category *
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]">
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select Category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pricing Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-2 block">
                      Regular Price (₦) *
                    </Label>
                    <Input
                      id="price"
                      type="text"
                      value={displayPrice}
                      onChange={handlePriceChange}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Price customers will see and pay</p>
                  </div>

                  <div>
                    <Label htmlFor="wholesalePrice" className="text-sm font-medium text-gray-700 mb-2 block">
                      Vendor Price (₦) *
                    </Label>
                    <Input
                      id="wholesalePrice"
                      type="text"
                      value={displayWholesalePrice}
                      onChange={handleWholesalePriceChange}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Special price for other vendors on the platform</p>
                  </div>
                </div>

                {/* Wholesale Price Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-blue-900 flex items-center">
                      💼 Vendor Pricing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-blue-800 text-sm">
                      The vendor price is a special vendor-to-vendor price that other merchants on the platform will see
                      when they want to purchase your products for resale. This price should be lower than your regular
                      price to encourage bulk purchases from other vendors.
                    </CardDescription>
                  </CardContent>
                </Card>
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
                  {loading ? "Creating Product..." : "Create Product"}
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
=======
"use client"

import { useState, useEffect, useRef } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, X, Plus, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoriesResponse {
  data: Category[]
}

interface ProductResponse {
  data: {
    id: string
    name: string
    slug: string
    description: string
    price: string
    wholesale_price: string
    category_id: string
    images: Array<{
      id: string
      url: string
    }>
    created_at: string
    updated_at: string
  }
}

export default function CreateProductPage() {
  const [productName, setProductName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [price, setPrice] = useState("")
  const [wholesalePrice, setWholesalePrice] = useState("")
  const [productImages, setProductImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [staticCategories] = useState<Category[]>([
    { id: "1", name: "Electronics", slug: "electronics" },
    { id: "2", name: "Fashion", slug: "fashion" },
    { id: "3", name: "Home & Garden", slug: "home-garden" },
    { id: "4", name: "Sports", slug: "sports" },
    { id: "5", name: "Books", slug: "books" },
  ])

  const [displayPrice, setDisplayPrice] = useState("")
  const [displayWholesalePrice, setDisplayWholesalePrice] = useState("")

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
  const MAX_IMAGE_WIDTH = 1200
  const MAX_IMAGE_HEIGHT = 1200
  const JPEG_QUALITY = 0.8
  const MAX_IMAGES = 5

    // ADD THESE HELPER FUNCTIONS HERE:
  const formatNumberWithCommas = (value) => {
    if (!value) return ""
    const numericValue = value.replace(/\D/g, "")
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const removeCommas = (value) => {
    return value.replace(/,/g, "")
  }

  useEffect(() => {
    // Check if user has auth token
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load existing profile data from userDetails
    loadProfileData()
    // Fetch categories
    fetchCategories()
  }, [router])

  // Add this useEffect to clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up all object URLs when component unmounts
      imagePreviewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

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

  const fetchCategories = async () => {
    setLoadingCategories(true)
    const token = localStorage.getItem("auth_token")

    try {
      console.log("=== FETCHING CATEGORIES ===")
      console.log("Token:", token)
      console.log("Endpoint:", "https://api.strapre.com/api/v1/categories")

      const response = await fetch("https://api.strapre.com/api/v1/categories", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const responseData: CategoriesResponse = await response.json()

      console.log("=== CATEGORIES RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response Data:", responseData)

      if (response.ok) {
        // Sort categories alphabetically by name
        const sortedCategories = responseData.data.sort((a, b) => a.name.localeCompare(b.name))
        setCategories(sortedCategories)
      } else {
        setError("Failed to load categories. Please try again.")
        // Fallback to static categories
        setCategories(staticCategories)
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Failed to load categories. Using default categories.")
      // Fallback to static categories
      setCategories(staticCategories)
    } finally {
      setLoadingCategories(false)
    }
  }

  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img

        if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
          const ratio = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
              resolve(resizedFile)
            } else {
              resolve(file)
            }
          },
          "image/jpeg",
          JPEG_QUALITY,
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleSearch = () => {
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const handleStateChange = () => {
    // Not needed for this page
  }

  const handleLGAChange = () => {
    // Not needed for this page
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, imageIndex: number) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Calculate how many slots are available
    const availableSlots = MAX_IMAGES - productImages.length
    
    // If no available slots, show error
    if (availableSlots <= 0) {
      setError("Maximum 5 images allowed. Please remove some images first.")
      return
    }

    // If user selected more files than available slots, take only what we can fit
    const filesToProcess = files.slice(0, availableSlots)
    
    // If we had to limit the selection, inform the user
    if (files.length > availableSlots) {
      setError(`You selected ${files.length} images, but only ${availableSlots} slot(s) available. Processing first ${filesToProcess.length} image(s).`)
    }

    const processedImages: File[] = []
    const processedPreviewUrls: string[] = []
    let hasError = false

    // Process each selected file
    for (const file of filesToProcess) {
      // Check file size (5MB limit)
      if (file.size > MAX_FILE_SIZE) {
        setError(`Image "${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 5MB.`)
        hasError = true
        continue
      }

      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not a valid image file.`)
        hasError = true
        continue
      }

      try {
        // Resize and compress the image
        const resizedFile = await resizeImage(file)
        processedImages.push(resizedFile)

        // Create preview URL synchronously using URL.createObjectURL
        const previewUrl = URL.createObjectURL(resizedFile)
        processedPreviewUrls.push(previewUrl)

      } catch (error) {
        console.error(`Error processing image "${file.name}":`, error)
        setError(`Error processing image "${file.name}". Please try again.`)
        hasError = true
      }
    }

    // Update state only once after all images are processed
    if (!hasError && processedImages.length > 0) {
      setProductImages(prev => [...prev, ...processedImages])
      setImagePreviewUrls(prev => [...prev, ...processedPreviewUrls])
      setError("") // Clear any previous errors
    }

    // Clear the input
    if (fileInputRefs.current[imageIndex]) {
      fileInputRefs.current[imageIndex]!.value = ""
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...productImages]
    const newPreviewUrls = [...imagePreviewUrls]

    // Clean up the object URL to prevent memory leaks
    if (newPreviewUrls[index]) {
      URL.revokeObjectURL(newPreviewUrls[index])
    }

    newImages.splice(index, 1)
    newPreviewUrls.splice(index, 1)

    setProductImages(newImages)
    setImagePreviewUrls(newPreviewUrls)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = removeCommas(inputValue)
    
    if (numericValue === "" || /^\d*\.?\d*$/.test(numericValue)) {
      setPrice(numericValue) // Raw value for backend
      setDisplayPrice(formatNumberWithCommas(numericValue)) // Formatted for display
    }
  }

  const handleWholesalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = removeCommas(inputValue)
    
    if (numericValue === "" || /^\d*\.?\d*$/.test(numericValue)) {
      setWholesalePrice(numericValue) // Raw value for backend
      setDisplayWholesalePrice(formatNumberWithCommas(numericValue)) // Formatted for display
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
    if (!productName.trim()) {
      setError("Product name is required.")
      setLoading(false)
      return
    }

    if (!description.trim()) {
      setError("Product description is required.")
      setLoading(false)
      return
    }

    if (!selectedCategory) {
      setError("Please select a category.")
      setLoading(false)
      return
    }

    if (!price.trim()) {
      setError("Product price is required.")
      setLoading(false)
      return
    }

    if (Number.parseFloat(price) <= 0) {
      setError("Product price must be greater than 0.")
      setLoading(false)
      return
    }

    if (!wholesalePrice.trim()) {
      setError("Vendor price is required.")
      setLoading(false)
      return
    }

    if (Number.parseFloat(wholesalePrice) <= 0) {
      setError("Vendor price must be greater than 0.")
      setLoading(false)
      return
    }

    if (Number.parseFloat(wholesalePrice) >= Number.parseFloat(price)) {
      setError("Vendor price must be less than the regular price.")
      setLoading(false)
      return
    }

    if (productImages.length === 0) {
      setError("At least one product image is required.")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", productName.trim())
      formData.append("description", description.trim())
      formData.append("category_id", selectedCategory)
      formData.append("price", price.trim())
      formData.append("wholesale_price", wholesalePrice.trim())

      // Append images as array
      productImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })


      const response = await fetch("https://api.strapre.com/api/v1/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      })

      const data: ProductResponse = await response.json()

      console.log("=== CREATE PRODUCT RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response Data:", data)

      if (response.ok) {
        setSuccess("Product created successfully!")
        // Redirect after success
        setTimeout(() => {
          router.push("/my-store/products")
        }, 2000)
      } else {
        setError(data.message || "Failed to create product")
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
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
              <p className="text-gray-600">Add a new product to your store</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product Images Section */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Images</h3>

                {/* Image Upload Areas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-4">
                  {/* Show existing images */}
                  {productImages.map((_, index) => (
                    <div key={index} className="relative">
                      <div
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-[#CB0207] transition-colors"
                        onClick={() => fileInputRefs.current[index]?.click()}
                      >
                        {imagePreviewUrls[index] ? (
                          <>
                            <img
                              src={imagePreviewUrls[index] || "/placeholder.svg"}
                              alt={`Product ${index + 1}`}
                              className="h-full w-full object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage(index)
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Plus className="h-6 w-6 text-gray-400" />
                        )}
                      </div>

                      <input
                        ref={(el) => (fileInputRefs.current[index] = el)}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileSelect(e, index)}
                        className="hidden"
                      />
                    </div>
                  ))}

                  {/* Show one more empty box if under the limit */}
                  {productImages.length < MAX_IMAGES && (
                    <div className="relative">
                      <div
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-[#CB0207] transition-colors"
                        onClick={() => fileInputRefs.current[productImages.length]?.click()}
                      >
                        <div className="text-center">
                          <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Add Image(s)</p>
                        </div>
                      </div>

                      <input
                        ref={(el) => (fileInputRefs.current[productImages.length] = el)}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileSelect(e, productImages.length)}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4">
                    <p>• Maximum 5MB per image</p>
                    <p>• You can select multiple images at once (up to 5 total)</p>
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>

                <div>
                  <Label htmlFor="productName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Product Name *
                  </Label>
                  <Input
                    id="productName"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                    Product Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product in detail. Include features, specifications, and benefits."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207] min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 block">
                    Category *
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]">
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select Category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pricing Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-2 block">
                      Regular Price (₦) *
                    </Label>
                    <Input
                      id="price"
                      type="text"
                      value={displayPrice}
                      onChange={handlePriceChange}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Price customers will see and pay</p>
                  </div>

                  <div>
                    <Label htmlFor="wholesalePrice" className="text-sm font-medium text-gray-700 mb-2 block">
                      Vendor Price (₦) *
                    </Label>
                    <Input
                      id="wholesalePrice"
                      type="text"
                      value={displayWholesalePrice}
                      onChange={handleWholesalePriceChange}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207]"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Special price for other vendors on the platform</p>
                  </div>
                </div>

                {/* Wholesale Price Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-blue-900 flex items-center">
                      💼 Vendor Pricing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-blue-800 text-sm">
                      The vendor price is a special vendor-to-vendor price that other merchants on the platform will see
                      when they want to purchase your products for resale. This price should be lower than your regular
                      price to encourage bulk purchases from other vendors.
                    </CardDescription>
                  </CardContent>
                </Card>
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
                  {loading ? "Creating Product..." : "Create Product"}
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
>>>>>>> 533c22393c774a56ed1968293eb2ddaf3c4ec728
