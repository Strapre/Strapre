// ============================================================
// Strapre API – Centralized configuration
// All fetch calls across the app should import from here.
// To change the backend URL, update BASE_URL only.
// ============================================================

// export const BASE_URL = "http://localhost:5000/api/v1"
// export const IMAGE_BASE_URL = "http://localhost:5000"
export const BASE_URL = "https://api.strapre.com/api/v1"
export const IMAGE_BASE_URL = "https://api.strapre.com"

// ── Endpoint paths ────────────────────────────────────────────
export const ENDPOINTS = {
  // Auth
  getProfile:      `${BASE_URL}/auth/get-profile`,
  login:           `${BASE_URL}/auth/login`,
  register:        `${BASE_URL}/auth/register`,
  verifyOtp:       `${BASE_URL}/auth/verify-otp`,
  verifyEmail:     `${BASE_URL}/auth/verify-email`,
  resendOtp:       `${BASE_URL}/auth/resend-otp`,
  forgotPassword:  `${BASE_URL}/auth/forgot-password`,
  resetPassword:   `${BASE_URL}/auth/reset-password`,
  updateProfile:   `${BASE_URL}/auth/update-profile`,
  completeProfile: `${BASE_URL}/auth/complete-profile`,

  // Store
  myStore:         `${BASE_URL}/mystore`,
  stores:          `${BASE_URL}/stores`,
  storeBySlug:     (slug: string) => `${BASE_URL}/stores/${slug}`,
  storeProducts:   (slug: string) => `${BASE_URL}/stores/${slug}/products`,
  createStore:     `${BASE_URL}/stores`,
  editStore:       (slug: string) => `${BASE_URL}/stores/${slug}`,
  storeCompleteProfile: `${BASE_URL}/stores/complete-profile`,

  // Products
  products:        `${BASE_URL}/products`,
  productBySlug:   (slug: string) => `${BASE_URL}/products/${slug}`,
  searchProducts:  `${BASE_URL}/products/search`,
  myStoreProducts: `${BASE_URL}/mystore/products`,
  myProducts:      `${BASE_URL}/my-products`,
  createProduct:   `${BASE_URL}/mystore/products`,
  updateProduct:   (slug: string) => `${BASE_URL}/mystore/products/${slug}`,
  deleteProduct:   (slug: string) => `${BASE_URL}/mystore/products/${slug}`,
  productsByCategory: (categoryId: string) => `${BASE_URL}/products/category/${categoryId}`,

  // Categories
  categories:      `${BASE_URL}/categories`,
  categoryById:    (id: string) => `${BASE_URL}/categories/${id}`,

  // Location
  states:          `${BASE_URL}/states`,
  lgasByState:     (stateSlug: string) => `${BASE_URL}/states/${stateSlug}/lgas`,

  // Wishlist
  wishlist:        `${BASE_URL}/wishlist`,
  removeWishlist:  (productId: string) => `${BASE_URL}/wishlist/${productId}`,

  // Adverts / Banners
  advertsDummy:    `${BASE_URL}/adverts/dummy`,
  adverts:         `${BASE_URL}/adverts`,
  myAdverts:       `${BASE_URL}/my-adverts`,
  bannerRequest:   `${BASE_URL}/banner-requests`,
  advertPlans:     `${BASE_URL}/advert-plans`,

  // Notifications
  notifications:   `${BASE_URL}/notifications`,

  // Reviews / Ratings
  reviews:         (productId: string) => `${BASE_URL}/products/${productId}/reviews`,

  // Featured products
  featureProduct:  `${BASE_URL}/feature-product`,
  featureProductById: (id: string) => `${BASE_URL}/feature-product/${id}`,
  featuredPlans:   `${BASE_URL}/featured-plans`,
  myFeaturedSubscriptions: `${BASE_URL}/featured-subscriptions/my-subscriptions`,
  myFeatured:      `${BASE_URL}/my-featured`,
  featuredSubscriptionById: (id: string) => `${BASE_URL}/featured-subscriptions/${id}`,
  featuredSubscriptionAddProducts: `${BASE_URL}/featured-subscriptions/add-products`,
  featuredSubscriptionRemoveProducts: `${BASE_URL}/featured-subscriptions/remove-products`,

  // Subscriptions / Payments
  subscriptions:   `${BASE_URL}/subscriptions`,
  initPayment:     `${BASE_URL}/payments/initialize`,
  verifyPayment:   (reference: string) => `${BASE_URL}/payments/verify/${reference}`,
  payFeatureProduct: `${BASE_URL}/payments/feature-product`,
  payBookAdvert:   `${BASE_URL}/payments/book-advert`,
} as const

// ── Shared auth headers helper ─────────────────────────────────
export function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  }
}

export function authJsonHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  }
}

export const jsonHeaders: HeadersInit = {
  Accept: "application/json",
  "Content-Type": "application/json",
}

// ── Generic fetch wrapper ──────────────────────────────────────
interface FetchOptions extends RequestInit {
  timeoutMs?: number
}

export async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeoutMs = 15000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// ── Image URL Normalizer Helper ─────────────────────────────────
export function getCorrectImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg"
  const cleanUrl = String(url).trim()

  if (cleanUrl.startsWith("data:")) return cleanUrl

  const isInternal = /^(https?:\/\/)?(www\.)?(api\.strapre\.com|localhost:5000|127\.0\.0\.1:5000)/i.test(cleanUrl)
  const isRelative = !/^https?:\/\//i.test(cleanUrl)

  let finalUrl = cleanUrl
  if (isInternal || isRelative) {
    const path = cleanUrl.replace(/^(https?:\/\/)?(www\.)?(api\.strapre\.com|localhost:5000|127\.0\.0\.1:5000)/i, "")
    const normalizedPath = path.startsWith("/") ? path : `/${path}`
    finalUrl = `${IMAGE_BASE_URL}${normalizedPath}`
  }

  // Add a version query parameter to bust any browser-cached CORS/CORP errors from previous server states
  if (finalUrl.includes("?")) {
    return `${finalUrl}&v=2`
  }
  return `${finalUrl}?v=2`
}

// ── Global Fetch Interceptor for JWT Refresh ─────────────────────
if (typeof window !== "undefined") {
  const originalFetch = window.fetch
  let isRefreshing = false
  let refreshSubscribers: ((token: string) => void)[] = []

  const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb)
  }

  const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token))
    refreshSubscribers = []
  }

  window.fetch = async function (url, options) {
    // Perform the original request
    const response = await originalFetch(url, options)

    // If 401 Unauthorized, intercept and attempt token refresh
    const urlStr = String(url)
    if (
      response.status === 401 &&
      !urlStr.includes("/auth/refresh") &&
      !urlStr.includes("/auth/login") &&
      !urlStr.includes("/auth/admin-login")
    ) {
      const refreshToken = localStorage.getItem("refresh_token")
      if (!refreshToken) {
        return response // No refresh token available, let the 401 fail
      }

      if (!isRefreshing) {
        isRefreshing = true
        try {
          const refreshRes = await originalFetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          })

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json()
            const newAccessToken = refreshData.token
            const newRefreshToken = refreshData.refresh_token

            localStorage.setItem("auth_token", newAccessToken)
            if (newRefreshToken) {
              localStorage.setItem("refresh_token", newRefreshToken)
            }

            isRefreshing = false
            onRefreshed(newAccessToken)
          } else {
            // Refresh token has expired/revoked: clear storage and redirect
            localStorage.removeItem("auth_token")
            localStorage.removeItem("refresh_token")
            isRefreshing = false
            window.location.href = "/login"
            return response
          }
        } catch (err) {
          isRefreshing = false
          return response
        }
      }

      // Queue concurrent requests and resolve them with the new token
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          const newOptions = { ...options }
          const headers = new Headers(newOptions.headers as HeadersInit)
          headers.set("Authorization", `Bearer ${newToken}`)
          newOptions.headers = headers
          resolve(originalFetch(url, newOptions))
        })
      })
    }

    return response
  }
}
