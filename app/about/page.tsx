<<<<<<< HEAD
"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AboutPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-24 h-auto overflow-hidden flex items-center justify-center bg-white">
              <img
                src="/straprelogo.png"
                alt="Strapre Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        {/* About Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">About Strapre</h1>
            <p className="text-lg text-gray-600">Your Trusted Electronics Marketplace</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <p className="text-gray-700 leading-relaxed">
                Strapre is a next-generation online marketplace built exclusively for electronics and gadgets. Whether you're buying your first smartphone, upgrading your laptop, or selling a gently used console — Strapre provides a safe, fast, and focused environment to connect with real people who care about quality and value.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Why Strapre?</h2>
              <p className="text-gray-700 leading-relaxed">
                In a world of scattered classified ads and unreliable listings, we saw the need for a dedicated platform just for electronics lovers. That's why we built Strapre — a space where buyers and sellers can interact confidently, trade securely, and find exactly what they're looking for without wading through irrelevant categories like cars, land, or property.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">What We Offer</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Verified Listings</h3>
                  <p className="text-gray-700">
                    Every product listed on Strapre goes through a basic authenticity check and community feedback system to reduce scams and fake items.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Chat & Notifications</h3>
                  <p className="text-gray-700">
                    Talk to sellers directly, ask questions, and negotiate prices — all within the platform.
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Niche Marketplace</h3>
                  <p className="text-gray-700">
                    We're not everything to everyone — we specialize in electronics. Phones, tablets, laptops, consoles, smartwatches, accessories — that's our lane.
                  </p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Mobile-Friendly Experience</h3>
                  <p className="text-gray-700">
                    Designed to work seamlessly on all devices — search, post, and chat easily whether you're on desktop or mobile.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed font-medium">
                  To simplify how people buy and sell gadgets online in Nigeria — with transparency, speed, and trust.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                We believe that with the right tools and a focused approach, everyone can find value — whether you're a tech reseller, a student looking for a budget laptop, or just someone replacing an old phone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Your Safety Matters</h2>
              <p className="text-gray-700 leading-relaxed">
                We've created detailed Safety Tips to help you make smarter transactions. Strapre also provides profile-level disclaimers, seller feedback, and secure messaging — all designed to reduce risk and build confidence in every deal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Built in Africa, for Africans</h2>
              <p className="text-gray-700 leading-relaxed">
                Strapre is proudly built in Nigeria, with a deep understanding of the local tech market, the challenges of classifieds, and the need for secure, reliable platforms. We're not trying to be global — we're trying to be useful.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Join the Movement</h2>
              <p className="text-gray-700 leading-relaxed">
                We're growing fast, and it's thanks to users like you who believe that buying and selling electronics online doesn't have to be chaotic.
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-gray-700">• Start exploring listings</p>
                <p className="text-gray-700">• Post your own product</p>
                <p className="text-gray-700">• Connect. Trade. Upgrade.</p>
              </div>
            </section>

            <section>
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Welcome to Strapre</h3>
                <p className="text-lg">Where gadgets meet good deals</p>
              </div>
            </section>

            <section>
              <p className="text-gray-600 text-sm mt-8 pt-4 border-t border-gray-200 text-center">
                © {new Date().getFullYear()} Strapre Marketplace Services. All rights reserved.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
=======
"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AboutPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-24 h-auto overflow-hidden flex items-center justify-center bg-white">
              <img
                src="/straprelogo.png"
                alt="Strapre Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        {/* About Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">About Strapre</h1>
            <p className="text-lg text-gray-600">Your Trusted Electronics Marketplace</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <p className="text-gray-700 leading-relaxed">
                Strapre is a next-generation online marketplace built exclusively for electronics and gadgets. Whether you're buying your first smartphone, upgrading your laptop, or selling a gently used console — Strapre provides a safe, fast, and focused environment to connect with real people who care about quality and value.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Why Strapre?</h2>
              <p className="text-gray-700 leading-relaxed">
                In a world of scattered classified ads and unreliable listings, we saw the need for a dedicated platform just for electronics lovers. That's why we built Strapre — a space where buyers and sellers can interact confidently, trade securely, and find exactly what they're looking for without wading through irrelevant categories like cars, land, or property.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">What We Offer</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Verified Listings</h3>
                  <p className="text-gray-700">
                    Every product listed on Strapre goes through a basic authenticity check and community feedback system to reduce scams and fake items.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Chat & Notifications</h3>
                  <p className="text-gray-700">
                    Talk to sellers directly, ask questions, and negotiate prices — all within the platform.
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Niche Marketplace</h3>
                  <p className="text-gray-700">
                    We're not everything to everyone — we specialize in electronics. Phones, tablets, laptops, consoles, smartwatches, accessories — that's our lane.
                  </p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Mobile-Friendly Experience</h3>
                  <p className="text-gray-700">
                    Designed to work seamlessly on all devices — search, post, and chat easily whether you're on desktop or mobile.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed font-medium">
                  To simplify how people buy and sell gadgets online in Nigeria — with transparency, speed, and trust.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                We believe that with the right tools and a focused approach, everyone can find value — whether you're a tech reseller, a student looking for a budget laptop, or just someone replacing an old phone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Your Safety Matters</h2>
              <p className="text-gray-700 leading-relaxed">
                We've created detailed Safety Tips to help you make smarter transactions. Strapre also provides profile-level disclaimers, seller feedback, and secure messaging — all designed to reduce risk and build confidence in every deal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Built in Africa, for Africans</h2>
              <p className="text-gray-700 leading-relaxed">
                Strapre is proudly built in Nigeria, with a deep understanding of the local tech market, the challenges of classifieds, and the need for secure, reliable platforms. We're not trying to be global — we're trying to be useful.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Join the Movement</h2>
              <p className="text-gray-700 leading-relaxed">
                We're growing fast, and it's thanks to users like you who believe that buying and selling electronics online doesn't have to be chaotic.
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-gray-700">• Start exploring listings</p>
                <p className="text-gray-700">• Post your own product</p>
                <p className="text-gray-700">• Connect. Trade. Upgrade.</p>
              </div>
            </section>

            <section>
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Welcome to Strapre</h3>
                <p className="text-lg">Where gadgets meet good deals</p>
              </div>
            </section>

            <section>
              <p className="text-gray-600 text-sm mt-8 pt-4 border-t border-gray-200 text-center">
                © {new Date().getFullYear()} Strapre Marketplace Services. All rights reserved.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
>>>>>>> 533c22393c774a56ed1968293eb2ddaf3c4ec728
