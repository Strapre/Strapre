"use client"

import { useState, useEffect, useRef } from "react"
import type React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Camera, Upload, X, Plus, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from '@/components/footer'
import { ENDPOINTS, getCorrectImageUrl } from "@/lib/api"

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

interface ProductImage {
  id: string
  url: string
}

interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  short_description?: string
  description: string
  price: string
  wholesale_price: string
  is_featured: number
  images: ProductImage[]
  created_at: string
  video_url?: string | null
}

interface ProductResponse {
  data: Product
}

export default function EditProductPage() {
  const [productName, setProductName] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [price, setPrice] = useState("")
  const [wholesalePrice, setWholesalePrice] = useState("")
  const [productImages, setProductImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])
  const [productVideo, setProductVideo] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("")
  const [videoDuration, setVideoDuration] = useState<number | null>(null)
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    // Check if user has auth token
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load existing profile data from userDetails
    loadProfileData()
    // Fetch categories and product data
    fetchCategories()
    if (slug) {
      fetchProduct(slug)
    }
  }, [router, slug])

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
      const response = await fetch(ENDPOINTS.categories, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      const responseData: CategoriesResponse = await response.json()
      if (response.ok) {
        const sortedCategories = responseData.data.sort((a, b) => a.name.localeCompare(b.name))
        setCategories(sortedCategories)
      } else {
        setCategories(staticCategories)
      }
    } catch (error) {
      console.error("Network error:", error)
      setCategories(staticCategories)
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchProduct = async (productSlug: string) => {
    setLoadingProduct(true)
    const token = localStorage.getItem("auth_token")
    try {
      const response = await fetch(ENDPOINTS.productBySlug(productSlug), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      const responseData: ProductResponse = await response.json()
      if (response.ok) {
        const product = responseData.data
        setProductName(product.name)
        setShortDescription(product.short_description || "")
        setDescription(product.description)
        setSelectedCategory(product.category_id)
        setPrice(product.price)
        setWholesalePrice(product.wholesale_price)
        setExistingImages(product.images)
        setExistingVideoUrl(product.video_url || null)
      } else {
        setError("Failed to load product data")
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoadingProduct(false)
    }
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
      setExistingVideoUrl(null)
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
    setExistingVideoUrl(null)
    if (videoInputRef.current) {
      videoInputRef.current.value = ""
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Check file sizes (max 2MB each)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    const oversizedFiles = files.filter((file) => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      setError(`Some images are too large. Maximum size is 2MB per image. Please compress and try again.`)
      return
    }

    // Limit to 5 images total (including existing)
    const totalImages = existingImages.length + productImages.length
    const remainingSlots = 5 - totalImages
    const filesToAdd = files.slice(0, remainingSlots)
    if (files.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more image(s). Maximum 5 images allowed.`)
    }

    const newImages = [...productImages, ...filesToAdd]
    setProductImages(newImages)

    // Create preview URLs
    const newPreviewUrls = [...imagePreviewUrls]
    filesToAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviewUrls.push(e.target?.result as string)
        setImagePreviewUrls([...newPreviewUrls])
      }
      reader.readAsDataURL(file)
    })

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "camera")
      fileInputRef.current.setAttribute("multiple", "")
      fileInputRef.current.click()
    }
  }

  const handleUploadFromGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture")
      fileInputRef.current.setAttribute("multiple", "")
      fileInputRef.current.click()
    }
  }

  const removeNewImage = (index: number) => {
    const newImages = productImages.filter((_, i) => i !== index)
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index)
    setProductImages(newImages)
    setImagePreviewUrls(newPreviewUrls)
  }

  const removeExistingImage = (index: number) => {
    const newExistingImages = existingImages.filter((_, i) => i !== index)
    setExistingImages(newExistingImages)
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
      setError("Wholesale price is required.")
      setLoading(false)
      return
    }

    if (Number.parseFloat(wholesalePrice) <= 0) {
      setError("Wholesale price must be greater than 0.")
      setLoading(false)
      return
    }

    if (Number.parseFloat(wholesalePrice) >= Number.parseFloat(price)) {
      setError("Wholesale price must be less than the regular price.")
      setLoading(false)
      return
    }

    if (existingImages.length === 0 && productImages.length === 0) {
      setError("At least one product image is required.")
      setLoading(false)
      return
    }

    if (!productVideo && !existingVideoUrl) {
      setError("A product video file is required.")
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
      formData.append("_method", "PUT")
      formData.append("existing_images", JSON.stringify(existingImages))

      // Append new images as array
      productImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })

      // Append video if present
      if (productVideo) {
        formData.append("video", productVideo)
      }

      console.log("=== UPDATING PRODUCT ===")
      console.log("Token:", token)
      console.log("Endpoint:", ENDPOINTS.productBySlug(slug))

      const response = await fetch(ENDPOINTS.productBySlug(slug), {
        method: "POST", // Using POST with _method=PUT for file uploads
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      })

      const data = await response.json()
      console.log("=== UPDATE PRODUCT RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response Data:", data)

      if (response.ok) {
        setSuccess("Product updated successfully!")
        // Redirect after success
        setTimeout(() => {
          router.push(`/my-store/products/${slug}`)
        }, 2000)
      } else {
        setError(data.message || "Failed to update product")
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

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CB0207] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  const totalImages = existingImages.length + productImages.length

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
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600">Update your product information</p>
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
              {/* Media Attachments Section */}
              <div className="border-b border-gray-200 pb-8 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Product Media</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your product video and image gallery</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Video Section */}
                  <div className="md:col-span-1 space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 block">
                      Product Video *
                    </Label>

                    {existingVideoUrl || productVideo ? (
                      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800 aspect-[9/16] max-h-[350px] flex items-center justify-center">
                        <video
                          src={existingVideoUrl ? getCorrectImageUrl(existingVideoUrl) : videoPreviewUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                          {existingVideoUrl ? "Current Video" : "New Video Feed"}
                        </div>
                        {videoDuration && (
                          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-medium text-white">
                            Duration: {videoDuration.toFixed(1)}s
                          </div>
                        )}
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
                          <Upload className="h-6 w-6 text-[#CB0207]" />
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
                      Product Images (1 to 5 images) *
                    </Label>
                    
                    {/* Image Upload Area */}
                    <div className="mb-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                        {/* Existing Images */}
                        {existingImages.map((image, index) => (
                          <div key={image.id} className="relative group aspect-square">
                            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                              <img
                                src={getCorrectImageUrl(image.url)}
                                alt={`Existing ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                              Current
                            </div>
                          </div>
                        ))}
                        {/* New Images */}
                        {imagePreviewUrls.map((url, index) => (
                          <div key={`new-${index}`} className="relative group aspect-square">
                            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 border-2 border-green-200">
                              <img
                                src={url || "/placeholder.svg"}
                                alt={`New ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">New</div>
                          </div>
                        ))}
                        {/* Add Image Button */}
                        {totalImages < 5 && (
                          <div 
                            onClick={handleUploadFromGallery}
                            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Plus className="h-8 w-8 text-gray-400 mb-1" />
                            <p className="text-[10px] text-gray-500 font-medium">Add Image</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          type="button"
                          onClick={handleTakePhoto}
                          disabled={totalImages >= 5}
                          className="bg-[#CB0207] hover:bg-[#A50206] text-white flex items-center justify-center space-x-2 disabled:opacity-50 py-2.5 rounded-xl h-11 text-xs"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Take Photos</span>
                        </Button>
                        <Button
                          type="button"
                          onClick={handleUploadFromGallery}
                          disabled={totalImages >= 5}
                          variant="outline"
                          className="border-gray-300 hover:border-[#CB0207] hover:text-[#CB0207] flex items-center justify-center space-x-2 bg-transparent disabled:opacity-50 py-2.5 rounded-xl h-11 text-xs"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload Images</span>
                        </Button>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-3 pl-1 leading-relaxed">
                        • Upload up to 5 images total. Maximum 5MB per image.<br/>
                        • Blue tag = current images, Green tag = new images.
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
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
                      💼 Wholesale Pricing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-blue-800 text-sm">
                      The wholesale price is a special vendor-to-vendor price that other merchants on the platform will
                      see when they want to purchase your products for resale. This price should be lower than your
                      regular price to encourage bulk purchases from other vendors.
                    </CardDescription>
                  </CardContent>
                </Card>
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
                  {loading ? "Updating Product..." : "Update Product"}
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
