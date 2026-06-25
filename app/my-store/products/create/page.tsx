"use client"

import { useState, useEffect, useRef } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, X, Plus, Package, Image as ImageIcon, Film, UploadCloud, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ENDPOINTS } from "@/lib/api"

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
  message?: string
  data: {
    id: string
    name: string
    slug: string
    short_description?: string
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
  const [shortDescription, setShortDescription] = useState("")
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

  const [productVideo, setProductVideo] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("")
  const [videoDuration, setVideoDuration] = useState<number | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
  const MAX_IMAGE_WIDTH = 1200
  const MAX_IMAGE_HEIGHT = 1200
  const JPEG_QUALITY = 0.8
  const MAX_IMAGES = 5

    // ADD THESE HELPER FUNCTIONS HERE:
  const formatNumberWithCommas = (value: string) => {
    if (!value) return ""
    const numericValue = value.replace(/\D/g, "")
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const removeCommas = (value: string) => {
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

  // Clean up image preview URLs when they change
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [imagePreviewUrls])

  // Clean up video preview URL when it changes
  useEffect(() => {
    return () => {
      if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreviewUrl)
      }
    }
  }, [videoPreviewUrl])

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
      console.log("Endpoint:", ENDPOINTS.categories)

      const response = await fetch(ENDPOINTS.categories, {
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

  const checkVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.src = URL.createObjectURL(file)
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }
      video.onerror = (err) => {
        URL.revokeObjectURL(video.src)
        reject(err)
      }
    })
  }

  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError("")

    const MAX_VIDEO_SIZE = 20 * 1024 * 1024
    if (file.size > MAX_VIDEO_SIZE) {
      setError(`Video is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 20MB.`)
      return
    }

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.")
      return
    }

    try {
      setLoading(true)
      const duration = await checkVideoDuration(file)

      if (duration > 10.5) {
        setError(`The video duration (${duration.toFixed(1)}s) exceeds the maximum limit of 10 seconds.`)
        setLoading(false)
        return
      }

      setProductVideo(file)
      setVideoDuration(duration)
      const previewUrl = URL.createObjectURL(file)
      setVideoPreviewUrl(previewUrl)
      
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.error("Error reading video metadata:", err)
      setError("Failed to read video file. Please try another video.")
    }
  }

  const removeVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
    }
    setProductVideo(null)
    setVideoPreviewUrl("")
    setVideoDuration(null)
    if (videoInputRef.current) {
      videoInputRef.current.value = ""
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

    if (!shortDescription.trim()) {
      setError("Product short description is required.")
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

    if (!productVideo) {
      setError("A product video file is required.")
      setLoading(false)
      return
    }

    if (productImages.length < 2) {
      setError("At least 2 product images are required with the video.")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", productName.trim())
      formData.append("short_description", shortDescription.trim())
      formData.append("description", description.trim())
      formData.append("category_id", selectedCategory)
      formData.append("price", price.trim())
      formData.append("wholesale_price", wholesalePrice.trim())

      // Append images as array
      productImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })

      // Append video
      formData.append("video", productVideo)

      const response = await fetch(ENDPOINTS.products, {
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
              {/* Media Attachments Section */}
              <div className="border-b border-gray-200 pb-8 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Product Media</h3>
                  <p className="text-sm text-gray-500 mt-1">Upload a product showcase video and at least 2 images (the first will be your cover image)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Video Section */}
                  <div className="md:col-span-1 space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 block">
                      Product Video *
                    </Label>

                    {productVideo ? (
                      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800 aspect-[9/16] max-h-[350px] flex items-center justify-center">
                        <video
                          src={videoPreviewUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                          Video Feed
                        </div>
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-medium text-white">
                          Duration: {videoDuration ? `${videoDuration.toFixed(1)}s` : "--"}
                        </div>
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#CB0207] hover:bg-red-50/10 transition-all duration-300 aspect-[9/16] max-h-[350px] group"
                      >
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110">
                          <UploadCloud className="h-6 w-6 text-[#CB0207]" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 text-center">Upload product video</span>
                        <span className="text-[10px] text-gray-500 mt-2 text-center leading-relaxed">
                          9:16 vertical video. Max 10s. Max 20MB.
                        </span>
                        
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleVideoSelect}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Images Section */}
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 block">
                      Product Images (2 to 5 images) *
                    </Label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {Array.from({ length: MAX_IMAGES }).map((_, index) => {
                        const hasImage = !!imagePreviewUrls[index];
                        const isSlotClickable = index <= productImages.length;
                        const shouldShow = hasImage || isSlotClickable || index < 2;

                        if (!shouldShow) return null;

                        return (
                          <div key={index} className="relative aspect-square">
                            <div
                              className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden bg-gray-50/50 cursor-pointer hover:border-[#CB0207] hover:bg-gray-50 transition-all duration-200"
                              onClick={() => fileInputRefs.current[index]?.click()}
                            >
                              {hasImage ? (
                                <div className="relative w-full h-full group">
                                  <img
                                    src={imagePreviewUrls[index]}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                    <p className="text-white text-xs font-semibold">Change Image</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center p-2 text-center">
                                  <Plus className="h-5 w-5 text-gray-400 mb-1" />
                                  <span className="text-[10px] text-gray-500 font-medium">
                                    {index === 0 ? "Cover Image *" : index === 1 ? "Image 2 *" : `Image ${index + 1}`}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {hasImage && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeImage(index)
                                }}
                                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md border border-white transition-all duration-200"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <input
                              ref={(el) => { fileInputRefs.current[index] = el; }}
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleFileSelect(e, index)}
                              className="hidden"
                            />
                          </div>
                        )
                      })}
                    </div>

                    <div className="text-xs text-gray-500 flex flex-col gap-1 pt-2">
                      <span>• First image will be used as the product cover image.</span>
                      <span>• Minimum 2 images are required, maximum 5.</span>
                      <span>• Maximum size 5MB per image.</span>
                    </div>
                  </div>
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
                  <Label htmlFor="shortDescription" className="text-sm font-medium text-gray-700 mb-2 block">
                    Product Short Description *
                  </Label>
                  <Textarea
                    id="shortDescription"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Enter a brief summary of the product (displayed on card lists)."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CB0207] focus:border-[#CB0207] min-h-[80px]"
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
