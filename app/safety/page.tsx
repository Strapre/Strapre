"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SafetyTipsPage() {
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

        {/* Safety Tips Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Best Deals Are Safe Deals</h1>
            <p className="text-gray-600">Your safety is our priority at Strapre</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-gray-700 leading-relaxed">
              At Strapre, your safety is our priority. While we cannot monitor every interaction between buyers and sellers, we are committed to helping you avoid scams and ensure every deal is a secure one. Here are some essential safety tips to keep in mind during your transactions.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">1. Check Feedback & Ratings</h2>
              <p className="text-gray-700 leading-relaxed">
                Before dealing with any seller or service provider, check the "Feedback" section on their profile. Buyers often leave reviews about their experiences — this can give you insight into the seller’s reliability. Your review could also help someone else in the community.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">2. Avoid Prepayments</h2>
              <p className="text-gray-700 leading-relaxed">
                Always opt for <strong>“Pay on Delivery”</strong> where possible. Meet the seller in person, preferably in a public place, inspect the item, and only pay after confirming it meets your expectations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">3. Confirm the Exact Item Before Payment</h2>
              <p className="text-gray-700 leading-relaxed">
                Make sure the packed item is the exact one you inspected. Scammers may try to swap inspected goods with inferior ones — only pay when you have the exact product in your possession.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">4. Never Share Sensitive Financial Info</h2>
              <p className="text-gray-700 leading-relaxed">
                Avoid requests to share your PINs, passwords, or bank login details. Beware of fake payment links or demands for “processing” fees via money transfer services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">5. Use Common Sense</h2>
              <p className="text-gray-700 leading-relaxed">Be cautious of:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Unrealistically low prices</li>
                <li>Promises of guaranteed jobs, profits, or giveaways</li>
              </ul>
              <p className="text-gray-700 leading-relaxed italic">
                If it feels too good to be true — it probably is.
              </p>
            </section>

            <section className="bg-red-50 border border-red-200 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-red-700">Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                Strapre will not be liable or responsible for any damages or losses that occur during a transaction. All users transact at their own risk. These safety tips are provided to guide you, and a disclaimer is clearly displayed on every merchant’s profile to help you stay informed.
              </p>
            </section>

            <section>
              <p className="text-gray-600 text-sm mt-8 pt-4 border-t border-gray-200 text-center">
                © {new Date().getFullYear()} Strapre Marketplace Services. Stay alert, stay safe, and enjoy your deals.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
