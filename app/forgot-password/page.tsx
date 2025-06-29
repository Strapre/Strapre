"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Note: You'll need to implement the forgot password endpoint
      // For now, we'll simulate the request
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setSuccess(true)
    } catch (error) {
      setError("Failed to send reset email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-green-500 rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="text-gray-600">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <Link href="/login">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Back to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner */}
      <div className="bg-red-800 text-white text-center py-2 px-4 text-sm">
        Best Online store to connect vendors to vendors and vendors to customers
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-orange-500 font-bold text-xl">Strapre</span>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white px-6">LOGIN / REGISTER</Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Left side - Character illustration (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-100">
          <div className="relative">
            {/* Character with question mark */}
            <div className="w-64 h-64 relative">
              {/* Question mark */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <div className="text-6xl text-red-600 font-bold">?</div>
              </div>

              {/* Character */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-40 relative">
                  {/* Head */}
                  <div className="w-16 h-16 bg-purple-900 rounded-full mx-auto mb-2 relative">
                    <div className="w-12 h-12 bg-purple-700 rounded-full absolute top-1 left-2"></div>
                  </div>
                  {/* Body */}
                  <div className="w-20 h-24 bg-purple-900 rounded-t-3xl mx-auto"></div>
                </div>
              </div>

              {/* Speech bubble with dots */}
              <div className="absolute top-16 right-8 bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Reset password form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-600 mb-2">Reset Password</h1>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
              >
                {loading ? "SENDING..." : "VERIFY"}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-gray-500">Already have an account? </span>
              <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
