"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AboutUsPage() {
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

        {/* About Us Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">About Us</h1>
            <p className="text-gray-600">Learn more about Strapre and what drives us forward</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                At Strapre, our mission is to redefine the tech e-commerce experience across Africa by building a
                trusted, accessible, and innovation-driven marketplace where anyone can buy or sell gadgets
                seamlessly. We aim to empower both tech enthusiasts and business owners through an ecosystem
                rooted in quality, transparency, and efficiency.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Who We Are</h2>
              <p className="text-gray-700 leading-relaxed">
                Strapre is a multi-vendor platform designed for buying and selling top-quality tech products
                — from smartphones to smartwatches, accessories to components. Whether you're a buyer
                seeking the best tech at competitive prices, or a vendor ready to showcase your inventory,
                Strapre provides the digital foundation to make that happen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-700 leading-relaxed">
                Born from the desire to simplify how people access reliable tech, Strapre began with a small
                group of passionate developers, marketers, and entrepreneurs. We recognized a massive
                gap in the local market for a safe, flexible, and professional e-commerce platform centered
                specifically on gadgets. From that vision, Strapre was born — and we’ve been scaling
                ever since.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Multi-vendor support for sellers of all sizes</li>
                <li>Secure payment and escrow systems</li>
                <li>Streamlined product listing tools</li>
                <li>Customer support tailored for tech buyers</li>
                <li>Verification systems to build trust between buyers and sellers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Integrity:</strong> We stand for fairness and transparency in every transaction.</li>
                <li><strong>Innovation:</strong> We evolve constantly to stay ahead of the curve.</li>
                <li><strong>Accessibility:</strong> We make it easy for anyone to buy or sell tech online.</li>
                <li><strong>Trust:</strong> Every interaction on Strapre is backed by systems that protect all parties involved.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Us</h2>
              <p className="text-gray-700 leading-relaxed">
                Whether you’re a startup with a bold idea, a solo vendor with quality inventory, or
                a curious customer ready to explore, we invite you to join us on this journey. Together,
                we’re building Africa’s most trusted tech marketplace — one device at a time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We'd love to hear from you. Whether it's feedback, support, or partnership opportunities —
                reach out.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> support@strapre.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> +234 (0) 813 869 5216</p>
                <p className="text-gray-700"><strong>Address:</strong> Strapre HQ, Benin City, Nigeria</p>
              </div>
            </section>

            <section>
              <p className="text-gray-600 text-sm mt-8 pt-4 border-t border-gray-200 text-center">
                Thank you for being part of our story. Strapre — powering the next wave of digital commerce in Africa.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
