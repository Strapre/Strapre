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

  // New media upload mode state
  const [uploadMode, setUploadMode] = useState<"image" | "video">("image")
  const [productVideo, setProductVideo] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("")
  const [videoDuration, setVideoDuration] = useState<number | null>(null)
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState("")
  const [videoThumbnailFile, setVideoThumbnailFile] = useState<File | null>(null)
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

  // Clean up video preview and thumbnail URLs when they change
  useEffect(() => {
    return () => {
      if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreviewUrl)
      }
      if (videoThumbnailUrl && videoThumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoThumbnailUrl)
      }
    }
  }, [videoPreviewUrl, videoThumbnailUrl])

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

  const extractVideoThumbnail = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.muted = true
      video.playsInline = true
      video.src = URL.createObjectURL(file)

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, video.duration / 2)
      }

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas")
          canvas.width = video.videoWidth || 640
          canvas.height = video.videoHeight || 360
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], "thumbnail.jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
              resolve(thumbnailFile)
            } else {
              reject(new Error("Canvas toBlob failed"))
            }
          }, "image/jpeg", 0.8)
        } catch (err) {
          reject(err)
        } finally {
          URL.revokeObjectURL(video.src)
        }
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

      // Also generate and preview thumbnail instantly for premium polish
      try {
        const thumbnailFile = await extractVideoThumbnail(file)
        setVideoThumbnailFile(thumbnailFile)
        const thumbUrl = URL.createObjectURL(thumbnailFile)
        setVideoThumbnailUrl(thumbUrl)
      } catch (thumbErr) {
        console.error("Failed to generate preview thumbnail:", thumbErr)
      }
      
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
    if (videoThumbnailUrl) {
      URL.revokeObjectURL(videoThumbnailUrl)
    }
    setProductVideo(null)
    setVideoPreviewUrl("")
    setVideoThumbnailUrl("")
    setVideoThumbnailFile(null)
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

    if (uploadMode === "image" && productImages.length === 0) {
      setError("At least one product image is required.")
      setLoading(false)
      return
    }

    if (uploadMode === "video" && !productVideo) {
      setError("A product video file is required.")
      setLoading(false)
      return
    }

    try {
      let finalImages = [...productImages]
      if (uploadMode === "video" && productVideo) {
        if (videoThumbnailFile) {
          finalImages = [videoThumbnailFile]
        } else {
          try {
            const thumbnail = await extractVideoThumbnail(productVideo)
            finalImages = [thumbnail]
          } catch (err) {
            console.error("Failed to generate video thumbnail:", err)
            setError("Failed to process video thumbnail. Please try another video.")
            setLoading(false)
            return
          }
        }
      }

      const formData = new FormData()
      formData.append("name", productName.trim())
      formData.append("description", description.trim())
      formData.append("category_id", selectedCategory)
      formData.append("price", price.trim())
      formData.append("wholesale_price", wholesalePrice.trim())

      // Append images as array
      finalImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })

      // Append video if present (only when in video upload mode)
      if (uploadMode === "video" && productVideo) {
        formData.append("video", productVideo)
      }

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Product Media</h3>
                    <p className="text-sm text-gray-500 mt-1">Select how you want to showcase your product</p>
                  </div>
                  
                  {/* Premium Mode Toggler */}
                  <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200/50 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMode("image")
                        removeVideo()
                      }}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        uploadMode === "image"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <ImageIcon className="h-4 w-4 text-[#CB0207]" />
                      Images
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMode("video")
                        setProductImages([])
                        setImagePreviewUrls([])
                      }}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        uploadMode === "video"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <Film className="h-4 w-4 text-[#CB0207]" />
                      Video
                    </button>
                  </div>
                </div>

                {/* IMAGE MODE VIEW */}
                {uploadMode === "image" && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Product Images (1 to 5 images) *
                      </Label>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {productImages.map((_, index) => (
                          <div key={index} className="relative aspect-square">
                            <div
                              className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50/50 cursor-pointer hover:border-[#CB0207] hover:bg-gray-50 transition-all duration-200"
                              onClick={() => fileInputRefs.current[index]?.click()}
                            >
                              {imagePreviewUrls[index] ? (
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
                                <Plus className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            
                            {imagePreviewUrls[index] && (
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
                        ))}

                        {/* Show one more empty box if under the limit */}
                        {productImages.length < MAX_IMAGES && (
                          <div className="relative aspect-square">
                            <div
                              className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-[#CB0207] hover:bg-red-50/30 transition-all duration-200"
                              onClick={() => fileInputRefs.current[productImages.length]?.click()}
                            >
                              <Plus className="h-8 w-8 text-gray-400 mb-1" />
                              <span className="text-xs text-gray-500 font-medium">Add Image</span>
                            </div>

                            <input
                              ref={(el) => { fileInputRefs.current[productImages.length] = el; }}
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleFileSelect(e, productImages.length)}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-gray-500 flex flex-col gap-1 pl-1">
                        <span>• Maximum size 5MB per image.</span>
                        <span>• Upload up to 5 images. You can select multiple at once.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIDEO MODE VIEW */}
                {uploadMode === "video" && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Product Video (Required) *
                      </Label>

                      {productVideo ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                          {/* Video Player */}
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

                          {/* Generated Thumbnail Card */}
                          <div className="flex flex-col justify-center">
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
                              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                <span className="w-2 h-2 rounded-full bg-[#CB0207]"></span>
                                Auto-generated Product Thumbnail
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed">
                                Our platform automatically extracts a thumbnail from your video to display as the cover image on traditional grids and search results.
                              </p>
                              
                              {videoThumbnailUrl ? (
                                <div className="relative aspect-square max-w-[150px] rounded-xl overflow-hidden border border-gray-200/80 shadow-sm group">
                                  <img
                                    src={videoThumbnailUrl}
                                    alt="Auto-generated thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <span className="text-white text-[10px] font-semibold">Video Cover</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="aspect-square max-w-[150px] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-white">
                                  <span className="text-[10px] text-gray-400 font-medium">Extracting...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => videoInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#CB0207] hover:bg-red-50/10 transition-all duration-300 group"
                        >
                          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                            <UploadCloud className="h-8 w-8 text-[#CB0207]" />
                          </div>
                          <span className="text-base font-semibold text-gray-800">Upload product video</span>
                          <span className="text-xs text-gray-500 mt-2 max-w-xs text-center leading-relaxed">
                            Recommended format: 9:16 vertical video. Max duration: 10 seconds. Max size: 20MB.
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
                  </div>
                )}
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
