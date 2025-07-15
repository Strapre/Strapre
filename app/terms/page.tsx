"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsAndConditionsPage() {
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

        {/* Terms and Conditions */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Strapre Terms and Conditions</h1>
            <p className="text-gray-600">Electronics Marketplace</p>
            <p className="text-gray-600">Effective Date: July 13, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By using Strapre, you agree to be legally bound by these Terms and our Privacy Policy. If you do not accept these terms, you may not access or use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">2. Platform Scope</h2>
              <p className="text-gray-700 leading-relaxed">
                Strapre is a digital platform that facilitates listings, browsing, and communication between users interested in buying and selling electronics and gadgets only.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We do not support or allow listings related to land, cars, properties, or unrelated items.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">3. User Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed">You agree to:</p>
              <ul className="list-disc list-inside text-gray-700">
                <li>Post truthful and accurate listings for electronic items only</li>
                <li>Avoid uploading counterfeit, stolen, or dangerous items</li>
                <li>Keep your account information secure and up-to-date</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                As Strapre wouldn't be liable or responsible for any damages caused during the process of transaction, these safety tips have been provided. It's also presented as a disclaimer on every merchant's profile.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">4. Prohibited Items</h2>
              <p className="text-gray-700 leading-relaxed">You are not permitted to list:</p>
              <ul className="list-disc list-inside text-gray-700">
                <li>Counterfeit or cloned electronics</li>
                <li>Items without proof of ownership</li>
                <li>Any non-electronic products (e.g., land, cars, real estate, livestock, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">5. Listings and Content</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li>Listings must include a clear description, product condition, price, and actual product images.</li>
                <li>Strapre may remove or moderate content that violates policies.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Strapre will not be liable for any misleading listings, swapped items, or defective products exchanged during online & offline meetings. The buyer assumes full responsibility and is encouraged to follow our safety tips.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">6. Transactions & Payments</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li>Strapre is not involved in payment processing. We do not hold funds or guarantee buyer/seller agreements.</li>
                <li>We recommend cash-on-delivery and meeting in public places.</li>
                <li>Never make prepayments or disclose financial information.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Strapre disclaims liability for financial losses during transactions. We've provided safety guidance and disclaimers visible on every merchant's profile.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">7. Account Suspension</h2>
              <p className="text-gray-700 leading-relaxed">Strapre reserves the right to suspend or terminate accounts that:</p>
              <ul className="list-disc list-inside text-gray-700">
                <li>Post fraudulent or misleading listings</li>
                <li>Repeatedly receive complaints or negative reviews</li>
                <li>Attempt to bypass platform restrictions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">8. Disclaimers & Limitation of Liability</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li>Strapre does not guarantee product quality, delivery success, or item authenticity.</li>
                <li>All users act independently and at their own risk.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Strapre is not liable for damages or losses caused during buying/selling. We've issued safety guidance on our platform and within each seller's profile to help you make secure decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">9. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All design, branding, code, and platform content belongs to Strapre. You may not reuse, scrape, or reproduce it without our consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">10. Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your data is handled under our Privacy Policy (<a href="https://strapre.vercel.app/privacy" className="text-blue-600 underline">https://strapre.vercel.app/privacy</a>). By using the platform, you agree to our data practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">11. Modifications</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms at any time. Users will be notified via platform announcements or email.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">12. Contact</h2>
              <p className="text-gray-700">
                Support Email: <a href="mailto:support@strapre.africa" className="text-blue-600 underline">support@strapre.africa</a>
              </p>
              <p className="text-gray-700">
                Complaints & Feedback: <a href="mailto:dpo@strapre.africa" className="text-blue-600 underline">dpo@strapre.africa</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Disclaimer Note (Merchant Profile Footer)</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-700 font-medium">
                  <strong>Disclaimer:</strong> Strapre is not responsible for any losses or damage arising from a transaction on this platform. Users are advised to follow all safety tips provided. You transact at your own risk.
                </p>
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