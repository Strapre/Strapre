"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [resendTimer, setResendTimer] = useState(55)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  useEffect(() => {
    // Get email from localStorage
    const tempEmail = localStorage.getItem("temp_email")
    if (tempEmail) {
      setEmail(tempEmail)
    } else {
      router.push("/register")
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const otpCode = otp.join("")
    if (otpCode.length !== 4) {
      setError("Please enter complete OTP")
      setLoading(false)
      return
    }

    const token = localStorage.getItem("temp_token")
    if (!token) {
      setError("Session expired. Please register again.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("https://gadg.vplaza.com.ng/api/v1/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          otp: otpCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Clear temporary storage
        localStorage.removeItem("temp_token")
        localStorage.removeItem("temp_email")
        // Store the token as auth token
        localStorage.setItem("auth_token", token)
        // Redirect to home page
        router.push("/complete-profile")
      } else {
        setError(data.message || "OTP verification failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    setCanResend(false)
    setResendTimer(55)

    // Start countdown again
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Here you would call the resend OTP API if available
    // For now, we'll just reset the timer
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

        {/* Right side - OTP form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-600 mb-2">OTP</h1>
              <p className="text-gray-600 mb-4">Create an account with us today</p>
              <p className="text-sm text-gray-600">
                Enter the OTP sent to <span className="text-red-600 font-medium">{email}</span>{" "}
                <Link href="/register" className="text-red-600 hover:text-red-700">
                  Edit
                </Link>
              </p>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP Input Fields */}
              <div className="flex justify-center space-x-4">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-16 h-16 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                ))}
              </div>

              {/* Resend Timer */}
              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Resend Code
                  </button>
                ) : (
                  <p className="text-gray-500">Resend Code: {resendTimer}s</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
              >
                {loading ? "VERIFYING..." : "VERIFY"}
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
