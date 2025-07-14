"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CopyrightPage() {
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

        {/* Copyright Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Copyright Notice</h1>
            <p className="text-gray-600">Effective Date: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ownership of Content</h2>
              <p className="text-gray-700 leading-relaxed">
                All content displayed on this platform, including but not limited to logos, brand names, graphics,
                user interface elements, designs, images, text, videos, product descriptions, and underlying code
                are the intellectual property of Strapre or its licensors and are protected by applicable copyright,
                trademark, and intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Copyright Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                This website and its content are protected under the copyright laws of Nigeria and international
                treaties. Unauthorized reproduction, redistribution, modification, or commercial use of any content
                on this platform without prior written consent from Strapre is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Trademarks</h2>
              <p className="text-gray-700 leading-relaxed">
                Strapre™ and all related names, logos, product names, service names, designs, and slogans are
                trademarks of Strapre. You may not use these trademarks without the prior written consent of Strapre.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use of Platform Content</h2>
              <p className="text-gray-700 leading-relaxed">
                You may view and download materials from this site for personal, non-commercial use only, provided
                you do not remove or alter any copyright, trademark, or other proprietary notices. Any other
                use — including reproduction for purposes other than personal use, modification, distribution,
                or republication — without our written permission is strictly forbidden.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User-Generated Content</h2>
              <p className="text-gray-700 leading-relaxed">
                Users may submit content such as product listings, reviews, or feedback. By doing so, you grant
                Strapre a worldwide, royalty-free, non-exclusive license to use, distribute, reproduce, and
                display such content in connection with the operation and promotion of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Copyright Infringement</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Strapre respects intellectual property rights and expects users to do the same. If you believe
                that any content on our platform infringes upon your copyright, please contact us with the
                following details:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>A physical or electronic signature of the copyright owner or authorized agent</li>
                <li>A description of the copyrighted work that you believe has been infringed</li>
                <li>URL or description of where the infringing material is located on the site</li>
                <li>Your contact details (name, address, phone, and email)</li>
                <li>A statement that you believe in good faith that the disputed use is unauthorized</li>
                <li>A statement that the information provided is accurate under penalty of perjury</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> legal@strapre.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> +234 (0) 813 869 5216</p>
                <p className="text-gray-700"><strong>Address:</strong> Strapre Legal Department, Benin City, Nigeria</p>
              </div>
            </section>

            <section>
              <p className="text-gray-600 text-sm mt-8 pt-4 border-t border-gray-200 text-center">
                © {new Date().getFullYear()} Strapre. All rights reserved. Unauthorized use or duplication is a violation of applicable laws.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
