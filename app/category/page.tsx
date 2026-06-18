"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, LayoutGrid, Sparkles } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ENDPOINTS, apiFetch } from "@/lib/api"

interface Category {
  id: string
  name: string
  slug: string
}

interface ApiResponse<T> {
  data: T[]
}

export default function CategoriesListPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(ENDPOINTS.categories)
      if (response.ok) {
        const data: ApiResponse<Category> = await response.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  // Generate a random gradient color class for visual aesthetics
  const getGradientForIndex = (index: number) => {
    const gradients = [
      "from-rose-500 to-orange-500",
      "from-amber-500 to-yellow-500",
      "from-emerald-500 to-teal-500",
      "from-cyan-500 to-blue-500",
      "from-indigo-500 to-purple-500",
      "from-violet-500 to-fuchsia-500",
      "from-pink-500 to-rose-500",
      "from-sky-500 to-indigo-500",
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-between">
      <div>
        {/* Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showStateSelectors={false}
        />

        {/* Main Content */}
        <main className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LayoutGrid className="h-6 w-6 text-[#CB0207]" />
                <span className="text-[#CB0207] font-semibold text-sm tracking-wider uppercase">Marketplace</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                All Categories
              </h1>
              <p className="text-gray-500 mt-2 text-sm md:text-base">
                Explore a wide range of products across different categories from our trusted vendors.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start md:self-center bg-red-50 text-[#CB0207] px-4 py-2 rounded-xl text-xs font-semibold">
              <Sparkles className="h-4 w-4" />
              {categories.length} Categories Available
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB0207] border-t-transparent"></div>
            </div>
          )}

          {/* Categories Grid */}
          {!loading && categories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="group block relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Colorful indicator circle */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradientForIndex(index)} flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        {category.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-base group-hover:text-[#CB0207] transition-colors duration-200 truncate pr-2">
                          {category.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">
                          View Products
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-red-50 flex items-center justify-center transition-colors duration-300">
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#CB0207] transition-colors duration-300" />
                    </div>
                  </div>
                  {/* Subtle color highlight at bottom on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#CB0207] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && categories.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-lg">
              <p className="text-gray-500 text-lg">No categories found.</p>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
