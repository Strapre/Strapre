// app/feature-product/[id]/not-found.tsx
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Subscription Not Found
            </h1>
            <p className="text-gray-600">
              The subscription you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/feature-product" className="block">
              <Button className="w-full bg-[#CB0207] hover:bg-[#A50206] text-white py-3 rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Subscriptions
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full py-3 rounded-xl">
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}