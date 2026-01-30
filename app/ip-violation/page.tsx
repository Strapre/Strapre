<<<<<<< HEAD
"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ClaimsPolicyPage() {
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
            <h1 className="text-3xl font-bold text-red-600 mb-2">Notice for Claims of Intellectual Property Violations</h1>
            <p className="text-gray-600">Last Updated: July 12, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">1. Copyright Infringement Notification</h2>
              <p className="text-gray-700 leading-relaxed">
                If you are a copyright owner (or an agent thereof) and believe that content posted on the Platform infringes your copyright,
                you may file a formal notice by submitting a Notification of Copyright Infringement to our support email at <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a>.
              </p>
              <p className="text-gray-700 leading-relaxed">Your notice must include:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf</li>
                <li>A clear description of the copyrighted work that you claim has been infringed</li>
                <li>Identification of the allegedly infringing content, including the URL or a description sufficient to locate it</li>
                <li>Your contact information (email address and phone number preferred)</li>
                <li>A good faith statement: <em>“I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law.”</em></li>
                <li>A statement under penalty of perjury that the information provided is accurate and that the submitter is authorized to act on behalf of the copyright owner</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We recommend seeking legal advice before submitting a claim, as false reports may result in liability for damages.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Upon receiving a valid claim, Strapre may:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Remove or disable access to the infringing content</li>
                <li>Notify the content provider of the alleged infringement</li>
                <li>Terminate user access in cases of repeated violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">2. Trademark Infringement Notification</h2>
              <p className="text-gray-700 leading-relaxed">
                If you are a trademark owner or an authorized agent and believe your trademark is being misused on our Platform, you may file a Notification of Trademark Infringement to <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a>.
              </p>
              <p className="text-gray-700 leading-relaxed">Your trademark complaint must include:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>A physical or electronic signature of the trademark owner or authorized agent</li>
                <li>Identification of the infringing content and its location (URL)</li>
                <li>A valid trademark certificate including:</li>
                <ul className="list-disc ml-6 text-gray-700">
                  <li>Trademark name</li>
                  <li>Registration number</li>
                  <li>Jurisdiction of registration</li>
                  <li>Registered products/services</li>
                  <li>Trademark owner's legal name and address</li>
                </ul>
                <li>Contact information (email preferred)</li>
                <li>A good faith statement: <em>“I have a good faith belief that the use of the trademark described above is not authorized by the trademark owner, its agent, or by law.”</em></li>
                <li>A statement under penalty of perjury confirming the accuracy and authorization to act on behalf of the trademark owner</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">Strapre may respond by:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Removing or disabling the offending material</li>
                <li>Notifying the involved user(s)</li>
                <li>Terminating repeat infringers’ accounts</li>
              </ul>
            </section>

            <section className="bg-red-50 border border-red-200 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-red-700">3. Important Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                Receiving or acting upon an infringement notice does not constitute Strapre’s admission of liability.
                We reserve the right to pursue legal remedies against violators of intellectual property laws and do not provide legal representation or indemnification to users involved in alleged infringements.
              </p>
              <p className="text-gray-700 leading-relaxed">
                For all inquiries, contact: <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a>
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
=======
"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ClaimsPolicyPage() {
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
            <h1 className="text-3xl font-bold text-red-600 mb-2">Notice for Claims of Intellectual Property Violations</h1>
            <p className="text-gray-600">Last Updated: July 12, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">1. Copyright Infringement Notification</h2>
              <p className="text-gray-700 leading-relaxed">
                If you are a copyright owner (or an agent thereof) and believe that content posted on the Platform infringes your copyright,
                you may file a formal notice by submitting a Notification of Copyright Infringement to our support email at <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a>.
              </p>
              <p className="text-gray-700 leading-relaxed">Your notice must include:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf</li>
                <li>A clear description of the copyrighted work that you claim has been infringed</li>
                <li>Identification of the allegedly infringing content, including the URL or a description sufficient to locate it</li>
                <li>Your contact information (email address and phone number preferred)</li>
                <li>A good faith statement: <em>“I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law.”</em></li>
                <li>A statement under penalty of perjury that the information provided is accurate and that the submitter is authorized to act on behalf of the copyright owner</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We recommend seeking legal advice before submitting a claim, as false reports may result in liability for damages.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Upon receiving a valid claim, Strapre may:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Remove or disable access to the infringing content</li>
                <li>Notify the content provider of the alleged infringement</li>
                <li>Terminate user access in cases of repeated violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">2. Trademark Infringement Notification</h2>
              <p className="text-gray-700 leading-relaxed">
                If you are a trademark owner or an authorized agent and believe your trademark is being misused on our Platform, you may file a Notification of Trademark Infringement to <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a>.
              </p>
              <p className="text-gray-700 leading-relaxed">Your trademark complaint must include:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>A physical or electronic signature of the trademark owner or authorized agent</li>
                <li>Identification of the infringing content and its location (URL)</li>
                <li>A valid trademark certificate including:</li>
                <ul className="list-disc ml-6 text-gray-700">
                  <li>Trademark name</li>
                  <li>Registration number</li>
                  <li>Jurisdiction of registration</li>
                  <li>Registered products/services</li>
                  <li>Trademark owner's legal name and address</li>
                </ul>
                <li>Contact information (email preferred)</li>
                <li>A good faith statement: <em>“I have a good faith belief that the use of the trademark described above is not authorized by the trademark owner, its agent, or by law.”</em></li>
                <li>A statement under penalty of perjury confirming the accuracy and authorization to act on behalf of the trademark owner</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">Strapre may respond by:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Removing or disabling the offending material</li>
                <li>Notifying the involved user(s)</li>
                <li>Terminating repeat infringers’ accounts</li>
              </ul>
            </section>

            <section className="bg-red-50 border border-red-200 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-red-700">3. Important Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                Receiving or acting upon an infringement notice does not constitute Strapre’s admission of liability.
                We reserve the right to pursue legal remedies against violators of intellectual property laws and do not provide legal representation or indemnification to users involved in alleged infringements.
              </p>
              <p className="text-gray-700 leading-relaxed">
                For all inquiries, contact: <a href="mailto:support@strapre.com" className="text-blue-600 underline">support@strapre.com</a>
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
>>>>>>> 533c22393c774a56ed1968293eb2ddaf3c4ec728
