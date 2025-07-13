"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, Clock, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"
import Footer from '@/components/footer'
import { useRouter } from "next/navigation"

interface ProductImage {
  id: string
  url: string
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
  created_at: string
  is_featured: number
}

interface FeaturedPlan {
  id: string
  name: string
  price: string
  description: string
  duration_days: number
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

interface PaymentResponse {
  authorization_url: string
  reference: string
}

export default function FeatureProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [featuredPlans, setFeaturedPlans] = useState<FeaturedPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [plansLoading, setPlansLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchProducts(1)
    fetchFeaturedPlans()
  }, [])

  const fetchProducts = async (page: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`https://ga.vplaza.com.ng/api/v1/my-products?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data: ApiResponse<Product> = await response.json()
        setProducts(data.data)
        setCurrentPage(data.meta?.current_page || 1)
        setTotalPages(data.meta?.last_page || 1)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedPlans = async () => {
    setPlansLoading(true)
    try {
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/featured-plans")

      if (response.ok) {
        const data: ApiResponse<FeaturedPlan> = await response.json()
        setFeaturedPlans(data.data)
      }
    } catch (error) {
      console.error("Error fetching featured plans:", error)
    } finally {
      setPlansLoading(false)
    }
  }

  const handleFeatureProduct = (product: Product) => {
    setSelectedProduct(product)
    setSelectedPlan("")
    setShowPlanDialog(true)
  }

  const handleProceedToPayment = async () => {
    if (!selectedProduct || !selectedPlan) return

    setProcessing(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/payments/feature-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          plan_id: selectedPlan,
        }),
      })

      if (response.ok) {
        const data: PaymentResponse = await response.json()
        // Redirect to payment URL with reference as query parameter
        window.location.href = `${data.authorization_url}?reference=${data.reference}`
      }
    } catch (error) {
      console.error("Error processing payment:", error)
    } finally {
      setProcessing(false)
    }
  }

  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price)
    return `₦${numPrice.toLocaleString()}`
  }

  const handleSearch = () => {
    // Filter products based on search query
    console.log("Searching for:", searchQuery)
  }

  const handleStateChange = () => {
    // Placeholder function
  }

  const handleLGAChange = () => {
    // Placeholder function
  }

  const filteredProducts = products.filter((product) =>
    searchQuery === "" ? true : product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const availableProducts = filteredProducts.filter((product) => product.is_featured !== 1)

  if (loading && currentPage === 1) {
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
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB0207] border-t-transparent"></div>
        </div>
      </div>
    )
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
      <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Link href="/my-store" className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Store
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <Star className="h-8 w-8 text-[#CB0207] mr-3" />
                Feature Your Products
              </h1>
              <p className="text-gray-600">
                Boost your product visibility and increase sales by featuring your products
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {availableProducts.length === 0 && !loading ? (
            <div className="text-center py-16">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {filteredProducts.length === 0 ? "No products found" : "No products available to feature"}
              </h3>
              <p className="text-gray-600 mb-6">
                {filteredProducts.length === 0
                  ? "You don't have any products yet. Create some products first."
                  : "All your products are already featured or try searching with different keywords."}
              </p>
              {filteredProducts.length === 0 && (
                <Link href="/my-store/products/create">
                  <Button className="bg-[#CB0207] hover:bg-[#A50206] text-white px-6 py-3 rounded-xl">
                    Create Product
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {availableProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                      {product.images.length > 0 ? (
                        <Image
                          src={product.images[0].url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=200&width=200"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                      {product.is_featured === 1 && (
                        <Badge className="absolute top-2 right-2 bg-[#CB0207] text-white">Featured</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-800">{product.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-lg text-[#CB0207]">{formatPrice(product.price)}</span>
                      </div>
                      <Button
                        onClick={() => handleFeatureProduct(product)}
                        className="w-full bg-[#CB0207] hover:bg-[#A50206] text-white py-2 rounded-xl font-semibold transition-all duration-200"
                        disabled={product.is_featured === 1}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Feature Product
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => fetchProducts(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="rounded-xl"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => fetchProducts(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="rounded-xl"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Plan Selection Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Star className="h-5 w-5 text-[#CB0207] mr-2" />
              Choose Featured Plan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProduct && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-1">Selected Product:</h4>
                <p className="text-sm text-gray-600">{selectedProduct.name}</p>
                <p className="text-sm font-bold text-[#CB0207]">{formatPrice(selectedProduct.price)}</p>
              </div>
            )}

            {plansLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#CB0207] border-t-transparent"></div>
              </div>
            ) : (
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                <div className="space-y-3">
                  {featuredPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <RadioGroupItem value={plan.id} id={plan.id} />
                      <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-800">{plan.name}</h4>
                            <p className="text-sm text-gray-600 mb-1">{plan.description}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {plan.duration_days} days
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#CB0207]">{formatPrice(plan.price)}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setShowPlanDialog(false)}
                variant="outline"
                className="flex-1 rounded-xl"
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceedToPayment}
                className="flex-1 bg-[#CB0207] hover:bg-[#A50206] text-white rounded-xl"
                disabled={!selectedPlan || processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Footer />
    </div>
  )
}
