"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, ArrowLeft, CheckCheck, Check, Loader2, RefreshCw, Dot, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Header from "@/components/header"
import Footer from "@/components/footer"

interface NotificationData {
  subject?: string
  message?: string
  store_id?: string
  store_name?: string
  slug?: string
  url?: string
}

interface Notification {
  id: string
  type: string
  notifiable_type: string
  notifiable_id: string
  data: NotificationData
  read_at: string | null
  created_at: string
  updated_at: string
}

interface NotificationResponse {
  notifications: {
    current_page: number
    data: Notification[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
  unread_count: number
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [markingAsRead, setMarkingAsRead] = useState<string[]>([])
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const router = useRouter()
  const observerTarget = useRef(null)

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchNotifications(1)
  }, [])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreNotifications()
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading])

  const fetchNotifications = async (page: number = 1, append: boolean = false) => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      if (!append) setLoading(true)
      setError(null)

      const response = await fetch(`https://api.strapre.com/api/v1/notifications?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const data: NotificationResponse = await response.json()
      
      if (append) {
        setNotifications(prev => [...prev, ...data.notifications.data])
      } else {
        setNotifications(data.notifications.data)
      }
      
      setUnreadCount(data.unread_count)
      setCurrentPage(data.notifications.current_page)
      setHasMore(data.notifications.next_page_url !== null)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setError("Failed to load notifications")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreNotifications = useCallback(() => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    fetchNotifications(currentPage + 1, true)
  }, [currentPage, hasMore, loadingMore])

  const markAsRead = async (notificationId: string) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    setMarkingAsRead(prev => [...prev, notificationId])

    try {
      const response = await fetch(`https://api.strapre.com/api/v1/notifications/${notificationId}/mark-as-read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read_at: new Date().toISOString() }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    } finally {
      setMarkingAsRead(prev => prev.filter(id => id !== notificationId))
    }
  }

  const markAllAsRead = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    setMarkingAllAsRead(true)

    try {
      const response = await fetch("https://api.strapre.com/api/v1/notifications/mark-as-read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({
            ...notification,
            read_at: notification.read_at || new Date().toISOString()
          }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    } finally {
      setMarkingAllAsRead(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    if (type.includes("StoreApproved")) return "✅"
    if (type.includes("Store")) return "🏪"
    if (type.includes("Order")) return "📦"
    if (type.includes("Payment")) return "💳"
    return "🔔"
  }

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification)
    setShowNotificationDialog(true)
    
    // Mark as read if unread
    if (!notification.read_at) {
      markAsRead(notification.id)
    }
  }

  const handleNotificationAction = (notification: Notification) => {
    setShowNotificationDialog(false)
    
    // Navigate to URL if available
    if (notification.data.url) {
      window.open(notification.data.url, "_blank")
    } else if (notification.data.store_id) {
      router.push(`/store/${notification.data.slug}`)
    }
  }

  const refreshNotifications = () => {
    setCurrentPage(1)
    setHasMore(true)
    fetchNotifications(1)
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB0207] border-t-transparent"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Header Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-lg hover:bg-gray-100 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#CB0207]" />
                <div>
                  <h1 className="text-lg font-bold text-gray-800">Notifications</h1>
                  <p className="text-xs text-gray-500">
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshNotifications}
                className="rounded-lg hover:bg-gray-100 h-8 w-8"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  disabled={markingAllAsRead}
                  size="sm"
                  className="bg-[#CB0207] hover:bg-[#A50206] text-white rounded-lg px-3 py-1 text-xs font-medium h-8"
                >
                  {markingAllAsRead ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <CheckCheck className="h-3 w-3 mr-1" />
                  )}
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshNotifications}
              className="mt-2 border-red-200 text-red-800 hover:bg-red-100 h-7 text-xs"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Compact Notifications List */}
        <div className="space-y-2">
          {notifications.length === 0 && !loading ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
              <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No notifications yet</h3>
              <p className="text-gray-500 text-sm">We'll notify you when something important happens.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-0 shadow-sm ${
                  notification.read_at ? "bg-white" : "bg-blue-50/50 border-l-2 border-l-[#CB0207]"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Compact Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`font-medium text-sm mb-1 line-clamp-1 ${notification.read_at ? "text-gray-800" : "text-gray-900"}`}>
                            {notification.data.subject || "Notification"}
                          </h3>
                          <p className={`text-xs mb-2 line-clamp-2 leading-relaxed ${notification.read_at ? "text-gray-600" : "text-gray-700"}`}>
                            {notification.data.message}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>{formatTimeAgo(notification.created_at)}</span>
                            {notification.data.store_name && (
                              <>
                                <Dot className="h-3 w-3" />
                                <span className="text-[#CB0207] font-medium truncate max-w-24">
                                  {notification.data.store_name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* View Info Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedNotification(notification)
                              setShowNotificationDialog(true)
                              if (!notification.read_at) {
                                markAsRead(notification.id)
                              }
                            }}
                            className="rounded-md hover:bg-gray-100 text-gray-500 hover:text-[#CB0207] h-6 w-6"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          
                          {!notification.read_at && (
                            <>
                              <div className="w-2 h-2 bg-[#CB0207] rounded-full"></div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                                disabled={markingAsRead.includes(notification.id)}
                                className="rounded-md hover:bg-gray-100 text-gray-500 hover:text-[#CB0207] h-6 w-6"
                              >
                                {markingAsRead.includes(notification.id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-4 border-[#CB0207] border-t-transparent"></div>
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={observerTarget} className="h-2" />

          {/* End of List Indicator */}
          {!hasMore && notifications.length > 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-xs">You've reached the end</p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Detail Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xl">{selectedNotification ? getNotificationIcon(selectedNotification.type) : "🔔"}</span>
                Notification Details
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotificationDialog(false)}
                className="rounded-xl hover:bg-gray-100 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {selectedNotification.data.subject || "Notification"}
                </h3>
              </div>
              
              {/* Message */}
              <div>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {selectedNotification.data.message}
                </p>
              </div>
              
              {/* Metadata */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatTimeAgo(selectedNotification.created_at)}</span>
                  {selectedNotification.data.store_name && (
                    <span className="text-[#CB0207] font-medium">
                      {selectedNotification.data.store_name}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setShowNotificationDialog(false)}
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50"
                >
                  Close
                </Button>
                {(selectedNotification.data.url || selectedNotification.data.store_id) && (
                  <Button
                    onClick={() => handleNotificationAction(selectedNotification)}
                    className="flex-1 bg-[#CB0207] hover:bg-[#A50206] text-white rounded-xl"
                  >
                    {selectedNotification.data.url ? "Open Link" : "View Store"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}