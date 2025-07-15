"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
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

        {/* Privacy Policy */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Strapre Privacy Policy</h1>
            <p className="text-gray-600">Effective Date: July 12, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                This Privacy Policy explains what personal data is collected when you use the Strapre platform (<a href="https://strapre.com" className="text-blue-600 underline">https://strapre.com</a>) and related services ("the Service"), how that data is used and shared.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>By using the Service, you confirm that:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700">
                <li>You have read, understood, and agreed to this Privacy Policy</li>
                <li>You are at least 16 years old or have parental/guardian consent</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                If you do not agree, please discontinue use and contact us at <a href="mailto:support@strapre.africa" className="text-blue-600 underline">support@strapre.africa</a> for data deletion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">1. Personal Data Controller</h2>
              <p className="text-gray-700">Strapre Marketplace Services, registered in Nigeria, is the controller of your personal data.</p>
              <p className="text-gray-700">Email: <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a></p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">2. Categories of Personal Data We Collect</h2>
              <p className="text-gray-700 font-medium">2.1 Information You Provide Directly</p>
              <ul className="list-disc list-inside text-gray-700">
                <li>Full name, email address, phone number, address</li>
                <li>Listings, photos, videos, documents (e.g., CAC, ID)</li>
                <li>Verification data (e.g., BVN for loans, CVs for jobs)</li>
                <li>Messages, chats, and reviews</li>
              </ul>
              <p className="text-gray-700 font-medium">2.2 Data from Third Parties</p>
              <ul className="list-disc list-inside text-gray-700">
                <li>Google, Apple, Facebook, Truecaller profile info</li>
                <li>Smile Identity verification: ID number, facial recognition, gender</li>
              </ul>
              <p className="text-gray-700 font-medium">2.3 Automatically Collected Data</p>
              <ul className="list-disc list-inside text-gray-700">
                <li>IP address, device model, OS, browser</li>
                <li>Location, referral links, ad identifiers</li>
                <li>Cookies and tracking pixels</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">3. Data Protection Principles</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li>Lawful and transparent use</li>
                <li>Accurate and minimal collection</li>
                <li>Secure storage and transfer</li>
                <li>Timely deletion upon request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">4. Purposes for Processing Your Data</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li>User authentication and registration</li>
                <li>Manage listings, chats, marketplace activities</li>
                <li>Payment processing</li>
                <li>Marketing updates and announcements</li>
                <li>Personalized ads and experience</li>
                <li>Security improvement and abuse prevention</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">5. Legal Grounds for Processing</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li>Consent: cookies, marketing</li>
                <li>Contractual necessity: payments, access</li>
                <li>Legitimate interest: analytics, fraud prevention</li>
                <li>Legal obligation: regulatory compliance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">6. Data Sharing and Disclosure</h2>
              <p className="text-gray-700">
                We share data only with trusted third-party providers (e.g., Vercel, Firebase, Paystack, Google, Smile Identity) and require them to meet strong data protection standards.
              </p>
              <p className="text-gray-700">
                However, Strapre is not liable for breaches caused by those outside our control. Affected users will be notified as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">7. Available Remedies</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li>Request account and data deletion</li>
                <li>File complaints with regulators</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">8. No Limitation Clause</h2>
              <p className="text-gray-700">
                We do not limit liability for breaches of this policy or Nigeria’s data laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">9. Your Rights</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li>Access or correct your data</li>
                <li>Delete your account</li>
                <li>Withdraw consent</li>
                <li>Opt out of marketing</li>
                <li>Object to automated processing</li>
                <li>File complaints with Nigeria Data Protection Commission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">10. Age Restrictions</h2>
              <p className="text-gray-700">
                We do not knowingly collect data from anyone under 16. If you suspect this, contact <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">11. International Transfers</h2>
              <p className="text-gray-700">
                Your data may be stored outside Nigeria with secure encryption and lawful safeguards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">12. Policy Updates</h2>
              <p className="text-gray-700">
                We reserve the right to update this policy as needed. Significant changes will be communicated, and continued use means acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">13. Data Retention</h2>
              <ul className="list-disc list-inside text-gray-700">
                <li>While your account is active</li>
                <li>For legal or audit purposes</li>
                <li>Temporarily after deletion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">14. Contact Us</h2>
              <p className="text-gray-700">
                Email: <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a>
              </p>
              <p className="text-gray-700">
                Data Protection Officer: <a href="mailto:dpo@strapre.com" className="text-blue-600 underline">dpo@strapre.com</a>
              </p>
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
