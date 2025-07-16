"use client"

import { useState, useEffect, useRef } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Upload, X, Plus, Package } from "lucide-react"
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
  const [showImageOptions, setShowImageOptions] = useState<boolean[]>([false, false, false, false, false])
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

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
  const MAX_IMAGE_WIDTH = 1200
  const MAX_IMAGE_HEIGHT = 1200
  const JPEG_QUALITY = 0.8

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

    const file = files[0]

    // Check file size (5MB limit)
    if (file.size > MAX_FILE_SIZE) {
      setError(`Image size must be less than 5MB. Selected image is ${(file.size / (1024 * 1024)).toFixed(2)}MB`)
      return
    }

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    try {
      // Resize and compress the image
      const resizedFile = await resizeImage(file)

      // Add to the arrays
      const newImages = [...productImages]
      const newPreviewUrls = [...imagePreviewUrls]

      // If adding to existing slot, replace it
      if (imageIndex < newImages.length) {
        newImages[imageIndex] = resizedFile
      } else {
        // Adding new image
        newImages.push(resizedFile)
      }

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        if (imageIndex < newPreviewUrls.length) {
          newPreviewUrls[imageIndex] = e.target?.result as string
        } else {
          newPreviewUrls.push(e.target?.result as string)
        }
        setImagePreviewUrls([...newPreviewUrls])
      }
      reader.readAsDataURL(resizedFile)

      setProductImages(newImages)

      // Hide dropdown
      const newShowOptions = [...showImageOptions]
      newShowOptions[imageIndex] = false
      setShowImageOptions(newShowOptions)

      // Clear any previous errors
      setError("")
    } catch (error) {
      console.error("Error processing image:", error)
      setError("Error processing image. Please try again.")
    }

    // Clear the input
    if (fileInputRefs.current[imageIndex]) {
      fileInputRefs.current[imageIndex]!.value = ""
    }
  }

  const handleTakePhoto = (imageIndex: number) => {
    if (fileInputRefs.current[imageIndex]) {
      fileInputRefs.current[imageIndex]!.setAttribute("capture", "camera")
      fileInputRefs.current[imageIndex]!.click()
    }
  }

  const handleUploadFromGallery = (imageIndex: number) => {
    if (fileInputRefs.current[imageIndex]) {
      fileInputRefs.current[imageIndex]!.removeAttribute("capture")
      fileInputRefs.current[imageIndex]!.click()
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...productImages]
    const newPreviewUrls = [...imagePreviewUrls]

    newImages.splice(index, 1)
    newPreviewUrls.splice(index, 1)

    setProductImages(newImages)
    setImagePreviewUrls(newPreviewUrls)
  }

  const toggleImageOptions = (index: number) => {
    const newShowOptions = [...showImageOptions]
    newShowOptions[index] = !newShowOptions[index]
    // Close all other dropdowns
    for (let i = 0; i < newShowOptions.length; i++) {
      if (i !== index) {
        newShowOptions[i] = false
      }
    }
    setShowImageOptions(newShowOptions)
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

      // Console log for debugging
      console.log("=== CREATING PRODUCT ===")
      console.log("Token:", token)
      console.log("Endpoint:", "https://api.strapre.com/api/v1/products")
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
                        onClick={() => toggleImageOptions(index)}
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

                      {showImageOptions[index] && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
                          <Button
                            type="button"
                            onClick={() => handleTakePhoto(index)}
                            className="w-full mb-2 bg-[#CB0207] hover:bg-[#A50206] text-white flex items-center justify-center space-x-2"
                          >
                            <Camera className="h-4 w-4" />
                            <span>Take Photo</span>
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleUploadFromGallery(index)}
                            variant="outline"
                            className="w-full border-gray-300 hover:border-[#CB0207] hover:text-[#CB0207] flex items-center justify-center space-x-2 bg-transparent"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Upload Image</span>
                          </Button>
                        </div>
                      )}

                      <input
                        ref={(el) => (fileInputRefs.current[index] = el)}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, index)}
                        className="hidden"
                      />
                    </div>
                  ))}

                  {/* Show one more empty box if under the limit */}
                  {productImages.length < 5 && (
                    <div className="relative">
                      <div
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-[#CB0207] transition-colors"
                        onClick={() => toggleImageOptions(productImages.length)}
                      >
                        <div className="text-center">
                          <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Add Image</p>
                        </div>
                      </div>

                      {showImageOptions[productImages.length] && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
                          <Button
                            type="button"
                            onClick={() => handleTakePhoto(productImages.length)}
                            className="w-full mb-2 bg-[#CB0207] hover:bg-[#A50206] text-white flex items-center justify-center space-x-2"
                          >
                            <Camera className="h-4 w-4" />
                            <span>Take Photo</span>
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleUploadFromGallery(productImages.length)}
                            variant="outline"
                            className="w-full border-gray-300 hover:border-[#CB0207] hover:text-[#CB0207] flex items-center justify-center space-x-2 bg-transparent"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Upload Image</span>
                          </Button>
                        </div>
                      )}

                      <input
                        ref={(el) => (fileInputRefs.current[productImages.length] = el)}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, productImages.length)}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4">
                  <ul className="text-xs text-blue-700">
                    <li>• Maximum 5MB per image</li>
                  </ul>
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
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
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
                      type="number"
                      step="0.01"
                      min="0"
                      value={wholesalePrice}
                      onChange={(e) => setWholesalePrice(e.target.value)}
                      placeholder="0.00"
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
