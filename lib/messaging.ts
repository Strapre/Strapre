// ============================================================
// In-app messaging – shared types & helpers
// API contract: /conversations, /messages (see ENDPOINTS in lib/api.ts)
// ============================================================

export interface UserSummary {
  id: string
  first_name: string | null
  last_name: string | null
  profile_picture: string | null
  store_name?: string | null
  store_slug?: string | null
  store_image?: string | null
}

export interface MessageProduct {
  id: string
  slug: string
  name: string
  price: string
  image_url: string | null
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  type: "text" | "product"
  body: string
  product: MessageProduct | null
  read_at: string | null
  created_at: string
  sender?: Partial<UserSummary>
}

export interface Conversation {
  id: string
  last_message_at: string | null
  users: UserSummary[]
  other_user: UserSummary
  unread_count?: number
  last_message?: ChatMessage | null
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ConversationsResponse {
  data: Conversation[]
  meta?: PaginationMeta
  auth_user_id?: string
}

export interface MessagesResponse {
  data: ChatMessage[]
  meta?: PaginationMeta
  auth_user_id?: string
  conversation?: { id: string; users: UserSummary[]; other_user: UserSummary }
}

/** Fired on window whenever messages are sent/read so the header badge can refresh. */
export const MESSAGES_UPDATED_EVENT = "strapre:messages-updated"

export function notifyMessagesUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MESSAGES_UPDATED_EVENT))
  }
}

/** Display name rule: store_name if non-empty, else "first_name last_name". */
export function getDisplayName(user?: Partial<UserSummary> | null): string {
  if (!user) return "Strapre user"
  if (user.store_name && user.store_name.trim()) return user.store_name.trim()
  const name = `${user.first_name || ""} ${user.last_name || ""}`.trim()
  return name || "Strapre user"
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/** Avatar: the store image when the user is shown by store name, else the profile picture. */
export function getAvatarUrl(user?: Partial<UserSummary> | null): string | null {
  if (!user) return null
  if (user.store_name && user.store_name.trim() && user.store_image) return user.store_image
  return user.profile_picture || user.store_image || null
}

export function formatNaira(price: string | number | null | undefined): string {
  const num = typeof price === "number" ? price : Number.parseFloat(String(price ?? ""))
  if (!Number.isFinite(num)) return "₦—"
  return `₦${num.toLocaleString()}`
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function formatClock(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

/** Short time for the inbox list: "3:42 PM", "Yesterday", "Mon", "12/03/26". */
export function formatListTime(iso?: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const now = new Date()
  if (isSameDay(d, now)) return formatClock(iso)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(d, yesterday)) return "Yesterday"
  const diffDays = (now.getTime() - d.getTime()) / 86400000
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" })
  return d.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" })
}

/** Day separator label inside a chat thread. */
export function formatDayLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const now = new Date()
  if (isSameDay(d, now)) return "Today"
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(d, yesterday)) return "Yesterday"
  return d.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  })
}

export function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/** Merge message lists by id, sorted oldest-first. */
export function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>()
  for (const m of existing) map.set(m.id, m)
  for (const m of incoming) map.set(m.id, m)
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
}

/** Remembers the current URL and sends the user to /login (the login page redirects back). */
export function redirectToLogin(router: { push: (href: string) => void }, returnTo?: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("redirect_after_login", returnTo || `${window.location.pathname}${window.location.search}`)
  }
  router.push("/login")
}
