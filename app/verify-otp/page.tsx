"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
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
    if (value && index < 5) {
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
    if (otpCode.length !== 6) {
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
      const response = await fetch("https://ga.vplaza.com.ng/api/v1/auth/verify-email", {
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

    const token = localStorage.getItem("temp_token")
    if (!token) {
      setError("Session expired. Please register again.")
      return
    }

    try {
      const response = await fetch("https://gadget.vplaza.com.ng/api/v1/auth/resend-otp", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Reset timer and disable resend button
        setCanResend(false)
        setResendTimer(55)
        setError("") // Clear any previous errors

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

        // Show success message (optional)
        console.log("OTP resent successfully")
      } else {
        setError(data.message || "Failed to resend OTP. Please try again.")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm ">
        <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className=" items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
                    <img src="/strapre-logo.jpg" alt="Strapre Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[#CB0207] font-bold text-xl">Strapre</span>
                </div>
              </div>

              
            <Link href="#">
                <Button className=" bg-[#CB0207] hover:bg-[#A50206] text-white text-[10px] md:text-[12px] px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  LOGIN / REGISTER
                </Button>
              </Link>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-120px)] w-full md:w-[90%] md:max-w-[1750px] mx-auto">
        {/* Left side - Mobile illustration (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-50">
          <div className="relative">
            <div className="relative w-full max-w-sm mx-auto">
              <img
                src="/strapre-otp.png"
                alt="Strapre Sign-in mockup"
                className="w-full h-auto object-contain"
              />
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
                    className="w-10 h-10 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
