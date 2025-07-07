"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, Menu, ChevronDown, ChevronRight, Heart, User, LogOut, MapPin, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductImage {
  id: string
  url: string
}

interface ProductStore {
  id: string
  name: string
  slug: string
  store_state?: string
  store_lga?: string
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
  is_featured: number
}

interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product: Product
}

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  profile_picture: string | null
}

interface UserStore {
  id: string
  user_id: string
  store_name: string
  slug: string
  store_description: string
  store_image: string
  phone: string
  email: string
  state_id: string
  lga_id: string
  address: string
  subscription_expires_at: string
  is_active: number
  created_at: string
  updated_at: string
}

interface ApiResponse<T> {
  data: T[]
  links?: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta?: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
  }
}

export default function WishlistPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStore, setUserStore] = useState<UserStore | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [removingItems, setRemovingItems] = useState<string[]>([])
  const router = useRouter()

  // Check authentication and fetch user data
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      setIsAuthenticated(true)
      fetchUserProfile(token)
      fetchUserStore(token)
      fetchWishlist(token)
    } else {
      router.push("/login")
    }
  }, [])

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/auth/get-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setUserProfile(data.data)
        localStorage.setItem("userDetails", JSON.stringify(data.data))

        if (!data.data.first_name) {
          router.push("/complete-profile")
          return
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchUserStore = async (token: string) => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/mystore", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUserStore(data)
        localStorage.setItem("userStore", JSON.stringify(data))
      }
    } catch (error) {
      console.error("Error fetching user store:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/categories")
      const data: ApiResponse<Category> = await response.json()
      setCategories(data.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchWishlist = async (token: string) => {
    setLoading(true)
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    setRemovingItems((prev) => [...prev, productId])

    try {
      const response = await fetch(`https://ga.vplaza.com.ng/api/v1/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove item from local state
        setWishlistItems((prev) => prev.filter((item) => item.product.id !== productId))
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    } finally {
      setRemovingItems((prev) => prev.filter((id) => id !== productId))
    }
  }

  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price)
    return `₦${numPrice.toLocaleString()}`
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    setIsAuthenticated(false)
    setUserProfile(null)
    setUserStore(null)
    router.push("/login")
  }

  const getUserInitials = () => {
    if (!userProfile || !userProfile.first_name || !userProfile.last_name) return "U"
    return `${userProfile.first_name[0]}${userProfile.last_name[0]}`
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your wishlist</p>
          <Link href="/login">
            <Button className="bg-[#CB0207] hover:bg-[#A50206] text-white px-6 py-3 rounded-xl">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-xl">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-white overflow-y-auto">
                  <div className="py-6 h-full flex flex-col">
                    {/* User Profile Section */}
                    {userProfile && (
                      <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200 flex-shrink-0">
                        <Avatar className="h-14 w-14 ring-2 ring-[#CB0207]/20">
                          <AvatarImage
                            src={userProfile.profile_picture || ""}
                            alt={`${userProfile.first_name} ${userProfile.last_name}`}
                          />
                          <AvatarFallback className="bg-[#CB0207] text-white font-bold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-gray-800">{`${userProfile.first_name} ${userProfile.last_name}`}</h3>
                          <p className="text-sm text-gray-500">{userProfile.email}</p>
                        </div>
                      </div>
                    )}

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto">
                      <h3 className="font-bold text-xl mb-6 text-gray-800">All Categories</h3>
                      <div className="space-y-1 mb-8">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/category/${category.id}`}
                            className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200 group"
                          >
                            <span className="text-sm font-medium truncate pr-2 flex-1 group-hover:text-[#CB0207]">
                              {category.name}
                            </span>
                            <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-[#CB0207]" />
                          </Link>
                        ))}
                      </div>

                      <div className="space-y-3 mb-8">
                        <div
                          onClick={() => {
                            window.open("https://wa.me/2348138695216?text=Hello%2C%20I%20need%20help%21", "_blank")
                          }}
                          className="py-3 px-4 text-sm cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium"
                        >
                          💬 Message Support
                        </div>
                      </div>
                    </div>

                    {/* Fixed bottom button */}
                    <div className="flex-shrink-0 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => {
                          if (userStore) {
                            router.push("/my-store")
                          } else {
                            router.push("/create-store")
                          }
                        }}
                        className={`w-full ${
                          userStore ? "bg-green-600 hover:bg-green-700" : "bg-[#CB0207] hover:bg-[#A50206]"
                        } text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        {userStore ? "View My Store" : "Become a Merchant"}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <div className="hidden md:flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
                  <img src="/strapre-logo.jpg" alt="Strapre Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-[#CB0207] font-bold text-xl">Strapre</span>
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search your wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 rounded-2xl border-2 border-gray-200 focus:border-[#CB0207] focus:ring-2 focus:ring-[#CB0207]/20 transition-all duration-300 h-12"
                />
                <Button
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl bg-[#CB0207] hover:bg-[#A50206] text-white h-8 w-8"
                  variant="ghost"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-xl relative">
                  <Heart className="h-5 w-5 fill-[#CB0207] text-[#CB0207]" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#CB0207] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Button>
              </Link>

              {userProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-3 hover:bg-gray-100 rounded-xl px-3 h-14"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-[#CB0207]/20">
                        <AvatarImage src={userProfile.profile_picture || ""} />
                        <AvatarFallback className="bg-[#CB0207] text-white font-bold text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">{`${userProfile.first_name} ${userProfile.last_name}`}</p>
                        <p className="text-xs text-gray-500">{userProfile.email}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-0">
                    <DropdownMenuItem className="rounded-lg" onClick={() => router.push("/edit-profile")}>
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (userStore) {
                          router.push("/my-store")
                        } else {
                          router.push("/create-store")
                        }
                      }}
                    >
                      <span className="h-4 w-4 mr-2">S</span>
                      {userStore ? "View My Store" : "Become a Merchant"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile User Avatar */}
            <div className="flex md:hidden space-x-2">
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-xl relative">
                  <Heart className="h-7 w-7 fill-[#CB0207] text-[#CB0207]" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#CB0207] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Button>
              </Link>
              {userProfile && (
                <Avatar className="h-8 w-8 ring-2 ring-[#CB0207]/20">
                  <AvatarImage src={userProfile.profile_picture || ""} />
                  <AvatarFallback className="bg-[#CB0207] text-white font-bold text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search your wishlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 rounded-2xl border-2 border-gray-200 focus:border-[#CB0207] focus:ring-2 focus:ring-[#CB0207]/20 transition-all duration-300"
              />
              <Button
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl bg-[#CB0207] hover:bg-[#A50206] text-white h-8 w-8"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-2 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden md:block w-72">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-xl mb-6 text-gray-800">All Categories</h3>
              <div className="space-y-1">
                {categories.slice(0, 20).map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.id}`}
                    className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200 group"
                  >
                    <span className="text-sm font-medium truncate pr-2 flex-1 group-hover:text-[#CB0207]">
                      {category.name}
                    </span>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-[#CB0207]" />
                  </Link>
                ))}
                {categories.length > 20 && (
                  <div className="py-3 px-4 text-sm text-[#CB0207] cursor-pointer font-medium hover:bg-gray-50 rounded-xl transition-all duration-200">
                    See More
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Back Button */}
                    <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Link>
            {/* Page Header */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">My Wishlist</h1>
                  <p className="text-gray-600">
                    {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-8 w-8 text-[#CB0207] fill-[#CB0207]" />
                </div>
              </div>
            </div>

            {/* Wishlist Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 md:p-8">
              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB0207] border-t-transparent"></div>
                </div>
              )}

              {/* Empty Wishlist */}
              {!loading && wishlistItems.length === 0 && (
                <div className="text-center py-16">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-600 mb-6">Start adding products you love to your wishlist</p>
                  <Link href="/">
                    <Button className="bg-[#CB0207] hover:bg-[#A50206] text-white px-6 py-3 rounded-xl">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              )}

              {/* Wishlist Products Grid */}
              {!loading && wishlistItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 pb-2">
                  {wishlistItems
                    .filter((item) =>
                      searchQuery === "" ? true : item.product.name.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map((item) => (
                      <div key={item.id} className="relative">
                        <Link href={`/product/${item.product.slug}`}>
                          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-lg card-hover rounded-xl">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-32 md:h-48 relative">
                              {item.product.images.length > 0 ? (
                                <Image
                                  src={item.product.images[0].url || "/placeholder.svg"}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=200&width=200"
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-400 text-xs">No Image</span>
                                </div>
                              )}
                            </div>
                            <CardContent className="p-2">
                              <h3 className="font-semibold text-xs md:text-sm mb-1 md:mb-3 line-clamp-2 text-gray-800">
                                {item.product.name}
                              </h3>
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-sm md:text-lg text-[#CB0207]">
                                  {formatPrice(item.product.price)}
                                </span>
                                {item.product.is_featured === 1 && (
                                  <span className="bg-[#CB0207] text-white text-xs px-2 py-1 rounded-lg font-medium">
                                    Ad
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {item.product.store.store_lga || "N/A"}, {item.product.store.store_state || "N/A"}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 z-10 rounded-full w-8 h-8 bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removeFromWishlist(item.product.id)
                          }}
                          disabled={removingItems.includes(item.product.id)}
                        >
                          {removingItems.includes(item.product.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                </div>
              )}

              {/* No Search Results */}
              {!loading &&
                wishlistItems.length > 0 &&
                wishlistItems.filter((item) => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .length === 0 && (
                  <div className="text-center py-16">
                    <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                    <p className="text-gray-600">Try searching with different keywords</p>
                  </div>
                )}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#CB0207] to-[#A50206] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-6">Buy</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Create account
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Bid
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Gift cards
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-6">Sell</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Become a seller
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Auction
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Store
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-6">Logistics</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Local
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Cross border
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-6">Customer Support</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Contact us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200 transition-colors duration-200">
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <a href="#" className="text-white hover:text-gray-200 transition-colors duration-200">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                  <span className="text-white font-bold">f</span>
                </div>
              </a>
              <a href="#" className="text-white hover:text-gray-200 transition-colors duration-200">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                  <span className="text-white font-bold">in</span>
                </div>
              </a>
              <a href="#" className="text-white hover:text-gray-200 transition-colors duration-200">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                  <span className="text-white font-bold">@</span>
                </div>
              </a>
            </div>
            <p className="text-sm text-white/80">© 2025 Strapre. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
