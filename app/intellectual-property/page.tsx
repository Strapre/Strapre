<<<<<<< HEAD
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

        {/* Page Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Strapre Copyright and Intellectual Property Notice</h1>
            <p className="text-gray-600">Effective Date: July 13, 2025</p>
            <p className="text-sm text-gray-500">Website: <a href="https://strapre.com" className="underline text-blue-600">https://strapre.com</a></p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">1. Ownership of Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content, branding, source code, layouts, UI/UX designs, logos, platform features, structure, and digital assets displayed on Strapre are the exclusive intellectual property of Strapre Marketplace Services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Protected elements include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Website design and structure</li>
                <li>Mobile or desktop UI elements</li>
                <li>Feature flow (e.g., product upload, search, store dashboard)</li>
                <li>Custom icons, illustrations, and platform logic</li>
                <li>Content on merchant profiles, support documentation, and safety guidelines</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                These are protected by Nigerian copyright laws, trademark laws, and international IP treaties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">2. Copyright Infringement Prohibition</h2>
              <p className="text-gray-700 leading-relaxed">You may not:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Copy or clone the look, feel, or functionality of Strapre</li>
                <li>Reuse or redistribute our source code or UI components</li>
                <li>Launch a competing platform with similar branding or structure</li>
                <li>Repurpose Strapre’s content, legal documents, or marketplace concept</li>
                <li>Use bots or scrapers to extract data or designs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">3. Trademarks and Branding</h2>
              <p className="text-gray-700 leading-relaxed">
                “Strapre” and its logos and brand identity are trademarks of Strapre Marketplace Services. Use or imitation without written permission is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">4. Legal Enforcement</h2>
              <p className="text-gray-700 leading-relaxed">
                Violation of these terms may result in:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Legal action for damages</li>
                <li>Takedown notices via the Nigeria Copyright Commission (NCC)</li>
                <li>Platform bans or criminal prosecution</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We actively monitor for unauthorized reproductions and will take action as necessary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">5. Reporting Infringement</h2>
              <p className="text-gray-700 leading-relaxed">
                To report violations, contact:
              </p>
              <ul className="text-gray-700 space-y-1">
                <li><strong>Email:</strong> <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">6. Use of Platform Content</h2>
              <p className="text-gray-700 leading-relaxed">
                Strapre is to be used only for listing and purchasing electronics. Any other use is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">7. Acknowledgment</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing Strapre, you:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Agree not to reproduce or replicate the platform</li>
                <li>Acknowledge the consequences of infringement</li>
              </ul>
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

        {/* Page Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Strapre Copyright and Intellectual Property Notice</h1>
            <p className="text-gray-600">Effective Date: July 13, 2025</p>
            <p className="text-sm text-gray-500">Website: <a href="https://strapre.com" className="underline text-blue-600">https://strapre.com</a></p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">1. Ownership of Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content, branding, source code, layouts, UI/UX designs, logos, platform features, structure, and digital assets displayed on Strapre are the exclusive intellectual property of Strapre Marketplace Services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Protected elements include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Website design and structure</li>
                <li>Mobile or desktop UI elements</li>
                <li>Feature flow (e.g., product upload, search, store dashboard)</li>
                <li>Custom icons, illustrations, and platform logic</li>
                <li>Content on merchant profiles, support documentation, and safety guidelines</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                These are protected by Nigerian copyright laws, trademark laws, and international IP treaties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">2. Copyright Infringement Prohibition</h2>
              <p className="text-gray-700 leading-relaxed">You may not:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Copy or clone the look, feel, or functionality of Strapre</li>
                <li>Reuse or redistribute our source code or UI components</li>
                <li>Launch a competing platform with similar branding or structure</li>
                <li>Repurpose Strapre’s content, legal documents, or marketplace concept</li>
                <li>Use bots or scrapers to extract data or designs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">3. Trademarks and Branding</h2>
              <p className="text-gray-700 leading-relaxed">
                “Strapre” and its logos and brand identity are trademarks of Strapre Marketplace Services. Use or imitation without written permission is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">4. Legal Enforcement</h2>
              <p className="text-gray-700 leading-relaxed">
                Violation of these terms may result in:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Legal action for damages</li>
                <li>Takedown notices via the Nigeria Copyright Commission (NCC)</li>
                <li>Platform bans or criminal prosecution</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We actively monitor for unauthorized reproductions and will take action as necessary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">5. Reporting Infringement</h2>
              <p className="text-gray-700 leading-relaxed">
                To report violations, contact:
              </p>
              <ul className="text-gray-700 space-y-1">
                <li><strong>Email:</strong> <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">6. Use of Platform Content</h2>
              <p className="text-gray-700 leading-relaxed">
                Strapre is to be used only for listing and purchasing electronics. Any other use is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">7. Acknowledgment</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing Strapre, you:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Agree not to reproduce or replicate the platform</li>
                <li>Acknowledge the consequences of infringement</li>
              </ul>
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
