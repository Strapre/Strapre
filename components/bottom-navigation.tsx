"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, Heart, User } from "lucide-react"
import { ENDPOINTS, authHeaders } from "@/lib/api"

export default function BottomNavigation() {
  const pathname = usePathname()
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      fetch(ENDPOINTS.wishlist, {
        headers: authHeaders(token),
      })
        .then((res) => {
          if (res.ok) return res.json()
          return null
        })
        .then((data) => {
          if (data && data.data) {
            setWishlistCount(data.data.length)
          }
        })
        .catch((err) => console.error("Error fetching wishlist in bottom nav:", err))
    }
  }, [pathname])

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Categories",
      href: "/category",
      icon: LayoutGrid,
      isActive: pathname.startsWith("/category"),
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      isActive: pathname === "/wishlist",
      badge: wishlistCount > 0 ? wishlistCount : undefined,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      isActive: pathname === "/profile" || pathname.startsWith("/profile"),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-around md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.03)] px-2">
      {navItems.map((item, index) => {
        const Icon = item.icon
        return (
          <Link
            key={index}
            href={item.href}
            className="flex flex-col items-center justify-center flex-1 h-full relative group transition-all duration-200"
          >
            <div className="relative p-1">
              <Icon
                className={`h-5 w-5 transition-all duration-300 ${
                  item.isActive
                    ? "text-[#CB0207] scale-110 stroke-[2.5]"
                    : "text-gray-400 group-hover:text-gray-600 stroke-[1.8]"
                }`}
              />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 bg-[#CB0207] text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border border-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 font-medium transition-all duration-300 ${
                item.isActive ? "text-[#CB0207] font-semibold" : "text-gray-400"
              }`}
            >
              {item.label}
            </span>
            {item.isActive && (
              <span className="absolute bottom-1 w-1 h-1 bg-[#CB0207] rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
