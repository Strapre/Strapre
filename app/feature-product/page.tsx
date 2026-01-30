"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, Clock, Check, Loader2, Crown, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  max_products?: number
  refresh_interval?: number
}

interface SubscriptionPlan {
  id: string
  name: string
  price: string
  description: string
  duration_days: number
  max_products: number
  refresh_interval: number
}

interface UserSubscription {
  id: string
  starts_at: string
  ends_at: string
  is_active: boolean
  plan: SubscriptionPlan
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
  const [featuredPlans, setFeaturedPlans] = useState<FeaturedPlan[]>([])
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchFeaturedPlans()
    fetchUserSubscriptions()
  }, [])

  const fetchFeaturedPlans = async () => {
    setPlansLoading(true)
    try {
      const response = await fetch("https://api.strapre.com/api/v1/featured-plans")

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

  const fetchUserSubscriptions = async () => {
    setSubscriptionsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("https://api.strapre.com/api/v1/featured-subscriptions/my-subscriptions", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data: ApiResponse<UserSubscription> = await response.json()
        setUserSubscriptions(data.data)
      }
    } catch (error) {
      console.error("Error fetching user subscriptions:", error)
    } finally {
      setSubscriptionsLoading(false)
    }
  }

  const getActiveSubscription = (): UserSubscription | null => {
    const activeSubscription = userSubscriptions.find(sub => sub.is_active)
    return activeSubscription || null
  }

  const canFeatureProducts = (): boolean => {
    const activeSubscription = getActiveSubscription()
    if (!activeSubscription) return false

    const currentTime = new Date()
    const endTime = new Date(activeSubscription.ends_at)
    return currentTime < endTime
  }

  const getRemainingFeaturedSlots = (): number => {
    const activeSubscription = getActiveSubscription()
    if (!activeSubscription) return 0

    // Since we don't have products data anymore, return the full max_products
    // This will need to be updated when you have the actual featured products count
    return activeSubscription.plan.max_products
  }

  const handleFeatureProduct = (product: Product) => {
    if (!canFeatureProducts()) {
      return // This should be handled by the UI state
    }

    if (getRemainingFeaturedSlots() <= 0) {
      return // This should be handled by the UI state
    }

    setSelectedProduct(product)
    setSelectedPlan("")
    setShowPlanDialog(true)
  }

  const handleProceedToPayment = async () => {
    if (!selectedProduct || !selectedPlan) return

    setProcessing(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("https://api.strapre.com/api/v1/payments/feature-product", {
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

  const handleSubscriptionPayment = async () => {
    if (!selectedPlan) return

    setProcessing(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("https://api.strapre.com/api/v1/payments/feature-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: selectedPlan,
        }),
      })

      if (response.ok) {
        const data: PaymentResponse = await response.json()
        // Redirect to payment URL with reference as query parameter
        window.location.href = `${data.authorization_url}?reference=${data.reference}`
      }
    } catch (error) {
      console.error("Error processing subscription payment:", error)
    } finally {
      setProcessing(false)
    }
  }

  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price)
    return `₦${numPrice.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleSearch = () => {
    // Search functionality if needed
    console.log("Searching for:", searchQuery)
  }

  const handleStateChange = () => {
    // Placeholder function
  }

  const handleLGAChange = () => {
    // Placeholder function
  }

  if (subscriptionsLoading) {
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

  const activeSubscription = getActiveSubscription()
  const canFeature = canFeatureProducts()
  const remainingSlots = getRemainingFeaturedSlots()

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

        {/* Subscription Status */}
        {!subscriptionsLoading && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Crown className="h-7 w-7 text-yellow-500 mr-3" />
                My Subscriptions
              </h2>
              <div className="flex items-center gap-4">
                {userSubscriptions.length > 0 && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {userSubscriptions.filter(sub => sub.is_active).length} Active
                  </Badge>
                )}
                <Button
                  onClick={() => {
                    setSelectedPlan("")
                    setShowSubscriptionDialog(true)
                  }}
                  className="bg-[#CB0207] hover:bg-[#A50206] text-white px-6 py-3 rounded-xl text-sm font-semibold"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Add New Plan
                </Button>
              </div>
            </div>

            {userSubscriptions.length > 0 ? (
              <div className="space-y-6">
                {userSubscriptions.map((subscription) => {
                  const isExpired = new Date(subscription.ends_at) < new Date()
                  const isActive = subscription.is_active && !isExpired
                  // Since we don't have products data, we'll show the max_products as available slots
                  const remainingSlotsForSub = isActive ? subscription.plan.max_products : 0
                  
                  return (
                    <div
                      key={subscription.id}
                      className={`border-2 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg ${
                        isActive 
                          ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-25' 
                          : 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-25'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-800">
                              {subscription.plan.name}
                            </h3>
                            <Badge 
                              className={`w-fit text-sm px-3 py-1 font-medium ${
                                isActive 
                                  ? 'bg-green-100 text-green-800 border-green-300' 
                                  : 'bg-gray-100 text-gray-600 border-gray-300'
                              }`}
                            >
                              {isActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 text-base leading-relaxed">
                            {subscription.plan.description}
                          </p>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                              <span className="text-sm text-gray-500 font-medium">Price</span>
                              <div className="text-lg font-bold text-[#CB0207] mt-1">
                                {formatPrice(subscription.plan.price)}
                              </div>
                            </div>
                            <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                              <span className="text-sm text-gray-500 font-medium">Duration</span>
                              <div className="text-lg font-semibold text-gray-800 mt-1">
                                {subscription.plan.duration_days} days
                              </div>
                            </div>
                            <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                              <span className="text-sm text-gray-500 font-medium">Max Products</span>
                              <div className="text-lg font-semibold text-gray-800 mt-1">
                                {subscription.plan.max_products}
                              </div>
                            </div>
                            <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                              <span className="text-sm text-gray-500 font-medium">Refresh Rate</span>
                              <div className="text-lg font-semibold text-gray-800 mt-1">
                                {subscription.plan.refresh_interval}h
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          <div className="bg-white/80 rounded-xl p-4 border border-gray-200 min-w-[200px]">
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Started:</span>
                                <span className="font-semibold text-gray-700">{formatDate(subscription.starts_at)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Expires:</span>
                                <span className={`font-semibold ${
                                  isExpired ? 'text-red-600' : isActive ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                  {formatDate(subscription.ends_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {isActive && (
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              <div className="text-center bg-white/80 rounded-xl p-4 border border-green-200 min-w-[120px]">
                                <div className="text-3xl font-bold text-green-600">
                                  {remainingSlotsForSub}
                                </div>
                                <div className="text-sm text-gray-500 font-medium">
                                  slots remaining
                                </div>
                              </div>
                              
                              <Link href={`/feature-product/${subscription.id}`}>
                                <Button 
                                  className="bg-[#CB0207] hover:bg-[#A50206] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
                                >
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 max-w-md mx-auto">
                  <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-amber-800 mb-3">No Subscriptions Yet</h3>
                  <p className="text-amber-700 mb-6 leading-relaxed">
                    Subscribe to a plan to feature your products and boost visibility.
                  </p>
                  <Link href="/subscriptions" className="text-amber-700 underline hover:text-amber-900 font-medium">
                    View Available Plans
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content Area - Only show when no active subscriptions */}
        {!activeSubscription && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-[#CB0207]/10 to-[#CB0207]/5 rounded-3xl p-12 max-w-2xl mx-auto">
                <Star className="h-20 w-20 text-[#CB0207] mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Feature Products Dashboard
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Manage your subscription plans to feature products and boost visibility.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setSelectedPlan("")
                      setShowSubscriptionDialog(true)
                    }}
                    className="bg-[#CB0207] hover:bg-[#A50206] text-white px-8 py-4 rounded-xl text-lg font-semibold"
                  >
                    <Star className="h-5 w-5 mr-2" />
                    Subscribe to a Plan
                  </Button>
                  <Link href="/subscriptions">
                    <Button variant="outline" className="px-8 py-4 rounded-xl text-lg border-2">
                      View All Plans
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
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

            {activeSubscription && (
              <Alert className="border-green-200 bg-green-50">
                <Crown className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  You're using your {activeSubscription.plan.name} subscription. 
                  Featuring products through your subscription is free within your plan limits.
                </AlertDescription>
              </Alert>
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

      {/* Subscription Plans Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Crown className="h-5 w-5 text-[#CB0207] mr-2" />
              Choose a Subscription Plan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a subscription plan to feature your products and boost visibility.
            </p>

            {plansLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#CB0207] border-t-transparent"></div>
              </div>
            ) : (
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {featuredPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <RadioGroupItem value={plan.id} id={`sub-${plan.id}`} />
                      <Label htmlFor={`sub-${plan.id}`} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-1">{plan.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {plan.duration_days} days
                              </div>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 mr-1" />
                                {plan.max_products} products
                              </div>
                              <div className="flex items-center">
                                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                                Refresh: {plan.refresh_interval}h
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-xl text-[#CB0207]">{formatPrice(plan.price)}</p>
                            <p className="text-xs text-gray-500">
                              {formatPrice((parseFloat(plan.price) / plan.duration_days).toFixed(2))}/day
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            <div className="flex space-x-3 pt-4 border-t">
              <Button
                onClick={() => setShowSubscriptionDialog(false)}
                variant="outline"
                className="flex-1 rounded-xl"
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubscriptionPayment}
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
                    Subscribe & Pay {selectedPlan && formatPrice(featuredPlans.find(p => p.id === selectedPlan)?.price || "0")}
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