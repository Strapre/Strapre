"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, ExternalLink, Plus, Star, TrendingUp, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from '@/components/footer'

interface Banner {
  id: string
  store_id: string
  state_id: string
  starts_at: string
  ends_at: string
  image: string
  link: string
  title: string
  is_dummy: number
}

interface BannersResponse {
  data: Banner[]
}

interface Category {
  id: string
  name: string
  slug: string
}

interface State {
  id: string
  name: string
  slug: string
}

interface LGA {
  id: string
  name: string
  slug: string
  state_id: string
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

interface ApiResponse<T = any> {
  data: T
}

export default function BannerRequestPage() {
  const router = useRouter()
  const [myBanners, setMyBanners] = useState<Banner[]>([])
  const [allBanners, setAllBanners] = useState<Banner[]>([])
  const [states, setStates] = useState<State[]>([])
  const [lgas, setLgas] = useState<LGA[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStore, setUserStore] = useState<UserStore | null>(null)
  const [loading, setLoading] = useState(true)
  const [nextAvailableDate, setNextAvailableDate] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMerchant, setIsMerchant] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [selectedLGA, setSelectedLGA] = useState<LGA | null>(null)

  useEffect(() => {
    // Check authentication
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    const userStoreData = typeof window !== "undefined" ? localStorage.getItem("userStore") : null

    setIsAuthenticated(!!token)
    setIsMerchant(!!userStoreData)

    // Fetch initial data
    fetchCategories()
    fetchStates()

    // Fetch user data if authenticated
    if (token) {
      fetchUserProfile(token)
      fetchUserStore(token)
    }

    fetchBannerData()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://api.strapre.com/api/v1/categories")
      if (response.ok) {
        const data: ApiResponse<Category[]> = await response.json()
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchUserStore = async (token: string) => {
    try {
      const response = await fetch("https://api.strapre.com/api/v1/mystore", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUserStore(data)
        setIsMerchant(true)

        // Store in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("userStore", JSON.stringify(data))
        }
      }
    } catch (error) {
      console.error("Error fetching user store:", error)
    }
  }

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("https://api.strapre.com/api/v1/auth/get-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setUserProfile(data.data)

        // Store in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("userDetails", JSON.stringify(data.data))
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchStates = async () => {
    try {
      const response = await fetch("https://api.strapre.com/api/v1/states")
      if (response.ok) {
        const data: ApiResponse<State[]> = await response.json()
        // Sort states alphabetically by name
        const sortedStates = data.data.sort((a, b) => a.name.localeCompare(b.name))
        setStates(sortedStates)
      }
    } catch (error) {
      console.error("Error fetching states:", error)
    }
  }

  const fetchLGAs = async (stateSlug: string) => {
    try {
      const response = await fetch(`https://api.strapre.com/api/v1/states/${stateSlug}/lgas`)
      if (response.ok) {
        const data: ApiResponse<LGA[]> = await response.json()
        // Sort LGAs alphabetically by name
        const sortedLGAs = data.data.sort((a, b) => a.name.localeCompare(b.name))
        setLgas(sortedLGAs)
      }
    } catch (error) {
      console.error("Error fetching LGAs:", error)
    }
  }

  const fetchBannerData = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const [myBannersResponse, allBannersResponse] = await Promise.all([
        fetch("https://api.strapre.com/api/v1/my-adverts", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://api.strapre.com/api/v1/adverts", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (myBannersResponse.ok && allBannersResponse.ok) {
        const myBannersData: BannersResponse = await myBannersResponse.json()
        const allBannersData: BannersResponse = await allBannersResponse.json()

        setMyBanners(myBannersData.data)
        setAllBanners(allBannersData.data)

        // Calculate next available date
        if (allBannersData.data.length > 0) {
          const latestEndDate = allBannersData.data.reduce((latest, banner) => {
            const bannerEndDate = new Date(banner.ends_at)
            return bannerEndDate > latest ? bannerEndDate : latest
          }, new Date(allBannersData.data[0].ends_at))

          const nextAvailable = new Date(latestEndDate)
          nextAvailable.setDate(nextAvailable.getDate() + 1)
          setNextAvailableDate(nextAvailable.toLocaleDateString())
        } else {
          setNextAvailableDate("Available now")
        }
      }
    } catch (error) {
      console.error("Error fetching banners:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStateChange = (stateId: string) => {
    if (stateId === "defaultState") {
      setSelectedState(null)
      setSelectedLGA(null)
      setLgas([])
      return
    }
    const state = states.find((s) => s.id === stateId)
    if (state) {
      setSelectedState(state)
      setSelectedLGA(null)
      fetchLGAs(state.slug)
    }
  }

  const handleLGAChange = (lgaId: string) => {
    if (lgaId === "defaultLGA") {
      setSelectedLGA(null)
      return
    }
    const lga = lgas.find((l) => l.id === lgaId)
    setSelectedLGA(lga || null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        showStateSelectors={true}
        selectedState={selectedState}
        selectedLGA={selectedLGA}
        onStateChange={handleStateChange}
        onLGAChange={handleLGAChange}
      />

      {/* Main Content */}
      <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Link href="/my-store" className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Store
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-[#CB0207]/10 text-[#CB0207] rounded-full text-sm font-medium mb-4">
            <Star className="h-4 w-4 mr-2" />
            Premium Advertisement
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Banner <span className="text-[#CB0207]">Advertisement</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Boost your store's visibility with premium banner placements. Track your campaigns and discover new
            opportunities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Banners</p>
                <p className="text-2xl font-bold text-gray-900">{myBanners.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Slots</p>
                <p className="text-2xl font-bold text-gray-900">{allBanners.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Next Available</p>
                <p className="text-lg font-bold text-gray-900">{nextAvailableDate}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Next Available Slot */}
        {!loading && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-[#CB0207] to-[#A50206] rounded-3xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Ready to Launch Your Next Campaign?</h3>
                  <p className="text-red-100 mb-4">
                    Next available banner slot: <span className="font-semibold">{nextAvailableDate}</span>
                  </p>
                  <button
                    onClick={() => router.push("/banner-request/new")}
                    className="bg-white text-[#CB0207] px-6 py-3 rounded-full font-semibold hover:bg-red-50 transition-colors flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Banner
                  </button>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <Calendar className="h-12 w-12 text-white mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Banners */}
        {!loading && myBanners.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">My Active Banners</h2>
              <button className="text-[#CB0207] hover:text-[#A50206] font-medium flex items-center">
                View All
                <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myBanners.map((banner) => {
                const daysRemaining = getDaysRemaining(banner.ends_at)
                return (
                  <div
                    key={banner.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="aspect-[16/9] relative overflow-hidden">
                      <Image
                        src={banner.image || "/placeholder.svg"}
                        alt={banner.title || "Banner"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
                          {banner.title || "Untitled Banner"}
                        </h3>
                        {banner.link && (
                          <a
                            href={banner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 hover:text-white text-sm flex items-center"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Link
                          </a>
                        )}
                      </div>
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            daysRemaining > 7
                              ? "bg-green-100 text-green-700"
                              : daysRemaining > 0
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {daysRemaining > 0 ? `${daysRemaining} days left` : "Expired"}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Started: {formatDate(banner.starts_at)}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <span>Ends: {formatDate(banner.ends_at)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && myBanners.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl p-12 max-w-md mx-auto shadow-sm border border-gray-100">
              <div className="bg-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Plus className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Banners Yet</h3>
              <p className="text-gray-600 mb-6">Start promoting your store with eye-catching banner advertisements.</p>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors">
                Create Your First Banner
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
