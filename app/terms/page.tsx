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
            <div className="items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
                  <img src="/strapre-logo.jpg" alt="Strapre Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-[#CB0207] font-bold text-xl">Strapre</span>
              </div>
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

        {/* Terms and Conditions Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Terms and Conditions</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Strapre, a multi-vendor e-commerce platform specializing in gadgets and technology 
                products, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, 
                please do not use our platform. These terms apply to all users of the platform, including customers, vendors, 
                and visitors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Platform Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                Strapre operates as a marketplace connecting buyers and sellers of gadgets and technology products. We provide 
                the platform and infrastructure for transactions but do not directly sell products. Individual vendors are 
                responsible for their product listings, descriptions, pricing, and fulfillment of orders.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">3.1 General Account Requirements</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You must be at least 18 years old to create an account. You are responsible for maintaining the 
                    confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">3.2 Customer Accounts</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Customers must provide accurate personal information including name, email address, phone number, 
                    and shipping address. You agree to update this information as needed to ensure accuracy.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">3.3 Seller/Vendor Account Requirements</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To become a seller on Strapre, you must meet additional verification requirements to ensure platform 
                    integrity and customer protection:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li><strong>Certificate of Incorporation (CAC):</strong> All business entities must provide a valid 
                    Certificate of Incorporation from the Corporate Affairs Commission (CAC) of Nigeria</li>
                    <li><strong>Personal Identification:</strong> Individual sellers must provide valid government-issued 
                    photo identification (National ID, International Passport, or Driver's License)</li>
                    <li><strong>Business Registration:</strong> Sole proprietors must provide business registration 
                    certificates where applicable</li>
                    <li><strong>Tax Information:</strong> Valid Tax Identification Number (TIN) or evidence of tax 
                    registration</li>
                    <li><strong>Bank Account Verification:</strong> Verified bank account information for payment processing</li>
                    <li><strong>Contact Information:</strong> Valid business address and contact details</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    All documentation must be current, legible, and verified by our team before seller account activation. 
                    Strapre reserves the right to request additional documentation or verification at any time.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Seller Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                As a seller on Strapre, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate and complete product information and descriptions</li>
                <li>Maintain adequate inventory levels for listed products</li>
                <li>Honor all pricing and promotional offers</li>
                <li>Process orders promptly and maintain reasonable shipping times</li>
                <li>Provide customer service and handle returns/refunds according to policies</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Maintain up-to-date business registration and identification documents</li>
                <li>Pay applicable fees and commissions to Strapre</li>
                <li>Not engage in fraudulent or deceptive practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Customer Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                As a customer, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate shipping and billing information</li>
                <li>Make timely payments for purchases</li>
                <li>Review product descriptions and specifications before purchasing</li>
                <li>Use products only as intended and described</li>
                <li>Follow return and refund policies</li>
                <li>Treat sellers and other users with respect</li>
                <li>Not engage in fraudulent activities or abuse platform features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Product Listings and Content</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Sellers are responsible for ensuring their product listings are accurate, complete, and comply with our guidelines:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Products must be accurately described with clear, high-quality images</li>
                <li>Prohibited items include counterfeit goods, illegal items, and hazardous materials</li>
                <li>Pricing must be clearly displayed with any applicable taxes and fees</li>
                <li>Content must not infringe on intellectual property rights</li>
                <li>Product availability must be accurately maintained</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Payment and Fees</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">7.1 Customer Payments</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Payments are processed through secure third-party payment processors. Customers are responsible for 
                    all applicable taxes, fees, and charges related to their purchases.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">7.2 Seller Fees</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Sellers agree to pay applicable commission fees, transaction fees, and other charges as outlined 
                    in the seller agreement. Fee schedules may be updated with reasonable notice.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Shipping and Delivery</h2>
              <p className="text-gray-700 leading-relaxed">
                Sellers are responsible for shipping products to customers in accordance with stated delivery timelines. 
                Strapre is not responsible for shipping delays, damage, or loss during transit. Customers should address 
                shipping issues directly with the seller or shipping carrier.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Returns and Refunds</h2>
              <p className="text-gray-700 leading-relaxed">
                Return and refund policies are established by individual sellers and must be clearly communicated to customers. 
                Strapre may facilitate dispute resolution but is not responsible for processing returns or refunds directly. 
                All returns must comply with the seller's stated policy and applicable consumer protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                Users must respect intellectual property rights. Sellers warrant that their products and listings do not 
                infringe on copyrights, trademarks, patents, or other proprietary rights. Strapre reserves the right to 
                remove infringing content and terminate accounts that violate intellectual property rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The following activities are strictly prohibited:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Selling counterfeit, illegal, or prohibited items</li>
                <li>Manipulating reviews or ratings</li>
                <li>Engaging in fraudulent transactions</li>
                <li>Circumventing platform fees or payment systems</li>
                <li>Spamming or harassment of other users</li>
                <li>Attempting to hack or disrupt platform operations</li>
                <li>Creating multiple accounts to evade restrictions</li>
                <li>Providing false identification or business documentation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Account Suspension and Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                Strapre reserves the right to suspend or terminate accounts for violations of these terms, fraudulent activity, 
                or other reasons that may harm the platform or its users. We will provide reasonable notice when possible, 
                but immediate termination may be necessary in cases of severe violations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Strapre acts as a marketplace facilitator and is not liable for disputes between buyers and sellers, 
                product quality issues, shipping problems, or other issues arising from transactions. Our liability is 
                limited to the maximum extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms are governed by the laws of Nigeria. Any disputes will be resolved in the courts of Lagos State, 
                Nigeria, or through binding arbitration as determined by Strapre.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms and Conditions from time to time. Users will be notified of significant changes, 
                and continued use of the platform constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> support@strapre.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> +234 (0) 813 869 5216</p>
                <p className="text-gray-700"><strong>Address:</strong> Strapre Privacy Office, Benin, Nigeria</p>
              </div>
            </section>

            <section>
              <p className="text-gray-600 text-sm mt-8 pt-4 border-t border-gray-200">
                By using Strapre, you acknowledge that you have read, understood, and agree to be bound by these 
                Terms and Conditions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}