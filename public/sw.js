const CACHE_NAME = "Strapre-v1"
const urlsToCache = ["/", "/manifest.json", "/android/android-launchericon-192-192.png", "/android/android-launchericon-512-512.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener("fetch", (event) => {
  // Only intercept GET requests to the same origin
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})
