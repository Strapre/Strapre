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

        {/* Policy Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Strapre Privacy Policy</h1>
            <p className="text-gray-600">Effective Date: July 12, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Introduction</h2>
              <p>
                This Privacy Policy explains what personal data is collected when you use the Strapre platform (
                <a href="https://strapre.com" className="text-blue-600 underline">https://strapre.com</a>) and related services (the "Service"), how that data is used and shared.
              </p>
              <p><strong>BY USING THE SERVICE, YOU CONFIRM THAT:</strong></p>
              <ul className="list-disc list-inside">
                <li>You have read, understood, and agreed to this Privacy Policy</li>
                <li>You are at least 16 years old or have obtained parental/guardian consent</li>
              </ul>
              <p>If you do not agree, please discontinue use and contact us at <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a> for data deletion.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">1. Personal Data Controller</h2>
              <p>Strapre Marketplace Services, a company registered in Nigeria, is the controller of your personal data.</p>
              <p>Email: <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a></p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. Categories of Personal Data We Collect</h2>

              <h3 className="text-xl font-semibold mt-4">2.1 Information You Provide Directly</h3>
              <ul className="list-disc list-inside">
                <li>Full name, email address, phone number, address</li>
                <li>Listings, photos, videos, documents (e.g. CAC, ID)</li>
                <li>Account verification data (e.g. BVN for loans, CVs for jobs)</li>
                <li>Messages, chats, and reviews</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4">2.2 Data from Third Parties</h3>
              <ul className="list-disc list-inside">
                <li>Google, Apple, Facebook, Truecaller profile info</li>
                <li>Verification data from tools like Smile Identity (facial recognition, ID number, gender)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4">2.3 Automatically Collected Data</h3>
              <ul className="list-disc list-inside">
                <li>IP address, browser type, OS, device model</li>
                <li>Location data, click patterns, referral links</li>
                <li>Advertising identifiers (e.g. Google AAID, Apple IDFA)</li>
                <li>Cookies and tracking pixels (see Cookie Policy)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">3. Data Protection Principles</h2>
              <ul className="list-disc list-inside">
                <li>Lawful and transparent data use</li>
                <li>Accurate and minimal collection</li>
                <li>Secure storage and transfer</li>
                <li>Timely deletion upon request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. Purposes for Processing Your Data</h2>
              <ul className="list-disc list-inside">
                <li>Authenticate and register users</li>
                <li>Manage listings, chats, marketplace activity</li>
                <li>Enable payments and transactions</li>
                <li>Send marketing updates and platform announcements</li>
                <li>Personalize user experience (ads, suggestions)</li>
                <li>Investigate abuse and enforce terms</li>
                <li>Improve security and platform performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. Legal Grounds for Processing</h2>
              <ul className="list-disc list-inside">
                <li>Consent: cookies, marketing messages</li>
                <li>Contractual necessity: account access, payment processing</li>
                <li>Legitimate interest: fraud prevention, analytics</li>
                <li>Legal obligation: compliance with authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">6. Data Sharing and Disclosure</h2>
              <p>We may share your data with trusted third-party providers including:</p>
              <ul className="list-disc list-inside">
                <li>Cloud/hosting providers (e.g. Vercel, Firebase)</li>
                <li>Payment processors (e.g. Paystack, Flutterwave)</li>
                <li>Analytics and marketing partners (e.g. Meta, Google)</li>
                <li>Verification services (e.g. Smile Identity)</li>
                <li>Law enforcement or regulators when required</li>
              </ul>
              <p>
                While we require partners to uphold strong data protections, Strapre cannot be held liable for unauthorized actions by these third parties. In the event of a breach, we will notify affected users as required by law and take appropriate steps to mitigate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">7. Available Remedies</h2>
              <ul className="list-disc list-inside">
                <li>Request full account/data deletion</li>
                <li>Lodge complaints with regulatory authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">8. No Limitation Clause</h2>
              <p>We do not limit liability for breaches of this policy or Nigerian data protection regulations.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">9. Your Rights</h2>
              <ul className="list-disc list-inside">
                <li>Access or correct your data</li>
                <li>Delete your account</li>
                <li>Withdraw consent</li>
                <li>Opt out of marketing</li>
                <li>Object to automated processing</li>
                <li>File a complaint with the Nigerian Data Protection Commission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">10. Age Restrictions</h2>
              <p>
                We do not knowingly collect data from persons under 16. If you suspect otherwise, please contact <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">11. International Transfers</h2>
              <p>
                Your data may be processed or stored outside Nigeria using encrypted and legally-approved mechanisms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">12. Policy Updates</h2>
              <p>
                Strapre reserves the exclusive right to update this policy at any time. Changes may arise from legal, technological, or business needs. Significant updates will be communicated via email or platform notifications. Continued use after updates implies acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">13. Data Retention</h2>
              <ul className="list-disc list-inside">
                <li>As long as your account is active</li>
                <li>To comply with financial or legal regulations</li>
                <li>For a limited time after deletion (e.g., backups or audit logs)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">14. Contact Us</h2>
              <p>Email: <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a></p>
            </section>

            <section>
              <p className="text-center text-sm text-gray-500 border-t pt-4 mt-8">
                © {new Date().getFullYear()} Strapre Marketplace Services. All rights reserved.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
