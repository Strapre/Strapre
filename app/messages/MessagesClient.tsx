"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, MessageCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Header from "@/components/header"
import { ENDPOINTS, authHeaders, getCorrectImageUrl } from "@/lib/api"
import {
  type Conversation,
  type ConversationsResponse,
  type UserSummary,
  MESSAGES_UPDATED_EVENT,
  formatListTime,
  getAvatarUrl,
  getDisplayName,
  getInitials,
  redirectToLogin,
} from "@/lib/messaging"
import ChatThread from "./ChatThread"

const INBOX_POLL_MS = 15000

interface Selection {
  /** Stable key for the open chat; changing it remounts the thread. */
  key: string
  conversationId: string | null
  peerUserId: string | null
  productSlug: string | null
}

export default function MessagesClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cParam = searchParams.get("c")
  const toParam = searchParams.get("to")
  const productParam = searchParams.get("product")

  const [token, setToken] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [myId, setMyId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)
  const selectionRef = useRef<Selection | null>(null)
  selectionRef.current = selection

  // Auth check
  useEffect(() => {
    const t = localStorage.getItem("auth_token")
    if (!t) {
      redirectToLogin(router)
      return
    }
    setToken(t)
    try {
      const details = localStorage.getItem("userDetails")
      if (details) {
        const parsed = JSON.parse(details)
        if (parsed?.id) setMyId(String(parsed.id))
      }
    } catch {
      // ignore malformed cache
    }
    setAuthChecked(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Derive the open chat from the URL (?c=<conversationId> or ?to=<userId>&product=<slug>)
  useEffect(() => {
    const current = selectionRef.current
    if (cParam) {
      if (current && (current.key === cParam || current.conversationId === cParam)) return
      setSelection({ key: cParam, conversationId: cParam, peerUserId: null, productSlug: null })
    } else if (toParam) {
      const key = `to:${toParam}:${productParam || ""}`
      if (current && current.key === key) return
      setSelection({ key, conversationId: null, peerUserId: toParam, productSlug: productParam })
    } else {
      setSelection(null)
    }
  }, [cParam, toParam, productParam])

  const fetchConversations = useCallback(
    async (silent = false) => {
      const t = localStorage.getItem("auth_token")
      if (!t) {
        redirectToLogin(router)
        return
      }
      if (!silent) {
        setLoading(true)
        setError(null)
      }
      try {
        const res = await fetch(`${ENDPOINTS.conversations}?page=1&limit=50`, { headers: authHeaders(t) })
        if (res.status === 401) {
          redirectToLogin(router)
          return
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: ConversationsResponse = await res.json()
        if (data.auth_user_id) setMyId(String(data.auth_user_id))
        const active = selectionRef.current?.conversationId
        setConversations(
          (data.data || []).map((c) => (c.id === active ? { ...c, unread_count: 0 } : c)),
        )
        setError(null)
      } catch (err) {
        console.error("Error fetching conversations:", err)
        if (!silent) setError("Failed to load your conversations")
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [router],
  )

  // Initial load + background refresh of the inbox
  useEffect(() => {
    if (!authChecked) return
    fetchConversations()
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return
      fetchConversations(true)
    }, INBOX_POLL_MS)
    const onUpdated = () => fetchConversations(true)
    window.addEventListener(MESSAGES_UPDATED_EVENT, onUpdated)
    return () => {
      clearInterval(interval)
      window.removeEventListener(MESSAGES_UPDATED_EVENT, onUpdated)
    }
  }, [authChecked, fetchConversations])

  const openConversation = (id: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c)))
    router.push(`/messages?c=${encodeURIComponent(id)}`)
  }

  // Called by the thread once it knows the conversation id (existing thread found, or first message sent)
  const handleConversationResolved = useCallback(
    (id: string, opts?: { created?: boolean }) => {
      setSelection((prev) => (prev ? { ...prev, conversationId: id } : prev))
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c)))
      if (opts?.created) {
        // Keep the open thread mounted; just make the URL point at the real conversation
        router.replace(`/messages?c=${encodeURIComponent(id)}`)
        fetchConversations(true)
      }
    },
    [router, fetchConversations],
  )

  const peerFromList: UserSummary | undefined = useMemo(() => {
    if (!selection) return undefined
    if (selection.conversationId) {
      return conversations.find((c) => c.id === selection.conversationId)?.other_user
    }
    if (selection.peerUserId) {
      return conversations.find((c) => c.other_user?.id === selection.peerUserId)?.other_user
    }
    return undefined
  }, [selection, conversations])

  const activeConversationId = selection?.conversationId ?? null

  if (!authChecked || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#CB0207]" />
      </div>
    )
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 min-h-0 w-full max-w-[1500px] mx-auto md:px-6 lg:px-8 md:py-6">
        <div className="h-full flex bg-white md:rounded-2xl md:border md:border-gray-100 md:shadow-sm overflow-hidden">
          {/* Conversation list */}
          <aside
            className={`${selection ? "hidden md:flex" : "flex"} w-full md:w-[340px] lg:w-[380px] flex-shrink-0 flex-col border-r border-gray-100 min-h-0`}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => fetchConversations()}
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && conversations.length === 0 ? (
                <div className="space-y-1 p-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                      <div className="h-12 w-12 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/2 rounded bg-gray-200" />
                        <div className="h-3 w-3/4 rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error && conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                  <p className="text-gray-700 font-medium mb-3">{error}</p>
                  <Button onClick={() => fetchConversations()} className="bg-[#CB0207] hover:bg-[#A50206] text-white rounded-xl">
                    Try again
                  </Button>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                  <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-[#CB0207]" />
                  </div>
                  <p className="text-gray-900 font-semibold mb-1">No messages yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Find a product you like and tap &ldquo;Message Seller&rdquo; to start a conversation.
                  </p>
                  <Link href="/">
                    <Button className="bg-[#CB0207] hover:bg-[#A50206] text-white rounded-xl">Browse products</Button>
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {conversations.map((c) => {
                    const name = getDisplayName(c.other_user)
                    const avatar = getAvatarUrl(c.other_user)
                    const last = c.last_message
                    const mine = !!last && !!myId && last.sender_id === myId
                    const preview = last
                      ? last.type === "product" && last.product
                        ? `📦 ${last.product.name}`
                        : last.body
                      : "No messages yet"
                    const unread = c.unread_count || 0
                    const isActive = c.id === activeConversationId
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => openConversation(c.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            isActive ? "bg-red-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <Avatar className="h-12 w-12 ring-2 ring-[#CB0207]/10">
                            {avatar && <AvatarImage src={getCorrectImageUrl(avatar)} alt={name} className="object-cover" />}
                            <AvatarFallback className="bg-[#CB0207] text-white font-bold">{getInitials(name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`truncate text-sm ${unread > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>
                                {name}
                              </p>
                              <span className={`text-xs flex-shrink-0 ${unread > 0 ? "text-[#CB0207] font-semibold" : "text-gray-400"}`}>
                                {formatListTime(last?.created_at || c.last_message_at)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className={`truncate text-sm ${unread > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                                {mine && "You: "}
                                {preview}
                              </p>
                              {unread > 0 && (
                                <span className="flex-shrink-0 bg-[#CB0207] text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                                  {unread > 99 ? "99+" : unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Chat pane */}
          <section className={`${selection ? "flex" : "hidden md:flex"} flex-1 min-w-0 flex-col min-h-0`}>
            {selection ? (
              <ChatThread
                key={selection.key}
                token={token}
                initialConversationId={selection.conversationId}
                peerUserId={selection.peerUserId}
                productSlug={selection.productSlug}
                peerFromList={peerFromList}
                fallbackMyId={myId}
                onBack={() => router.push("/messages")}
                onConversationResolved={handleConversationResolved}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-gray-500">
                <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <MessageCircle className="h-10 w-10 text-[#CB0207]" />
                </div>
                <p className="font-semibold text-gray-800">Your messages</p>
                <p className="text-sm">Select a conversation to start chatting.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
