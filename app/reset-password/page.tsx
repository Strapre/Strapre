<<<<<<< HEAD
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const storedEmail = localStorage.getItem("temporal_email")
    if (!storedEmail) {
      setError("No email found. Please restart the password reset process.")
    } else {
      setEmail(storedEmail)
    }
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("https://api.strapre.com/api/v1/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message || "Reset failed")
      }

      localStorage.removeItem("temporal_email")
      setSuccess(true)

      // Delay for 3 seconds before redirect
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
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

      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Illustration */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-100">
          <div className="relative">
            <div className="w-64 h-64 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <div className="text-6xl text-red-600 font-bold">!</div>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-40 relative">
                  <div className="w-16 h-16 bg-purple-900 rounded-full mx-auto mb-2 relative">
                    <div className="w-12 h-12 bg-purple-700 rounded-full absolute top-1 left-2"></div>
                  </div>
                  <div className="w-20 h-24 bg-purple-900 rounded-t-3xl mx-auto"></div>
                </div>
              </div>
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

        {/* Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-600 mb-2">Reset Password</h1>
              <p className="text-sm text-gray-500">Enter the OTP sent to <strong>{email}</strong></p>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-600">
                  Password reset successful! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                  OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the OTP"
                  required
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="relative">
                <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg pr-10"
                />
                <div
                  className="absolute top-[52%] right-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>

              <div className="relative">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg pr-10"
                />
                <div
                  className="absolute top-[52%] right-3 cursor-pointer"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || success}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
              >
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-gray-500">Remembered your password? </span>
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
=======
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const storedEmail = localStorage.getItem("temporal_email")
    if (!storedEmail) {
      setError("No email found. Please restart the password reset process.")
    } else {
      setEmail(storedEmail)
    }
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("https://api.strapre.com/api/v1/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message || "Reset failed")
      }

      localStorage.removeItem("temporal_email")
      setSuccess(true)

      // Delay for 3 seconds before redirect
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
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

      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Illustration */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-100">
          <div className="relative">
            <div className="w-64 h-64 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <div className="text-6xl text-red-600 font-bold">!</div>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-40 relative">
                  <div className="w-16 h-16 bg-purple-900 rounded-full mx-auto mb-2 relative">
                    <div className="w-12 h-12 bg-purple-700 rounded-full absolute top-1 left-2"></div>
                  </div>
                  <div className="w-20 h-24 bg-purple-900 rounded-t-3xl mx-auto"></div>
                </div>
              </div>
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

        {/* Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-600 mb-2">Reset Password</h1>
              <p className="text-sm text-gray-500">Enter the OTP sent to <strong>{email}</strong></p>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-600">
                  Password reset successful! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                  OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the OTP"
                  required
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="relative">
                <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg pr-10"
                />
                <div
                  className="absolute top-[52%] right-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>

              <div className="relative">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg pr-10"
                />
                <div
                  className="absolute top-[52%] right-3 cursor-pointer"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || success}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
              >
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-gray-500">Remembered your password? </span>
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
>>>>>>> 533c22393c774a56ed1968293eb2ddaf3c4ec728
