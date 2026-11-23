"use client"

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft, Loader2, MessageCircle, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ENDPOINTS, authHeaders, authJsonHeaders, getCorrectImageUrl } from "@/lib/api"
import {
  type ChatMessage,
  type MessageProduct,
  type MessagesResponse,
  type UserSummary,
  dayKey,
  formatClock,
  formatDayLabel,
  formatNaira,
  getAvatarUrl,
  getDisplayName,
  getInitials,
  mergeMessages,
  notifyMessagesUpdated,
  redirectToLogin,
} from "@/lib/messaging"

const POLL_MS = 3000
const PAGE_SIZE = 50
const MAX_BODY_LENGTH = 2000

interface ChatThreadProps {
  token: string
  initialConversationId: string | null
  peerUserId: string | null
  productSlug: string | null
  peerFromList?: UserSummary
  fallbackMyId: string | null
  onBack: () => void
  onConversationResolved: (id: string, opts?: { created?: boolean }) => void
}

/** Product card shown inside a message bubble and as the attachment preview source. */
function ProductCard({ product, mine }: { product: MessageProduct; mine: boolean }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className={`block overflow-hidden rounded-xl border ${
        mine ? "border-white/20 bg-white" : "border-gray-200 bg-white"
      } hover:opacity-95 transition-opacity`}
    >
      <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getCorrectImageUrl(product.image_url)}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</p>
        <p className="text-sm font-bold text-[#CB0207]">{formatNaira(product.price)}</p>
      </div>
    </Link>
  )
}

export default function ChatThread({
  token,
  initialConversationId,
  peerUserId,
  productSlug,
  peerFromList,
  fallbackMyId,
  onBack,
  onConversationResolved,
}: ChatThreadProps) {
  const router = useRouter()
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [other, setOther] = useState<UserSummary | null>(peerFromList ?? null)
  const [fallbackPeer, setFallbackPeer] = useState<{ name: string; image: string | null } | null>(null)
  const [myId, setMyId] = useState<string | null>(fallbackMyId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [olderPage, setOlderPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loadingOlder, setLoadingOlder] = useState(false)

  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [attachment, setAttachment] = useState<MessageProduct | null>(null)
  const [attachmentLoading, setAttachmentLoading] = useState(!!productSlug)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const stickToBottomRef = useRef(true)
  const lastMessageIdRef = useRef<string | null>(null)
  const preserveScrollRef = useRef<number | null>(null)
  const conversationIdRef = useRef<string | null>(initialConversationId)
  conversationIdRef.current = conversationId

  useEffect(() => {
    if (peerFromList) setOther((prev) => prev ?? peerFromList)
  }, [peerFromList])

  useEffect(() => {
    if (fallbackMyId) setMyId((prev) => prev ?? fallbackMyId)
  }, [fallbackMyId])

  const handleUnauthorized = useCallback(() => redirectToLogin(router), [router])

  /** Fetches one page of messages and merges it in. Page 1 = newest. */
  const fetchMessages = useCallback(
    async (convId: string, page = 1): Promise<boolean> => {
      const res = await fetch(`${ENDPOINTS.conversationMessages(convId)}?page=${page}&limit=${PAGE_SIZE}`, {
        headers: authHeaders(localStorage.getItem("auth_token") || token),
      })
      if (res.status === 401) {
        handleUnauthorized()
        return false
      }
      if (res.status === 404) {
        setError("This conversation could not be found.")
        return false
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: MessagesResponse = await res.json()
      if (conversationIdRef.current !== convId) return false
      if (data.auth_user_id) setMyId(String(data.auth_user_id))
      if (data.conversation?.other_user) setOther(data.conversation.other_user)
      if (data.meta?.last_page) setLastPage(data.meta.last_page)
      const incoming = data.data || []
      // Page 1 marks incoming messages as read on the server
      if (page === 1 && incoming.some((m) => m.receiver_id === data.auth_user_id && !m.read_at)) {
        notifyMessagesUpdated()
      }
      setMessages((prev) => mergeMessages(prev, incoming))
      setError(null)
      return true
    },
    [token, handleUnauthorized],
  )

  // Initial load: existing conversation, or look up a thread with the peer
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        let convId = initialConversationId
        if (!convId && peerUserId) {
          const res = await fetch(ENDPOINTS.conversationWith(peerUserId), { headers: authHeaders(token) })
          if (res.status === 401) {
            handleUnauthorized()
            return
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          if (cancelled) return
          if (data?.data?.id) {
            convId = String(data.data.id)
            if (data.data.other_user) setOther(data.data.other_user)
            setConversationId(convId)
            conversationIdRef.current = convId
            onConversationResolved(convId)
          }
        }
        if (convId) {
          const ok = await fetchMessages(convId, 1)
          if (ok) notifyMessagesUpdated()
        }
      } catch (err) {
        console.error("Error loading conversation:", err)
        if (!cancelled) setError("Failed to load messages.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Attached product (opened from a product page)
  useEffect(() => {
    if (!productSlug) return
    let cancelled = false
    const run = async () => {
      setAttachmentLoading(true)
      try {
        const res = await fetch(ENDPOINTS.productBySlug(productSlug))
        if (!res.ok) return
        const data = await res.json()
        const p = data?.data
        if (!p || cancelled) return
        setAttachment({
          id: String(p.id),
          slug: p.slug,
          name: p.name,
          price: String(p.price),
          image_url: p.images?.[0]?.url || null,
        })
        if (p.store) {
          setFallbackPeer({ name: p.store.name || p.store.store_name || "Seller", image: p.store.store_image || null })
        }
      } catch (err) {
        console.error("Error loading attached product:", err)
      } finally {
        if (!cancelled) setAttachmentLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [productSlug])

  // Poll every 3s while the chat is open (and the tab is visible)
  useEffect(() => {
    if (!conversationId) return
    const interval = setInterval(() => {
      if (document.hidden) return
      fetchMessages(conversationId, 1).catch((err) => console.error("Error polling messages:", err))
    }, POLL_MS)
    return () => clearInterval(interval)
  }, [conversationId, fetchMessages])

  // Auto-scroll: follow new messages when the user is at the bottom (or just sent one)
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (preserveScrollRef.current !== null) {
      // Older messages were prepended; keep the viewport where it was
      el.scrollTop = el.scrollHeight - preserveScrollRef.current
      preserveScrollRef.current = null
      return
    }
    const last = messages[messages.length - 1]
    const lastId = last?.id ?? null
    if (lastId && lastId !== lastMessageIdRef.current) {
      const isMine = !!myId && last.sender_id === myId
      if (stickToBottomRef.current || isMine || lastMessageIdRef.current === null) {
        el.scrollTop = el.scrollHeight
      }
    }
    lastMessageIdRef.current = lastId
  }, [messages, myId])

  // Keep the bottom in view when the attachment preview / loading state changes layout
  useEffect(() => {
    const el = scrollRef.current
    if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight
  }, [attachment, loading])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  const loadOlder = async () => {
    if (!conversationId || loadingOlder || olderPage >= lastPage) return
    setLoadingOlder(true)
    try {
      const el = scrollRef.current
      if (el) preserveScrollRef.current = el.scrollHeight - el.scrollTop
      const ok = await fetchMessages(conversationId, olderPage + 1)
      if (ok) setOlderPage((p) => p + 1)
      else preserveScrollRef.current = null
    } catch (err) {
      preserveScrollRef.current = null
      console.error("Error loading older messages:", err)
    } finally {
      setLoadingOlder(false)
    }
  }

  const sendMessage = async () => {
    const body = input.trim()
    if (sending) return
    if (!body && !attachment) return
    if (body.length > MAX_BODY_LENGTH) {
      setSendError(`Message is too long (max ${MAX_BODY_LENGTH} characters).`)
      return
    }
    const receiverId = other?.id || peerUserId
    if (!conversationId && !receiverId) {
      setSendError("Can't figure out who to send this to.")
      return
    }

    setSending(true)
    setSendError(null)
    const payload: Record<string, string> = { body }
    if (receiverId) payload.receiver_id = receiverId
    else if (conversationId) payload.conversation_id = conversationId
    if (attachment) payload.product_id = attachment.id

    try {
      const res = await fetch(ENDPOINTS.messages, {
        method: "POST",
        headers: authJsonHeaders(localStorage.getItem("auth_token") || token),
        body: JSON.stringify(payload),
      })
      if (res.status === 401) {
        handleUnauthorized()
        return
      }
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setSendError(data?.message || "Message not sent. Please try again.")
        return
      }
      const message: ChatMessage | undefined = data?.data || data
      setInput("")
      setAttachment(null)
      stickToBottomRef.current = true
      if (message?.sender_id) setMyId((prev) => prev ?? String(message.sender_id))
      const newConvId = message?.conversation_id ? String(message.conversation_id) : null
      if (!conversationId && newConvId) {
        conversationIdRef.current = newConvId
        setConversationId(newConvId)
        onConversationResolved(newConvId, { created: true })
      }
      if (message?.id) setMessages((prev) => mergeMessages(prev, [message]))
      notifyMessagesUpdated()
      textareaRef.current?.focus()
    } catch (err) {
      console.error("Error sending message:", err)
      setSendError("Message not sent. Check your connection and try again.")
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendMessage()
    }
  }

  const name = other ? getDisplayName(other) : fallbackPeer?.name || (loading ? "" : "Seller")
  const avatar = other ? getAvatarUrl(other) : fallbackPeer?.image || null
  const canSend = !sending && (input.trim().length > 0 || !!attachment)

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-3 md:px-5 py-3 border-b border-gray-100 bg-white">
        <Button variant="ghost" size="icon" className="md:hidden rounded-xl -ml-1" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 ring-2 ring-[#CB0207]/10">
          {avatar && <AvatarImage src={getCorrectImageUrl(avatar)} alt={name} className="object-cover" />}
          <AvatarFallback className="bg-[#CB0207] text-white font-bold text-sm">{name ? getInitials(name) : ""}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          {name ? (
            <p className="font-semibold text-gray-900 truncate">{name}</p>
          ) : (
            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
          )}
          {other?.store_slug && other.store_name && (
            <Link href={`/store/${other.store_slug}`} className="text-xs text-[#CB0207] hover:underline">
              View store
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto bg-gray-50 px-3 md:px-6 py-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#CB0207]" />
          </div>
        ) : error && messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3">
            <AlertCircle className="h-8 w-8 text-[#CB0207]" />
            <p className="text-gray-700">{error}</p>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                if (conversationId) {
                  setLoading(true)
                  fetchMessages(conversationId, 1)
                    .catch(() => setError("Failed to load messages."))
                    .finally(() => setLoading(false))
                } else {
                  onBack()
                }
              }}
            >
              {conversationId ? "Try again" : "Back to messages"}
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 px-6">
            <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <MessageCircle className="h-7 w-7 text-[#CB0207]" />
            </div>
            <p className="font-medium text-gray-800">No messages yet</p>
            <p className="text-sm">
              {attachment ? "Ask the seller about this product below." : "Say hello to start the conversation."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {olderPage < lastPage && (
              <div className="flex justify-center pb-2">
                <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={loadOlder} disabled={loadingOlder}>
                  {loadingOlder && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  Load earlier messages
                </Button>
              </div>
            )}
            {messages.map((m, i) => {
              const mine = !!myId && m.sender_id === myId
              const showDay = i === 0 || dayKey(messages[i - 1].created_at) !== dayKey(m.created_at)
              return (
                <Fragment key={m.id}>
                  {showDay && (
                    <div className="flex justify-center py-2">
                      <span className="text-xs text-gray-500 bg-white border border-gray-100 rounded-full px-3 py-1 shadow-sm">
                        {formatDayLabel(m.created_at)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] md:max-w-[65%] rounded-2xl px-3 py-2 shadow-sm ${
                        mine ? "bg-[#CB0207] text-white rounded-br-md" : "bg-white text-gray-900 border border-gray-100 rounded-bl-md"
                      }`}
                    >
                      {m.type === "product" && m.product && (
                        <div className="mb-2 w-56 max-w-full">
                          <ProductCard product={m.product} mine={mine} />
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={`mt-1 text-[11px] text-right ${mine ? "text-white/75" : "text-gray-400"}`}>
                        {formatClock(m.created_at)}
                        {mine && m.read_at && " · Seen"}
                      </p>
                    </div>
                  </div>
                </Fragment>
              )
            })}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-gray-100 bg-white px-3 md:px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {attachmentLoading && !attachment && (
          <div className="mb-2 h-16 rounded-xl bg-gray-100 animate-pulse" />
        )}
        {attachment && (
          <div className="mb-2 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getCorrectImageUrl(attachment.image_url)}
              alt={attachment.name}
              className="h-12 w-12 rounded-lg object-cover bg-gray-200 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
              <p className="text-sm font-bold text-[#CB0207]">{formatNaira(attachment.price)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full flex-shrink-0"
              onClick={() => setAttachment(null)}
              aria-label="Remove product"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {sendError && <p className="mb-2 text-xs text-red-600">{sendError}</p>}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (sendError) setSendError(null)
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={MAX_BODY_LENGTH}
            placeholder={attachment ? "Hi, is this still available?" : "Type a message..."}
            className="flex-1 resize-none rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm max-h-32 min-h-[44px] focus:outline-none focus:border-[#CB0207] transition-colors"
            disabled={loading || (!!error && messages.length === 0 && !conversationId && !peerUserId)}
          />
          <Button
            onClick={sendMessage}
            disabled={!canSend || loading}
            className="h-11 w-11 rounded-full bg-[#CB0207] hover:bg-[#A50206] text-white p-0 flex-shrink-0"
            aria-label="Send"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
