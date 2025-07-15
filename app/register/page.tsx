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

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }

    return errors
  }

  useEffect(() => {
    if (password) {
      const errors = validatePassword(password)
      setPasswordErrors(errors)
    } else {
      setPasswordErrors([])
    }
  }, [password])

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  // Email validation
  if (!validateEmail(email)) {
    setError("Please enter a valid email address");
    setLoading(false);
    return;
  }

  // Password validation
  const passwordValidationErrors = validatePassword(password);
  if (passwordValidationErrors.length > 0) {
    setError(passwordValidationErrors[0]);
    setLoading(false);
    return;
  }

  if (password !== passwordConfirmation) {
    setError("Passwords do not match");
    setLoading(false);
    return;
  }

  if (!agreedToTerms) {
    setError("You must agree to the terms and conditions");
    setLoading(false);
    return;
  }

  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  formData.append("password_confirmation", passwordConfirmation);

  console.log("📤 Payload to backend (FormData):");
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  try {
    const response = await fetch("https://api.strapre.com/api/v1/auth/register", {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json", // Expecting JSON from backend
      },
      body: formData,
    });

    const data = await response.json();
    console.log("🚀 Response status:", response.status);
    console.log("📦 Response body:", data);

    if (response.ok) {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("temp_email", email);
      router.push("/verify-otp");
    } else {
      setError(data.message || "Registration failed");
    }
  } catch (error) {
    console.error("❌ Network or server error:", error);
    setError("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white shadow-sm ">
        <div className="w-full md:w-[90%] md:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-24 h-auto overflow-hidden flex items-center justify-center bg-white">
                  <img
                    src="/straprelogo.png"  // ⚠️ Also removed the extra space in filename
                    alt="Strapre Logo"
                    className="w-full h-full object-contain"
                  />
              </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-120px)] w-full md:w-[90%] md:max-w-[1750px] mx-auto">
        {/* Left side - Mobile illustration (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-50">
          <div className="relative">
            <div className="relative w-full max-w-sm mx-auto">
              <img
                src="/strapre-signin.png"
                alt="Strapre Sign-in mockup"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Right side - Register form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-600 mb-2">Register</h1>
              <p className="text-gray-600">Create an account with us today</p>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
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

              <div className="relative">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordErrors.length > 0 && (
                  <div className="mt-1">
                    {passwordErrors.map((error, index) => (
                      <p key={index} className="text-xs text-red-600">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordErrors.length === 0
                              ? "bg-green-500 w-full"
                              : password.length >= 6
                                ? "bg-yellow-500 w-2/3"
                                : "bg-red-500 w-1/3"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs ${
                          passwordErrors.length === 0
                            ? "text-green-600"
                            : password.length >= 6
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {passwordErrors.length === 0 ? "Strong" : password.length >= 6 ? "Medium" : "Weak"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <Label htmlFor="passwordConfirmation" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="passwordConfirmation"
                    type={showPasswordConfirmation ? "text" : "password"}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordConfirmation && password !== passwordConfirmation && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex flex-row items-start space-x-2">
  <input
    id="terms"
    type="checkbox"
    checked={agreedToTerms}
    onChange={(e) => setAgreedToTerms(e.target.checked)}
    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-0.5"
  />
  <label htmlFor="terms" className="text-[12px] text-gray-700 leading-5">
    I agree to the{" "}
    <Link
      href="/terms"
      className="text-red-600 hover:text-red-700 underline font-medium"
    >
      Terms and Conditions
    </Link>{" "}
    and{" "}
    <Link
      href="/privacy-policy"
      className="text-red-600 hover:text-red-700 underline font-medium"
    >
      Privacy Policy
    </Link>
  </label>
</div>


              <Button
                type="submit"
                disabled={loading || !agreedToTerms}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  loading || !agreedToTerms
                    ? "bg-gray-400 cursor-not-allowed text-gray-600"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {loading ? "REGISTERING..." : "REGISTER"}
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