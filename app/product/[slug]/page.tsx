"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, Menu, Search, Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProductImage {
  id: string
  url: string
}

interface ProductStore {
  id: string
  name: string
  slug: string
  store_lga: string
  store_state: string
  phone_number: string
}

interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  specifications: string[]
  brand: string
  price: string
  wholesale_price: string
  images: ProductImage[]
  store: ProductStore
  created_at: string
}

interface ApiResponse {
  data: Product
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    setIsAuthenticated(!!token)

    // Fetch product data
    if (params.slug) {
      fetchProduct(params.slug as string)
    }
  }, [params.slug])

  const fetchProduct = async (slug: string) => {
    setLoading(true)
    try {
      const response = await fetch(`https://gadg.vplaza.com.ng/api/v1/products/${slug}`)
      const data: ApiResponse = await response.json()

      if (response.ok) {
        setProduct(data.data)
      } else {
        setError("Product not found")
      }
    } catch (error) {
      setError("Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price)
    return `₦${numPrice.toLocaleString()}`
  }

  const handleContactAction = (action: "whatsapp" | "call") => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    if (!product) return

    if (action === "whatsapp") {
      const message = `Hi, I'm interested in your ${product.name} listed for ${formatPrice(product.price)}`
      const whatsappUrl = `https://wa.me/${product.store.phone_number}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")
    } else if (action === "call") {
      window.location.href = `tel:${product.store.phone_number}`
    }
  }

  const handleLoginRedirect = () => {
    // Store current URL to return after login
    localStorage.setItem("redirect_after_login", window.location.pathname)
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700 text-white">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="py-4">
                    <h3 className="font-semibold text-lg mb-4">Menu</h3>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-red-600 font-bold text-xl">LOGO</span>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 rounded-full border-gray-300"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                  variant="ghost"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>

              {isAuthenticated ? (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-red-100 text-red-600 text-sm">U</AvatarFallback>
                </Avatar>
              ) : (
                <Link href="/login">
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-4 text-sm">LOGIN / REGISTER</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImageIndex]?.url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=400&width=400"
                }}
              />
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/80 hover:bg-white">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? "border-red-600" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=80&width=80"
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-gray-900 mb-2">{formatPrice(product.price)}</p>
              <p className="text-gray-600">
                {product.store.store_lga}, {product.store.store_state}
              </p>
            </div>

            {/* Store Information */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-red-100 text-red-600">{product.store.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{product.store.name}</h3>
                  <p className="text-sm text-gray-600">
                    {product.store.store_lga}, {product.store.store_state}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleContactAction("whatsapp")}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Message on Whatsapp</span>
              </Button>

              <Button
                onClick={() => handleContactAction("call")}
                variant="outline"
                className="w-full border-red-600 text-red-600 hover:bg-red-50 py-3 flex items-center justify-center space-x-2"
              >
                <Phone className="h-5 w-5" />
                <span>Call Seller</span>
              </Button>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description:</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              You need to be logged in to contact the seller. Please login or create an account to continue.
            </p>
            <div className="flex space-x-3">
              <Button onClick={handleLoginRedirect} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                Login / Register
              </Button>
              <Button onClick={() => setShowLoginDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-red-900 text-white mt-12">
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
