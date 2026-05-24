"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Menu, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const categories = [
  "Mobile phones",
  "Laptops",
  "Speakers",
  "Gaming",
  "Chargers",
  "Power banks",
  "Phones accessories",
  "Laptop accessories",
  "Networking devices",
  "Phone repairs",
]

const products = [
  {
    id: 1,
    name: "Brand New iPhone 14 Pro max",
    price: "₦850,000",
    location: "Oredo, Edo State",
    image: "/placeholder.svg?height=200&width=200",
    bgColor: "bg-pink-200",
  },
  {
    id: 2,
    name: "HP X360 laptop",
    price: "₦420,000",
    location: "Ikeja, Lagos State",
    image: "/placeholder.svg?height=200&width=200",
    bgColor: "bg-gray-600",
  },
  {
    id: 3,
    name: "Brand New iPhone 14 Pro max",
    price: "₦850,000",
    location: "Oredo, Edo State",
    image: "/placeholder.svg?height=200&width=200",
    bgColor: "bg-purple-200",
  },
  {
    id: 4,
    name: "Brand New iPhone 14 Pro max",
    price: "₦850,000",
    location: "Ikeja, Lagos State",
    image: "/placeholder.svg?height=200&width=200",
    bgColor: "bg-gray-800",
  },
  {
    id: 5,
    name: "HP X360 laptop",
    price: "₦420,000",
    location: "Oredo, Edo State",
    image: "/placeholder.svg?height=200&width=200",
    bgColor: "bg-cyan-200",
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner */}
      <div className="bg-red-800 text-white text-center py-2 px-4 text-sm">
        Best Online store to connect vendors to vendors and vendors to customers
      </div>

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
                    <h3 className="font-semibold text-lg mb-4">All Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <span className="text-sm">{category}</span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      ))}
                      <div className="py-2 px-3 text-sm text-blue-600 cursor-pointer">See More</div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="text-orange-500 font-bold text-xl">Butlaxispro</span>
              </div>
            </div>

            {/* Search Bar - Desktop */}
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

            {/* State/LGA Selectors - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Select>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="edo">Edo</SelectItem>
                  <SelectItem value="lagos">Lagos</SelectItem>
                  <SelectItem value="abuja">Abuja</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="LGA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oredo">Oredo</SelectItem>
                  <SelectItem value="ikeja">Ikeja</SelectItem>
                  <SelectItem value="garki">Garki</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Login/Register Button */}
            <Button className="bg-red-600 hover:bg-red-700 text-white px-6">LOGIN / REGISTER</Button>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 rounded-full"
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden md:block w-64 bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-lg mb-4">All Categories</h3>
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <span className="text-sm">{category}</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              ))}
              <div className="py-2 px-3 text-sm text-blue-600 cursor-pointer">See More</div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-800 rounded-lg p-8 mb-8 relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-white text-3xl md:text-4xl font-bold mb-4">New iPhone 14 Pro Max</h1>
                <p className="text-white/90 text-sm md:text-base mb-6 max-w-2xl">
                  Apple's top-tier phone with a 6.7" OLED display, A16 Bionic chip, and Dynamic Island. It features a
                  48MP main camera, ProRAW/ProRes support, and cinematic 4K video. Built with stainless steel and
                  Ceramic Shield, it's IP68 rated and includes Crash Detection and SOS via satellite. Comes in Purple,
                  Deep Purple, Gold, Silver, and Space Black.
                </p>
                <Button className="bg-white text-black hover:bg-gray-100">View More</Button>
              </div>

              {/* Phone Image */}
              <div className="absolute right-4 top-4 bottom-4 w-48 md:w-64">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl transform rotate-12 opacity-20"></div>
                  <div className="absolute inset-2 bg-black rounded-3xl flex items-center justify-center">
                    <div className="w-32 h-48 md:w-40 md:h-60 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl"></div>
                  </div>
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-8 flex space-x-2">
                {[0, 1, 2, 3, 4].map((index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-white" : "bg-white/50"}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold md:hidden">Products</h2>
                <h2 className="text-xl font-semibold hidden md:block">Hot Sales</h2>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={`${product.bgColor} h-48 relative`}>
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">{product.price}</span>
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">Ad</span>
                      </div>
                      <p className="text-gray-500 text-xs">{product.location}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load more products for mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-6">
                {products.slice(0, 2).map((product, index) => (
                  <Card key={`second-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={`${product.bgColor} h-48 relative`}>
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">{product.price}</span>
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">Ad</span>
                      </div>
                      <p className="text-gray-500 text-xs">{product.location}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

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

          <div className="border-t border-red-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <a href="#" className="text-white hover:text-gray-300">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-900 font-bold">f</span>
                </div>
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-900 font-bold">in</span>
                </div>
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-900 font-bold">@</span>
                </div>
              </a>
            </div>
            <p className="text-sm text-gray-300">© 2025 Sitepro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
